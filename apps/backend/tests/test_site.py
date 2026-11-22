"""Offline website form and authentication tests using unittest and HTTPX transports.

Run from apps/backend with: python -m unittest discover -s tests -v
No lifespan tasks run, dotenv loading is disabled, and outbound HTTP is mocked.
"""

import asyncio
import json
import os
import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient, MockTransport

from app.api import site


CONTACT_URL = "https://script.google.com/macros/s/test-contact/exec"
NEWSLETTER_URL = "https://script.google.com/macros/s/test-newsletter/exec"
CONTACT = {
    "name": "Test Sender",
    "email": "sender@example.invalid",
    "organization": "Test Organization",
    "message": "Test message",
}
INTERNAL_KEY = "test-only-internal-key"


class OfflineSiteTestCase(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        for target in (
            "socket.socket.connect",
            "socket.create_connection",
            "socket.getaddrinfo",
        ):
            guard = patch(target, side_effect=AssertionError("Network is forbidden in tests"))
            guard.start()
            self.addCleanup(guard.stop)

        environment = patch.dict(
            os.environ,
            {
                site.CONTACT_SCRIPT_ENV: CONTACT_URL,
                site.NEWSLETTER_SCRIPT_ENV: NEWSLETTER_URL,
                "INTERNAL_API_KEY": INTERNAL_KEY,
            },
        )
        environment.start()
        self.addCleanup(environment.stop)
        self.forwarded = []
        self.client_options = []
        self.respond = lambda request: httpx.Response(200, text="private upstream output")
        app = self.make_app()

        def upstream(request):
            self.forwarded.append(request)
            return self.respond(request)

        def make_client(**kwargs):
            self.client_options.append(kwargs)
            return AsyncClient(transport=MockTransport(upstream), **kwargs)

        client_patch = patch.object(site.httpx, "AsyncClient", side_effect=make_client)
        client_patch.start()
        self.addCleanup(client_patch.stop)

        # ASGITransport does not start the app's background notifier or lifespan.
        self.client = AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        )
        self.addAsyncCleanup(self.client.aclose)

    def make_app(self):
        app = FastAPI()
        app.include_router(site.router)
        return app

    def assert_result(self, response, status_code):
        self.assertEqual(response.status_code, status_code)
        self.assertEqual(response.json(), {"ok": status_code == 200})
        self.assertEqual(response.headers["cache-control"], "no-store")


