import os
import time
from typing import List, Optional, Tuple
from urllib.parse import urlparse

import httpx

from config.logger import setup_logging
from core.providers.asr.base import ASRProviderBase
from core.providers.asr.dto.dto import InterfaceType


TAG = __name__
logger = setup_logging()


def _as_bool(value, default=False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"true", "1", "yes", "on"}


def _positive_float(value, default: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


def _transcription_url(base_url: str) -> str:
    url = (base_url or "").strip().rstrip("/")
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("FireRedASR2 需要有效的 HTTP(S) 服务地址")
    if url.endswith("/v1/audio/transcriptions"):
        return url
    if url.endswith("/v1"):
        return f"{url}/audio/transcriptions"
    return f"{url}/v1/audio/transcriptions"


class ASRProvider(ASRProviderBase):
    """FireRedASR2-AED whole-utterance REST provider."""

    def __init__(self, config: dict, delete_audio_file: bool = True):
        super().__init__()
        self.interface_type = InterfaceType.NON_STREAM
        self.api_url = _transcription_url(
            config.get("base_url") or config.get("api_url", "")
        )
        self.api_key = str(config.get("api_key") or "").strip()
        self.return_timestamp = _as_bool(config.get("return_timestamp"), False)
        self.connect_timeout = _positive_float(config.get("connect_timeout"), 3.0)
        self.request_timeout = _positive_float(config.get("request_timeout"), 30.0)
        self.output_dir = config.get("output_dir") or "tmp/"
        self.delete_audio_file = delete_audio_file
        self._client: Optional[httpx.AsyncClient] = None
        os.makedirs(self.output_dir, exist_ok=True)

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers = {"Accept": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            self._client = httpx.AsyncClient(
                headers=headers,
                timeout=httpx.Timeout(
                    self.request_timeout,
                    connect=self.connect_timeout,
                ),
                follow_redirects=True,
                # LAN services must not be routed through a host/container proxy.
                trust_env=False,
            )
        return self._client

    async def speech_to_text(
        self,
        opus_data: List[bytes],
        session_id: str,
        artifacts=None,
    ) -> Tuple[Optional[str], Optional[str]]:
        if artifacts is None or not artifacts.pcm_bytes:
            return "", None

        wav_data = self._pcm_to_wav(artifacts.pcm_bytes)
        if not wav_data:
            return "", artifacts.file_path

        started_at = time.monotonic()
        try:
            response = await self._get_client().post(
                self.api_url,
                files={"file": ("audio.wav", wav_data, "audio/wav")},
                data={
                    "return_timestamp": str(self.return_timestamp).lower(),
                },
            )
            response.raise_for_status()
            payload = response.json()
            text = payload.get("text", "")
            if not isinstance(text, str):
                raise ValueError("FireRedASR2 返回的 text 字段不是字符串")

            elapsed = time.monotonic() - started_at
            logger.bind(tag=TAG).info(
                "FireRedASR2识别耗时: "
                f"{elapsed:.3f}s | 音频: {payload.get('duration_seconds', 'unknown')}s | "
                f"RTF: {payload.get('rtf', 'unknown')} | "
                f"置信度: {payload.get('confidence', 'unknown')}"
            )
            return text.strip(), artifacts.file_path
        except httpx.TimeoutException:
            logger.bind(tag=TAG).error(
                f"FireRedASR2请求超时（{self.request_timeout:.1f}s）"
            )
        except httpx.HTTPStatusError as error:
            logger.bind(tag=TAG).error(
                f"FireRedASR2请求失败（HTTP {error.response.status_code}）"
            )
        except (httpx.RequestError, ValueError) as error:
            logger.bind(tag=TAG).error(f"FireRedASR2识别失败: {error}")
        except Exception as error:
            logger.bind(tag=TAG).error(
                f"FireRedASR2识别发生未预期错误: {error}", exc_info=True
            )
        return "", artifacts.file_path

    async def close(self):
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
