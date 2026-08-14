import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

# Provider imports initialize their loggers. Seed a hermetic config before
# importing the vision handler so tests never read data/.config.yaml.
import config.settings
from core.utils.cache.manager import CacheType, cache_manager

config.settings.config_file_valid = True
cache_manager.set(
    CacheType.CONFIG,
    "main_config",
    {
        "log": {
            "data_dir": "/tmp/xiaozhi-vision-binding-tests/data",
            "log_dir": "/tmp/xiaozhi-vision-binding-tests/logs",
            "log_level": "ERROR",
        }
    },
)

from config.config_loader import get_config_from_api_async
from core.api.vision_device_bindings import (
    VisionDeviceBindings,
    normalize_device_id,
)
from core.api.vision_handler import VisionHandler


class VisionDeviceBindingsTest(unittest.TestCase):
    def test_mac_addresses_are_normalized_but_opaque_ids_remain_strict(self):
        self.assertEqual(
            "44:1b:f6:fe:22:00", normalize_device_id("44-1B-F6-FE-22-00")
        )
        self.assertEqual(
            "44:1b:f6:fe:22:00", normalize_device_id("441BF6FE2200")
        )
        self.assertEqual("Controller-A", normalize_device_id(" Controller-A "))

    def test_only_the_controller_and_its_explicit_camera_are_authorized(self):
        bindings = VisionDeviceBindings(
            {"44:1B:F6:FE:22:00": ["44-1b-f6-d8-de-00"]}
        )

        self.assertEqual(
            "44:1b:f6:fe:22:00",
            bindings.resolve_controller_device_id(
                "44:1b:f6:fe:22:00", "44:1B:F6:FE:22:00"
            ),
        )
        self.assertEqual(
            "44:1b:f6:fe:22:00",
            bindings.resolve_controller_device_id(
                "44:1b:f6:fe:22:00", "44:1b:f6:d8:de:00"
            ),
        )
        self.assertIsNone(
            bindings.resolve_controller_device_id(
                "44:1b:f6:fe:22:00", "44:1b:f6:00:00:01"
            )
        )
        self.assertIsNone(
            bindings.resolve_controller_device_id(
                "44:1b:f6:d8:de:00", "44:1b:f6:fe:22:00"
            )
        )

    def test_ambiguous_or_malformed_bindings_fail_closed(self):
        with self.assertRaises(ValueError):
            VisionDeviceBindings(["not-a-mapping"])
        with self.assertRaises(ValueError):
            VisionDeviceBindings(
                {
                    "controller-a": ["camera-a"],
                    "controller-b": ["camera-a"],
                }
            )


class VisionHandlerBindingTest(unittest.IsolatedAsyncioTestCase):
    async def _run_bound_camera_request(self, client_id):
        controller_id = "44:1b:f6:fe:22:00"
        camera_id = "44:1b:f6:d8:de:00"
        base_config = {
            "read_config_from_api": True,
            "selected_module": {},
            "server": {"auth_key": "test-key"},
        }
        private_config = {
            "selected_module": {"VLLM": "VLLM_Test"},
            "VLLM": {"VLLM_Test": {"type": "openai"}},
        }

        handler = object.__new__(VisionHandler)
        handler.config = base_config
        handler.auth = Mock()
        handler.vision_device_bindings = VisionDeviceBindings(
            {controller_id: [camera_id]}
        )
        handler._verify_auth_token = Mock(return_value=(True, controller_id))
        handler._add_cors_headers = Mock()
        handler.logger = SimpleNamespace(
            bind=lambda **_kwargs: SimpleNamespace(
                debug=Mock(), info=Mock(), warning=Mock(), error=Mock()
            )
        )

        question_field = SimpleNamespace(text=AsyncMock(return_value="画面里有什么"))
        image_field = SimpleNamespace(read=AsyncMock(return_value=b"test-image"))
        reader = SimpleNamespace(
            next=AsyncMock(side_effect=[question_field, image_field])
        )
        request = SimpleNamespace(
            headers={"Device-Id": camera_id, "Client-Id": client_id},
            multipart=AsyncMock(return_value=reader),
        )
        vllm = SimpleNamespace(response=Mock(return_value="测试画面"))

        with (
            patch(
                "core.api.vision_handler.get_private_config_from_api",
                new_callable=AsyncMock,
                return_value=private_config,
            ) as get_private_config,
            patch("core.api.vision_handler.is_valid_image_file", return_value=True),
            patch("core.api.vision_handler.create_instance", return_value=vllm),
        ):
            response = await VisionHandler.handle_post(handler, request)

        self.assertEqual(200, response.status)
        self.assertEqual(True, json.loads(response.text)["success"])
        return get_private_config, base_config, controller_id

    async def test_bound_camera_uses_controller_identity_for_model_lookup(self):
        get_private_config, base_config, controller_id = (
            await self._run_bound_camera_request("camera-client")
        )
        get_private_config.assert_awaited_once_with(
            base_config, controller_id, "camera-client"
        )

    async def test_missing_camera_client_id_falls_back_to_controller_id(self):
        get_private_config, base_config, controller_id = (
            await self._run_bound_camera_request("")
        )
        get_private_config.assert_awaited_once_with(
            base_config, controller_id, controller_id
        )


class VisionBindingConfigLoaderTest(unittest.IsolatedAsyncioTestCase):
    async def test_api_mode_preserves_local_vision_bindings(self):
        raw_bindings = {"controller-a": ["camera-a"]}
        local_config = {
            "server": {
                "ip": "0.0.0.0",
                "port": 8000,
                "http_port": 8003,
                "vision_explain": "http://localhost:8003/mcp/vision/explain",
                "vision_device_bindings": raw_bindings,
                "auth_key": "test-key",
            },
            "manager-api": {"url": "http://manager", "secret": "secret"},
        }
        manager_config = {
            "server": {"auth": {"enabled": True}},
            "selected_module": {},
        }

        with (
            patch("config.config_loader.init_service"),
            patch(
                "config.config_loader.get_server_config",
                new_callable=AsyncMock,
                return_value=manager_config,
            ),
        ):
            result = await get_config_from_api_async(local_config)

        self.assertEqual(raw_bindings, result["server"]["vision_device_bindings"])


if __name__ == "__main__":
    unittest.main()
