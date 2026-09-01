import asyncio
import json
import unittest
from concurrent.futures import Future
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, call, patch

# Importing provider modules initializes their loggers. Seed a hermetic config
# first so protocol unit tests never contact manager-api or depend on data files.
import config.settings
from core.utils.cache.manager import CacheType, cache_manager

config.settings.config_file_valid = True
cache_manager.set(
    CacheType.CONFIG,
    "main_config",
    {
        "log": {
            "data_dir": "/tmp/xiaozhi-web-chat-tests/data",
            "log_dir": "/tmp/xiaozhi-web-chat-tests/logs",
            "log_level": "ERROR",
        }
    },
)

from core.connection import ConnectionHandler
from core.utils.dialogue import Dialogue, Message
from core.websocket_server import parse_web_chat_request


class WebChatRequestTest(unittest.TestCase):
    def test_only_exact_web_chat_path_is_privileged(self):
        parsed, ticket = parse_web_chat_request(
            "/xiaozhi/v1/web-chat?ticket=one_time"
        )
        self.assertEqual("/xiaozhi/v1/web-chat", parsed.path)
        self.assertEqual("one_time", ticket)

        _, ticket = parse_web_chat_request(
            "/xiaozhi/v1/web-chat-admin?ticket=one_time"
        )
        self.assertIsNone(ticket)

        _, ticket = parse_web_chat_request(
            "/xiaozhi/v1/web-chat/?ticket=one_time"
        )
        self.assertIsNone(ticket)

    def test_missing_duplicate_and_oversized_tickets_are_rejected(self):
        invalid_paths = [
            "/xiaozhi/v1/web-chat",
            "/xiaozhi/v1/web-chat?ticket=",
            "/xiaozhi/v1/web-chat?ticket=one&ticket=two",
            f"/xiaozhi/v1/web-chat?ticket={'x' * 129}",
        ]
        for path in invalid_paths:
            with self.subTest(path=path):
                with self.assertRaises(ValueError):
                    parse_web_chat_request(path)


