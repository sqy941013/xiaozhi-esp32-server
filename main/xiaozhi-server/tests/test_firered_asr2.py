import os
import sys
import tempfile
import unittest

import httpx


SERVER_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if SERVER_ROOT not in sys.path:
    sys.path.insert(0, SERVER_ROOT)

# Provider imports initialize logging and other shared modules. Seed a hermetic
# configuration first so this unit test never depends on data/.config.yaml.
import config.settings
from core.utils.cache.manager import CacheType, cache_manager

config.settings.config_file_valid = True
cache_manager.set(
    CacheType.CONFIG,
    "main_config",
    {
        "log": {
            "data_dir": "/tmp/xiaozhi-firered-asr2-tests/data",
            "log_dir": "/tmp/xiaozhi-firered-asr2-tests/logs",
            "log_level": "ERROR",
        }
    },
)

from core.providers.asr.base import ASRProviderBase
from core.providers.asr.firered_asr2 import ASRProvider, _transcription_url


class FireRedASR2ProviderTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.provider = ASRProvider(
            {
                "base_url": "http://asr.test:8002",
                "output_dir": self.temp_dir.name,
                "return_timestamp": False,
            }
        )

    async def asyncTearDown(self):
        await self.provider.close()
        self.temp_dir.cleanup()

    def _artifacts(self):
        pcm = b"\x00\x00" * 1600
        return ASRProviderBase.AudioArtifacts(
            pcm_frames=[pcm],
            pcm_bytes=pcm,
            file_path=None,
            temp_path=None,
        )

    async def test_posts_in_memory_wav_and_returns_text(self):
        captured = {}

        async def handler(request: httpx.Request):
            captured["url"] = str(request.url)
            captured["content_type"] = request.headers.get("content-type", "")
            captured["body"] = await request.aread()
            return httpx.Response(
                200,
                json={
                    "text": "  开放时间早上九点至下午五点  ",
                    "confidence": 0.997,
                    "duration_seconds": 5.616,
                    "rtf": 0.102,
                },
            )

        self.provider._client = httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
            trust_env=False,
        )
        text, file_path = await self.provider.speech_to_text(
            [], "test-session", self._artifacts()
        )

        self.assertEqual("开放时间早上九点至下午五点", text)
        self.assertIsNone(file_path)
        self.assertEqual(
            "http://asr.test:8002/v1/audio/transcriptions", captured["url"]
        )
        self.assertIn("multipart/form-data", captured["content_type"])
        self.assertIn(b"audio.wav", captured["body"])
        self.assertIn(b"RIFF", captured["body"])
        self.assertIn(b"return_timestamp", captured["body"])
        self.assertIn(b"false", captured["body"])

    async def test_http_error_returns_empty_text(self):
        async def handler(_request: httpx.Request):
            return httpx.Response(503, json={"detail": "unavailable"})

        self.provider._client = httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
            trust_env=False,
        )
        text, _ = await self.provider.speech_to_text(
            [], "test-session", self._artifacts()
        )
        self.assertEqual("", text)

    def test_normalizes_service_and_endpoint_urls(self):
        cases = {
            "http://host:8002": "http://host:8002/v1/audio/transcriptions",
            "http://host:8002/": "http://host:8002/v1/audio/transcriptions",
            "http://host:8002/v1": "http://host:8002/v1/audio/transcriptions",
            "http://host:8002/v1/audio/transcriptions": (
                "http://host:8002/v1/audio/transcriptions"
            ),
        }
        for configured, expected in cases.items():
            with self.subTest(configured=configured):
                self.assertEqual(expected, _transcription_url(configured))

    def test_rejects_invalid_service_url(self):
        for value in ("", "192.168.123.225:8002", "ftp://host/asr"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    _transcription_url(value)


if __name__ == "__main__":
    unittest.main()
