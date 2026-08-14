import asyncio
import queue

from core.providers.tts.base import TTSProviderBase, logger
from core.providers.tts.dto.dto import ContentType, SentenceType


TAG = __name__


class WebChatTTS(TTSProviderBase):
    """Text-only output adapter for the management-console chat.

    The existing conversation pipeline uses the TTS queues as its streaming
    boundary. Web chat reuses that boundary but emits text deltas directly and
    never calls a speech provider or sends binary audio to the browser.
    """

    def __init__(self, config=None):
        super().__init__(config or {}, delete_audio_file=True)

    async def text_to_speak(self, text, output_file):
        return None

    def tts_text_priority_thread(self):
        while not self.conn.stop_event.is_set():
            try:
                message = self.tts_text_queue.get(timeout=1)
                if message.sentence_id != self.conn.sentence_id:
                    continue

                if message.sentence_type == SentenceType.FIRST:
                    self.current_sentence_id = message.sentence_id
                    self.tts_stop_request = False
                    self.tts_text_buff = []
                elif message.content_type == ContentType.TEXT:
                    text = message.content_detail or ""
                    if text:
                        self.tts_text_buff.append(text)
                        future = asyncio.run_coroutine_threadsafe(
                            self.conn.send_web_chat_assistant_delta(text),
                            self.conn.loop,
                        )
                        future.result(timeout=10)

                if message.sentence_type == SentenceType.LAST:
                    full_text = "".join(self.tts_text_buff).strip()
                    if full_text:
                        # Preserve the normal chat-history reporting contract,
                        # but with no generated audio attached.
                        self.tts_audio_queue.put(
                            (SentenceType.FIRST, [], full_text, message.sentence_id)
                        )
                    self.tts_audio_queue.put(
                        (SentenceType.LAST, [], None, message.sentence_id)
                    )
            except queue.Empty:
                continue
            except Exception as error:
                logger.bind(tag=TAG).error(
                    f"网页会话文本输出失败: {type(error).__name__}: {error}"
                )