class WebChatRoutingTest(unittest.IsolatedAsyncioTestCase):
    def handler(self):
        handler = object.__new__(ConnectionHandler)
        handler.bind_completed_event = asyncio.Event()
        handler.bind_completed_event.set()
        handler.abort_web_chat_turn = AsyncMock()
        handler.components_ready_event = asyncio.Event()
        handler.components_ready_event.set()
        handler.finish_web_chat = AsyncMock()
        handler.last_activity_time = 0
        handler.llm = object()
        handler.need_bind = False
        handler.web_chat_initialization_error = None
        handler._send_web_chat_event = AsyncMock()
        handler.websocket = SimpleNamespace(
            close=AsyncMock(),
            send=AsyncMock(),
        )
        return handler

    async def test_binary_and_device_capabilities_are_rejected(self):
        handler = self.handler()

        await ConnectionHandler._route_web_chat_message(handler, b"audio")
        handler.websocket.close.assert_awaited_once_with(
            code=1008, reason="不支持二进制输入"
        )

        handler = self.handler()
        await ConnectionHandler._route_web_chat_message(
            handler, json.dumps({"type": "mcp", "payload": {}})
        )
        handler._send_web_chat_event.assert_awaited_once()
        self.assertEqual(
            "capability_not_allowed",
            handler._send_web_chat_event.await_args.kwargs["code"],
        )

    async def test_text_input_is_trimmed_and_sanitized_before_dispatch(self):
        handler = self.handler()
        with patch("core.connection.handleTextMessage", new_callable=AsyncMock) as handle:
            await ConnectionHandler._route_web_chat_message(
                handler,
                json.dumps(
                    {
                        "type": "listen",
                        "state": "detect",
                        "mode": "auto",
                        "text": "  remember this  ",
                        "client_message_id": "message-1",
                        "mcp": True,
                        "speaker": "forged",
                    }
                ),
            )

        handle.assert_awaited_once()
        dispatched = json.loads(handle.await_args.args[1])
        self.assertEqual(
            {
                "type": "listen",
                "state": "detect",
                "mode": "manual",
                "text": "remember this",
                "client_message_id": "message-1",
            },
            dispatched,
        )

    async def test_finish_is_handled_without_entering_device_dispatch(self):
        handler = self.handler()
        with patch("core.connection.handleTextMessage", new_callable=AsyncMock) as handle:
            await ConnectionHandler._route_web_chat_message(
                handler, json.dumps({"type": "session", "action": "finish"})
            )

        handler.finish_web_chat.assert_awaited_once_with()
        handle.assert_not_awaited()

    async def test_abort_is_handled_by_the_bounded_web_turn_lifecycle(self):
        handler = self.handler()
        with patch("core.connection.handleTextMessage", new_callable=AsyncMock) as handle:
            await ConnectionHandler._route_web_chat_message(
                handler, json.dumps({"type": "abort"})
            )

        handler.abort_web_chat_turn.assert_awaited_once_with()
        handle.assert_not_awaited()

    async def test_four_thousand_multibyte_characters_are_accepted(self):
        handler = self.handler()
        text = "记" * 4000
        with patch("core.connection.handleTextMessage", new_callable=AsyncMock) as handle:
            await ConnectionHandler._route_web_chat_message(
                handler,
                json.dumps(
                    {
                        "type": "listen",
                        "state": "detect",
                        "text": text,
                        "client_message_id": "message-2",
                    },
                    ensure_ascii=False,
                ),
            )

        handle.assert_awaited_once()
        self.assertEqual(text, json.loads(handle.await_args.args[1])["text"])

    async def test_abort_resolves_the_active_turn_as_cancelled(self):
        handler = object.__new__(ConnectionHandler)
        completed = Future()
        completed.set_result(True)
        handler.is_web_chat = True
        handler.web_chat_turn_id = "turn-1"
        handler.web_chat_client_message_id = "message-1"
        handler.web_chat_future = completed
        handler.web_chat_turn_outcome = None
        handler.client_abort = False
        handler.clear_queues = Mock()
        handler.clearSpeakStatus = Mock()
        handler._report_web_chat_status = AsyncMock()
        handler._send_web_chat_event = AsyncMock()
        handler.websocket = SimpleNamespace(close=AsyncMock())

        await ConnectionHandler.abort_web_chat_turn(handler)

        self.assertTrue(handler.client_abort)
        self.assertIsNone(handler.web_chat_turn_id)
        handler._report_web_chat_status.assert_awaited_once_with("READY", "IDLE")
        handler._send_web_chat_event.assert_awaited_once_with(
            "turn_completed", turn_id="turn-1", outcome="cancelled"
        )

    async def test_initialization_fails_closed_when_ready_state_cannot_be_saved(self):
        handler = object.__new__(ConnectionHandler)
        handler.is_web_chat = True
        handler.components_ready_event = asyncio.Event()
        handler.web_chat_initialization_error = None
        handler._report_web_chat_status = AsyncMock(side_effect=[False, False])
        handler._send_web_chat_event = AsyncMock()
        handler.websocket = SimpleNamespace(close=AsyncMock())

        await ConnectionHandler._complete_web_chat_initialization(handler, True)

        self.assertTrue(handler.components_ready_event.is_set())
        self.assertEqual("无法确认网页会话状态", handler.web_chat_initialization_error)
        handler._send_web_chat_event.assert_awaited_once_with(
            "error", code="initialization_failed", message="无法确认网页会话状态"
        )
        handler.websocket.close.assert_awaited_once_with(
            code=1011, reason="网页对话初始化失败"
        )

    async def test_turn_fails_closed_when_active_state_cannot_be_saved(self):
        handler = object.__new__(ConnectionHandler)
        handler.is_web_chat = True
        handler.web_chat_finishing = False
        handler.web_chat_future = None
        handler.web_chat_turn_id = None
        handler.web_chat_client_message_id = None
        handler.web_chat_sequence = 0
        handler.web_chat_turn_outcome = None
        handler.client_is_speaking = False
        handler._report_web_chat_status = AsyncMock(return_value=False)
        handler._send_web_chat_event = AsyncMock()

        started = await ConnectionHandler.begin_web_chat_turn(handler, "message-1")

        self.assertFalse(started)
        self.assertIsNone(handler.web_chat_turn_id)
        self.assertIsNone(handler.web_chat_client_message_id)
        handler._send_web_chat_event.assert_awaited_once_with(
            "error",
            code="session_state_unavailable",
            message="无法确认网页会话状态，请重新连接",
        )

    async def test_finalizing_state_is_reported_before_waiting_for_active_turn(self):
        handler = object.__new__(ConnectionHandler)
        active_turn = Future()
        handler.is_web_chat = True
        handler.web_chat_finalize_lock = asyncio.Lock()
        handler.web_chat_memory_finalized = False
        handler.web_chat_finishing = False
        handler.web_chat_future = active_turn
        handler.client_abort = False
        handler._report_web_chat_status = AsyncMock(return_value=True)
        handler._send_web_chat_event = AsyncMock()
        handler._wait_for_web_chat_reports = AsyncMock()
        handler.dialogue = SimpleNamespace(dialogue=[])
        handler.memory = None
        handler.session_id = "session-1"

        finalizing = asyncio.create_task(
            ConnectionHandler._finalize_web_chat(handler, send_to_client=False)
        )
        await asyncio.sleep(0)

        handler._report_web_chat_status.assert_awaited_once_with(
            "FINISHING", "PENDING"
        )
        self.assertTrue(handler.client_abort)
        self.assertFalse(finalizing.done())

        active_turn.set_result(True)
        self.assertEqual("SKIPPED", await finalizing)
        handler._report_web_chat_status.assert_has_awaits(
            [
                call("FINISHING", "PENDING"),
                call("CLOSED", "SKIPPED", "当前智能体未启用可保存的记忆"),
            ]
        )