class SiteFormTests(OfflineSiteTestCase):
    async def test_contact_forwards_validated_fields_without_browser_credentials(self):
        payload = {**CONTACT, "name": "  Test Sender  ", "message": "  שלום\nTest message  "}
        response = await self.client.post(
            "/api/submit-contact",
            json=payload,
            headers={
                "X-Api-Key": INTERNAL_KEY,
                "Authorization": "Bearer browser-token",
                "Cookie": "session=browser-cookie",
            },
        )
        self.assert_result(response, 200)
        self.assertEqual(len(self.forwarded), 1)
        forwarded = self.forwarded[0]
        self.assertEqual(str(forwarded.url), CONTACT_URL)
        self.assertEqual(forwarded.method, "POST")
        self.assertEqual(
            json.loads(forwarded.content),
            {**CONTACT, "message": "שלום\nTest message"},
        )
        for name in ("x-api-key", "authorization", "cookie"):
            self.assertNotIn(name, forwarded.headers)
        self.assertEqual(forwarded.headers["content-type"], "application/json")
        self.assertNotIn("private upstream output", response.text)
        self.assertNotIn(CONTACT_URL, response.text)
        options = self.client_options[0]
        self.assertFalse(options["follow_redirects"])
        self.assertEqual(options["timeout"].connect, 3.0)
        self.assertEqual(options["timeout"].pool, 3.0)
        self.assertEqual(options["timeout"].read, 10.0)
        self.assertEqual(options["timeout"].write, 10.0)

    async def test_contact_organization_is_optional(self):
        payload = {key: value for key, value in CONTACT.items() if key != "organization"}
        response = await self.client.post("/api/submit-contact", json=payload)
        self.assert_result(response, 200)
        self.assertEqual(json.loads(self.forwarded[0].content), {**payload, "organization": ""})

    async def test_contact_rejects_missing_invalid_and_extra_fields(self):
        invalid = [
            {},
            {**CONTACT, "name": "   "},
            {**CONTACT, "name": 123},
            {**CONTACT, "email": "not-an-email"},
            {**CONTACT, "email": "sender@example.invalid\nother@example.invalid"},
            {**CONTACT, "organization": None},
            {**CONTACT, "message": ""},
            {**CONTACT, "message": ["text"]},
            {**CONTACT, "url": "https://example.invalid"},
        ]
        for field, limit in site._CONTACT_LIMITS.items():
            invalid.append({**CONTACT, field: "x" * (limit + 1)})
        for payload in invalid:
            with self.subTest(fields=list(payload)):
                self.assert_result(
                    await self.client.post("/api/submit-contact", json=payload), 400
                )
        self.assertEqual(self.forwarded, [])

    async def test_newsletter_normalizes_reason_and_preserves_original_metadata(self):
        payload = {
            "reason": " 03 ",
            "source": "homepage",
            "metadata": {"locale": "he", "flags": [True, None, 2.5]},
            "originalReason": "academic",
        }
        response = await self.client.post("/api/newsletter-track", json=payload)
        self.assert_result(response, 200)
        self.assertEqual(str(self.forwarded[0].url), NEWSLETTER_URL)
        self.assertEqual(json.loads(self.forwarded[0].content), {**payload, "reason": 3})

    async def test_newsletter_accepts_integer_numbers_and_whole_integer_strings(self):
        for reason in (1, 5, 2.0, "1", " 5 ", "+4", "02"):
            with self.subTest(reason=reason):
                self.assert_result(
                    await self.client.post("/api/newsletter-track", json={"reason": reason}),
                    200,
                )
                forwarded_reason = json.loads(self.forwarded[-1].content)["reason"]
                self.assertIs(type(forwarded_reason), int)
                self.assertEqual(forwarded_reason, int(reason))

    async def test_newsletter_rejects_out_of_range_coercions_and_partial_numbers(self):
        for reason in (0, 6, -1, 1.5, "2junk", "2.0", "1e0", "", None, True, False, [], {}):
            with self.subTest(reason=reason):
                self.assert_result(
                    await self.client.post("/api/newsletter-track", json={"reason": reason}),
                    400,
                )
        self.assert_result(await self.client.post("/api/newsletter-track", json={}), 400)
        self.assertEqual(self.forwarded, [])

    async def test_rejects_malformed_non_object_and_non_finite_json(self):
        invalid = (
            b"",
            b"not-json",
            b"null",
            b"[]",
            b"true",
            b'"text"',
            b'{"reason":',
            b'{"reason":NaN}',
            b'{"reason":1,"metadata":Infinity}',
            b'{"reason":1,"metadata":1e999}',
            b'{"reason":1,"metadata":"\\ud800"}',
            b"[" * 1100 + b"0" + b"]" * 1100,
        )
        for body in invalid:
            with self.subTest(body_size=len(body)):
                self.assert_result(
                    await self.client.post(
                        "/api/newsletter-track",
                        content=body,
                        headers={"Content-Type": "application/json"},
                    ),
                    400,
                )
        self.assertEqual(self.forwarded, [])

    async def test_json_content_type_is_required_but_charset_is_allowed(self):
        for headers in ({}, {"Content-Type": "text/plain"}):
            self.assert_result(
                await self.client.post(
                    "/api/newsletter-track", content=b'{"reason":1}', headers=headers
                ),
                415,
            )
        self.assertEqual(self.forwarded, [])
        self.assert_result(
            await self.client.post(
                "/api/newsletter-track",
                content=b'{"reason":1}',
                headers={"Content-Type": "application/json; charset=utf-8"},
            ),
            200,
        )

    async def test_rejects_oversize_declared_and_streamed_bodies(self):
        self.assert_result(
            await self.client.post(
                "/api/newsletter-track",
                content=b'{"reason":1}',
                headers={
                    "Content-Type": "application/json",
                    "Content-Length": str(site.MAX_FORM_BODY_BYTES + 1),
                },
            ),
            413,
        )

        async def chunks():
            yield b'{"reason":1,"metadata":"'
            yield b"x" * site.MAX_FORM_BODY_BYTES
            yield b'"}'

        for extra_headers in ({}, {"Content-Length": "1"}):
            self.assert_result(
                await self.client.post(
                    "/api/newsletter-track",
                    content=chunks(),
                    headers={"Content-Type": "application/json", **extra_headers},
                ),
                413,
            )
        self.assertEqual(self.forwarded, [])

    async def test_rejects_invalid_content_length(self):
        for value in ("not-a-number", "-1"):
            self.assert_result(
                await self.client.post(
                    "/api/newsletter-track",
                    content=b'{"reason":1}',
                    headers={"Content-Type": "application/json", "Content-Length": value},
                ),
                400,
            )
        self.assertEqual(self.forwarded, [])

    async def test_unconfigured_deployments_fail_closed_and_remain_independent(self):
        os.environ.pop(site.CONTACT_SCRIPT_ENV)
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 503)
        self.assert_result(
            await self.client.post("/api/newsletter-track", json={"reason": 1}), 200
        )
        os.environ[site.CONTACT_SCRIPT_ENV] = CONTACT_URL
        os.environ[site.NEWSLETTER_SCRIPT_ENV] = ""
        self.assert_result(
            await self.client.post("/api/newsletter-track", json={"reason": 1}), 503
        )
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 200)
        self.assertEqual([str(request.url) for request in self.forwarded], [NEWSLETTER_URL, CONTACT_URL])

    async def test_rejects_unsafe_or_invalid_deployment_urls_without_requests(self):
        invalid = (
            "not a URL",
            "https://[invalid",
            "http://script.google.com/macros/s/test/exec",
            "https://example.invalid/macros/s/test/exec",
            "https://script.google.com.evil.invalid/macros/s/test/exec",
            "https://script.google.com:8443/macros/s/test/exec",
            "https://user:password@script.google.com/macros/s/test/exec",
            "https://script.google.com/macros/s/test/exec?token=test",
            "https://script.google.com/macros/s/test/exec#fragment",
            "https://script.google.com/macros/s/test/dev",
        )
        for url in invalid:
            with self.subTest(url=url):
                os.environ[site.CONTACT_SCRIPT_ENV] = url
                self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 503)
        self.assertEqual(self.forwarded, [])

    async def test_final_upstream_2xx_is_required(self):
        for status in (200, 201, 204, 299, 301, 302, 307, 308, 400, 401, 429, 500, 503):
            with self.subTest(status=status):
                self.respond = lambda request, code=status: httpx.Response(code)
                self.assert_result(
                    await self.client.post("/api/newsletter-track", json={"reason": 1}),
                    200 if 200 <= status < 300 else 502,
                )

    async def test_transport_errors_and_timeouts_do_not_report_success(self):
        for error_type in (httpx.ConnectError, httpx.ReadTimeout):
            with self.subTest(error_type=error_type):
                def fail(request):
                    raise error_type("private upstream failure", request=request)

                self.respond = fail
                self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 502)

    async def test_overall_deadline_cancels_delivery_without_retry(self):
        async def delayed(request):
            await asyncio.sleep(10)
            return httpx.Response(200)

        self.respond = delayed
        with patch.object(site, "FORM_TOTAL_TIMEOUT_SECONDS", 0.01):
            self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 502)
        self.assertEqual(len(self.forwarded), 1)

    async def test_google_output_redirect_uses_get_without_replaying_body(self):
        output_url = "https://script.googleusercontent.com/macros/echo?test=value"

        def redirect(request):
            if request.method == "POST":
                return httpx.Response(302, headers={"Location": output_url})
            return httpx.Response(200)

        self.respond = redirect
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 200)
        self.assertEqual([request.method for request in self.forwarded], ["POST", "GET"])
        self.assertEqual(str(self.forwarded[1].url), output_url)
        self.assertEqual(self.forwarded[1].content, b"")
        self.assertNotIn("x-api-key", self.forwarded[1].headers)

    async def test_redirects_cannot_leave_trusted_https_hosts(self):
        for location in (
            "http://script.googleusercontent.com/macros/echo",
            "https://example.invalid/collect",
            "//example.invalid/collect",
            "https://script.googleusercontent.com.evil.invalid/collect",
            "https://script.googleusercontent.com:8443/collect",
            "https://user:password@script.googleusercontent.com/macros/echo",
            "https://accounts.google.com/login",
        ):
            with self.subTest(location=location):
                self.forwarded.clear()
                self.respond = lambda request, url=location: httpx.Response(
                    302, headers={"Location": url}
                )
                self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 502)
                self.assertEqual(len(self.forwarded), 1)

    async def test_post_preserving_redirects_are_rejected_and_redirect_loops_are_bounded(self):
        for status in (307, 308):
            self.forwarded.clear()
            self.respond = lambda request, code=status: httpx.Response(
                code, headers={"Location": "https://script.googleusercontent.com/macros/echo"}
            )
            self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 502)
            self.assertEqual(len(self.forwarded), 1)
        self.forwarded.clear()
        self.respond = lambda request: httpx.Response(302, headers={"Location": CONTACT_URL})
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 502)
        self.assertEqual(len(self.forwarded), site.MAX_SCRIPT_REDIRECTS + 1)
        self.assertEqual([request.method for request in self.forwarded], ["POST", "GET", "GET", "GET"])


