import os
import sys
import unittest

import httpx


SERVER_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if SERVER_ROOT not in sys.path:
    sys.path.insert(0, SERVER_ROOT)

# Plugin imports initialize the shared logger. Seed a hermetic config so the
# tests never depend on the deployment's data/.config.yaml.
import config.settings
from core.utils.cache.manager import CacheType, cache_manager

config.settings.config_file_valid = True
cache_manager.set(
    CacheType.CONFIG,
    "main_config",
    {
        "log": {
            "data_dir": "/tmp/xiaozhi-anysearch-tests/data",
            "log_dir": "/tmp/xiaozhi-anysearch-tests/logs",
            "log_level": "ERROR",
        }
    },
)

from plugins_func.functions import web_search as search_module
from plugins_func.register import Action


def _success_response(title="AnySearch docs"):
    return {
        "code": 0,
        "message": "success",
        "request_id": "request-1",
        "data": {
            "results": [
                {
                    "title": title,
                    "url": "https://www.anysearch.com/docs",
                    "snippet": "Official search API documentation.",
                    "content": "unused full content",
                }
            ],
            "metadata": {"total_results": 1, "search_time_ms": 12},
        },
    }


class AnySearchWebSearchTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        search_module._ROUND_ROBIN_POSITIONS.clear()

    def test_normalizes_management_console_key_values(self):
        self.assertEqual(
            ["key-a", "key-b", "key-c"],
            search_module._normalize_api_keys(" key-a\nkey-b; key-a，key-c "),
        )
        self.assertEqual(
            ["key-a", "key-b"],
            search_module._normalize_api_keys('["key-a", "key-b"]'),
        )

    async def test_posts_official_payload_and_formats_results(self):
        captured = {}

        async def handler(request: httpx.Request):
            captured["authorization"] = request.headers.get("authorization")
            captured["client"] = request.headers.get("x-anysearch-client")
            captured["json"] = __import__("json").loads(await request.aread())
            return httpx.Response(200, json=_success_response())

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            result = await search_module._search_anysearch(
                ["key-a"],
                "xiaozhi search",
                4,
                zone="intl",
                language="en",
                tag="code.doc",
                client=client,
            )

        self.assertEqual("Bearer key-a", captured["authorization"])
        self.assertEqual(search_module.ANYSEARCH_CLIENT_HEADER, captured["client"])
        self.assertEqual(
            {
                "query": "xiaozhi search",
                "max_results": 4,
                "zone": "intl",
                "language": "en",
                "tag": "code.doc",
            },
            captured["json"],
        )
        self.assertIn("【AnySearch 联网搜索结果】", result)
        self.assertIn("AnySearch docs", result)
        self.assertIn("https://www.anysearch.com/docs", result)
        self.assertIn("unused full content", result)
        self.assertIn("不可信的外部网页", result)

    async def test_round_robins_starting_key_between_searches(self):
        used_keys = []

        async def handler(request: httpx.Request):
            used_keys.append(request.headers["authorization"])
            return httpx.Response(200, json=_success_response())

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            for _ in range(4):
                await search_module._search_anysearch(
                    ["key-a", "key-b", "key-c"],
                    "query",
                    3,
                    client=client,
                )

        self.assertEqual(
            [
                "Bearer key-a",
                "Bearer key-b",
                "Bearer key-c",
                "Bearer key-a",
            ],
            used_keys,
        )

    async def test_fails_over_to_next_key_on_auth_or_rate_limit_error(self):
        used_keys = []

        async def handler(request: httpx.Request):
            authorization = request.headers["authorization"]
            used_keys.append(authorization)
            if authorization == "Bearer expired-key":
                return httpx.Response(401, json={"message": "expired"})
            return httpx.Response(200, json=_success_response("fallback result"))

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            result = await search_module._search_anysearch(
                ["expired-key", "working-key"], "query", 3, client=client
            )

        self.assertEqual(
            ["Bearer expired-key", "Bearer working-key"], used_keys
        )
        self.assertIn("fallback result", result)

    async def test_fails_over_when_api_returns_a_business_error(self):
        used_keys = []

        async def handler(request: httpx.Request):
            authorization = request.headers["authorization"]
            used_keys.append(authorization)
            if authorization == "Bearer exhausted-key":
                return httpx.Response(
                    200,
                    json={"code": -1, "message": "quota exhausted", "data": {}},
                )
            return httpx.Response(200, json=_success_response("rotated result"))

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            result = await search_module._search_anysearch(
                ["exhausted-key", "working-key"], "query", 3, client=client
            )

        self.assertEqual(
            ["Bearer exhausted-key", "Bearer working-key"], used_keys
        )
        self.assertIn("rotated result", result)

    async def test_raises_sanitized_error_after_every_key_fails(self):
        async def handler(_request: httpx.Request):
            return httpx.Response(429, json={"message": "rate limited"})

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            with self.assertRaisesRegex(
                search_module.AnySearchRequestError,
                "All AnySearch API keys failed",
            ) as raised:
                await search_module._search_anysearch(
                    ["secret-one", "secret-two"], "query", 3, client=client
                )

        self.assertNotIn("secret-one", str(raised.exception))
        self.assertNotIn("secret-two", str(raised.exception))

    async def test_tool_reads_array_configuration_and_clamps_max_results(self):
        requests = []

        async def handler(request: httpx.Request):
            requests.append(__import__("json").loads(await request.aread()))
            return httpx.Response(200, json=_success_response())

        class Connection:
            config = {
                "plugins": {
                    "web_search": {
                        "provider": "anysearch",
                        "api_keys": ["key-a", "key-b"],
                        "max_results": 999,
                        "zone": "invalid",
                    }
                }
            }

        original_client = search_module.httpx.AsyncClient
        test_client = httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        )

        class ClientFactory:
            def __init__(self, *args, **kwargs):
                pass

            async def post(self, *args, **kwargs):
                return await test_client.post(*args, **kwargs)

            async def aclose(self):
                return None

        search_module.httpx.AsyncClient = ClientFactory
        try:
            response = await search_module.web_search(Connection(), " test query ")
        finally:
            search_module.httpx.AsyncClient = original_client
            await test_client.aclose()

        self.assertEqual(Action.REQLLM, response.action)
        self.assertIn("AnySearch docs", response.result)
        self.assertEqual(10, requests[0]["max_results"])
        self.assertEqual("cn", requests[0]["zone"])

    async def test_anysearch_supports_official_anonymous_access(self):
        authorizations = []

        async def handler(request: httpx.Request):
            authorizations.append(request.headers.get("authorization"))
            return httpx.Response(200, json=_success_response())

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler), trust_env=False
        ) as client:
            result = await search_module._search_anysearch(
                [], "anonymous query", 3, client=client
            )

        self.assertEqual([None], authorizations)
        self.assertIn("AnySearch docs", result)


if __name__ == "__main__":
    unittest.main()