class IncrementalMemoryPersistenceTest(unittest.IsolatedAsyncioTestCase):
    def handler(self, side_effect, is_web_chat=False):
        handler = object.__new__(ConnectionHandler)
        handler.config = {
            "selected_module": {"Memory": "Memory_mem0ai"},
            "Memory": {"Memory_mem0ai": {"type": "mem0ai"}},
        }
        handler.dialogue = Dialogue()
        save_memory = (
            AsyncMock(side_effect=side_effect)
            if isinstance(side_effect, (list, tuple, Exception))
            else AsyncMock(return_value=side_effect)
        )
        handler.memory = SimpleNamespace(save_memory=save_memory)
        handler.memory_save_lock = asyncio.Lock()
        handler.memory_save_tasks = set()
        handler.memory_persisted_message_ids = set()
        handler.memory_commit_count = 0
        handler.memory_no_change_count = 0
        handler.session_id = "session-1"
        handler.is_web_chat = is_web_chat
        handler._send_web_chat_event = AsyncMock()
        bound_logger = SimpleNamespace(info=Mock(), error=Mock())
        handler.logger = SimpleNamespace(bind=Mock(return_value=bound_logger))
        return handler

    async def test_only_completed_unsaved_turns_are_persisted_once(self):
        handler = self.handler(
            [
                {"results": [{"memory": "长期事实"}]},
                {"results": []},
            ],
            is_web_chat=True,
        )
        first_user = Message(role="user", content="请长期记住我的生日。")
        first_assistant = Message(role="assistant", content="好的。")
        second_user = Message(role="user", content="今天有点冷。")
        handler.dialogue.put(first_user)
        handler.dialogue.put(first_assistant)
        handler.dialogue.put(second_user)

        status = await ConnectionHandler._persist_pending_memories(
            handler, notify_web=True
        )

        self.assertEqual("COMMITTED", status)
        saved_messages = handler.memory.save_memory.await_args_list[0].args[0]
        self.assertEqual([first_user, first_assistant], saved_messages)
        handler._send_web_chat_event.assert_awaited_once_with(
            "memory_updated",
            memory_status="COMMITTED",
            message="长期记忆已更新",
        )

        second_assistant = Message(role="assistant", content="注意保暖。")
        handler.dialogue.put(second_assistant)
        status = await ConnectionHandler._persist_pending_memories(handler)
        self.assertEqual("NO_CHANGE", status)
        saved_messages = handler.memory.save_memory.await_args_list[1].args[0]
        self.assertEqual([second_user, second_assistant], saved_messages)

        status = await ConnectionHandler._persist_pending_memories(handler)
        self.assertEqual("SKIPPED", status)
        self.assertEqual(2, handler.memory.save_memory.await_count)

    async def test_failed_turn_remains_pending_for_retry(self):
        handler = self.handler(
            [RuntimeError("mem0 unavailable"), {"results": [{"memory": "生日"}]}]
        )
        handler.dialogue.put(Message(role="user", content="请记住你的生日。"))
        handler.dialogue.put(Message(role="assistant", content="记住了。"))

        first_status = await ConnectionHandler._persist_pending_memories(handler)
        self.assertEqual("FAILED", first_status)
        self.assertEqual(set(), handler.memory_persisted_message_ids)

        retry_status = await ConnectionHandler._persist_pending_memories(handler)
        self.assertEqual("COMMITTED", retry_status)
        self.assertEqual(2, handler.memory.save_memory.await_count)

    async def test_empty_extraction_is_handled_and_not_retried(self):
        handler = self.handler({"results": []})
        handler.dialogue.put(Message(role="user", content="把音量调到85。"))
        handler.dialogue.put(Message(role="assistant", content="已经调好了。"))

        self.assertEqual(
            "NO_CHANGE", await ConnectionHandler._persist_pending_memories(handler)
        )
        self.assertEqual(
            "SKIPPED", await ConnectionHandler._persist_pending_memories(handler)
        )
        self.assertEqual(1, handler.memory.save_memory.await_count)
        self.assertEqual(1, handler.memory_no_change_count)


if __name__ == "__main__":
    unittest.main()