class SiteAuthTests(OfflineSiteTestCase):
    def make_app(self):
        # Existing routers load dotenv at import time. Never inspect real .env files.
        with (
            patch("dotenv.load_dotenv", return_value=False),
            patch("dotenv.find_dotenv", return_value=""),
        ):
            from app.main import app
        return app

    async def test_only_exact_form_posts_are_public_even_without_internal_key(self):
        os.environ.pop("INTERNAL_API_KEY")
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 200)
        self.assert_result(
            await self.client.post("/api/newsletter-track", json={"reason": 1}), 200
        )
        self.assertEqual(len(self.forwarded), 2)

    async def test_unconfigured_public_form_returns_503_not_auth_success(self):
        os.environ.pop("INTERNAL_API_KEY")
        os.environ.pop(site.CONTACT_SCRIPT_ENV)
        self.assert_result(await self.client.post("/api/submit-contact", json=CONTACT), 503)
        self.assertEqual(self.forwarded, [])

    async def test_other_methods_and_path_variants_are_not_exempt(self):
        for path in site.PUBLIC_FORM_PATHS:
            for method in ("GET", "HEAD", "PUT", "PATCH", "DELETE"):
                with self.subTest(path=path, method=method):
                    response = await self.client.request(method, path)
                    self.assertEqual(response.status_code, 401)
            for variant in (path + "/", path + "/extra", path.upper(), path + "-other"):
                with self.subTest(path=variant):
                    response = await self.client.post(variant, json=CONTACT)
                    self.assertEqual(response.status_code, 401)
        self.assertEqual(self.forwarded, [])

    async def test_admin_endpoints_and_public_data_reads_still_require_key(self):
        paths = (
            ("GET", "/api/v1/energy/overview"),
            ("GET", "/api/v1/data-files/status"),
            ("GET", "/api/v1/data-files/download-urls"),
            ("POST", "/api/v1/data-files/upload"),
            ("POST", "/api/v1/data-files/fetch"),
            ("POST", "/api/v1/data-files/fetch-all"),
            ("POST", "/api/v1/data-files/fetch-ims-weather"),
            ("GET", "/api/backend/api/v1/data-files/download-urls"),
            ("POST", "/api/backend/api/v1/data-files/fetch-all"),
        )
        for method, path in paths:
            with self.subTest(path=path, method=method):
                response = await self.client.request(method, path)
                self.assertEqual(response.status_code, 401)
        self.assertEqual(self.forwarded, [])

    async def test_existing_header_key_guard_is_not_bypassed_by_queries(self):
        path = "/api/v1/not-a-route"
        self.assertEqual((await self.client.get(path)).status_code, 401)
        self.assertEqual(
            (await self.client.get(path, headers={"X-Api-Key": "wrong"})).status_code, 401
        )
        self.assertEqual(
            (await self.client.get(path, params={"api_key": INTERNAL_KEY})).status_code, 401
        )
        self.assertEqual(
            (await self.client.get(path, headers={"X-Api-Key": INTERNAL_KEY})).status_code, 404
        )
        self.assertEqual(
            (
                await self.client.get(
                    "/api/backend/api/v1/energy/overview", headers={"X-Api-Key": INTERNAL_KEY}
                )
            ).status_code,
            404,
        )

    async def test_missing_internal_key_still_fails_closed_for_private_routes(self):
        os.environ.pop("INTERNAL_API_KEY")
        response = await self.client.get("/api/v1/data-files/status")
        self.assertEqual(response.status_code, 424)
        self.assertEqual(response.json(), {"detail": "INTERNAL_API_KEY is not configured."})

    async def test_existing_options_and_docs_remain_public(self):
        os.environ.pop("INTERNAL_API_KEY")
        for path in ("/api/submit-contact", "/api/newsletter-track", "/api/v1/data-files/upload"):
            response = await self.client.options(
                path,
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST",
                },
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:3000")
        self.assertEqual((await self.client.options("/api/submit-contact")).status_code, 405)
        self.assertEqual((await self.client.get("/docs")).status_code, 200)
        self.assertEqual(self.forwarded, [])


if __name__ == "__main__":
    unittest.main()
