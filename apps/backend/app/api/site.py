"""Public website form handlers; upstream URLs stay in the backend environment."""

import asyncio
import json
import os
import re
from collections.abc import Callable
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api", tags=["Website forms"])

PUBLIC_FORM_PATHS = frozenset({"/api/submit-contact", "/api/newsletter-track"})
CONTACT_SCRIPT_ENV = "GOOGLE_CONTACT_SCRIPT_URL"
NEWSLETTER_SCRIPT_ENV = "GOOGLE_NEWSLETTER_SCRIPT_URL"
MAX_FORM_BODY_BYTES = 32 * 1024
FORM_TOTAL_TIMEOUT_SECONDS = 15.0
SCRIPT_TIMEOUT = httpx.Timeout(10.0, connect=3.0, pool=3.0)
MAX_SCRIPT_REDIRECTS = 3

_CONTACT_LIMITS = {"name": 200, "email": 254, "organization": 200, "message": 8000}
_GOOGLE_HOSTS = frozenset({"script.google.com", "script.googleusercontent.com"})


def _result(status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"ok": status_code == 200},
        headers={"Cache-Control": "no-store"},
    )


def _is_google_url(url: httpx.URL) -> bool:
    return (
        url.scheme == "https"
        and url.host in _GOOGLE_HOSTS
        and url.port in (None, 443)
        and not url.username
        and not url.password
        and not url.fragment
    )


def _configured_url(env_name: str) -> httpx.URL | None:
    value = os.getenv(env_name, "").strip()
    if not value:
        return None
    try:
        url = httpx.URL(value)
    except httpx.InvalidURL:
        return None
    if (
        not _is_google_url(url)
        or url.host != "script.google.com"
        or url.query
        or not re.fullmatch(r"/macros/s/[A-Za-z0-9_-]+/exec", url.path)
    ):
        return None
    return url


async def _read_json(request: Request) -> dict[str, Any]:
    media_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if media_type != "application/json":
        raise HTTPException(status_code=415)

    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            length = int(content_length)
        except ValueError:
            raise HTTPException(status_code=400) from None
        if length < 0:
            raise HTTPException(status_code=400)
        if length > MAX_FORM_BODY_BYTES:
            raise HTTPException(status_code=413)

    raw = bytearray()
    async for chunk in request.stream():
        if len(raw) + len(chunk) > MAX_FORM_BODY_BYTES:
            raise HTTPException(status_code=413)
        raw.extend(chunk)

    try:
        body = json.loads(raw)
        # Reject non-finite numbers and lone surrogates before HTTPX serializes metadata.
        json.dumps(body, ensure_ascii=False, allow_nan=False).encode("utf-8")
    except (ValueError, UnicodeError, RecursionError):
        raise HTTPException(status_code=400) from None
    if not isinstance(body, dict):
        raise HTTPException(status_code=400)
    return body


def _contact_payload(body: dict[str, Any]) -> dict[str, Any]:
    if body.keys() - _CONTACT_LIMITS.keys():
        raise ValueError("Unexpected contact fields")
    payload = {}
    for field, limit in _CONTACT_LIMITS.items():
        value = body.get(field, "")
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError("Invalid contact field")
        value = value.strip()
        if field != "organization" and not value:
            raise ValueError("Missing contact field")
        payload[field] = value
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", payload["email"]):
        raise ValueError("Invalid email")
    return payload


def _newsletter_payload(body: dict[str, Any]) -> dict[str, Any]:
    reason = body.get("reason")
    if isinstance(reason, str):
        reason = reason.strip()
        if not re.fullmatch(r"[+-]?[0-9]+", reason):
            raise ValueError("Invalid reason")
        reason = int(reason)
    elif type(reason) not in (int, float):
        raise ValueError("Invalid reason")
    if reason not in (1, 2, 3, 4, 5):
        raise ValueError("Invalid reason")
    return {**body, "reason": int(reason)}


async def _deliver(url: httpx.URL, payload: dict[str, Any]) -> bool:
    async with httpx.AsyncClient(timeout=SCRIPT_TIMEOUT, follow_redirects=False) as client:
        method = "POST"
        for _ in range(MAX_SCRIPT_REDIRECTS + 1):
            kwargs = {"json": payload} if method == "POST" else {}
            # Apps Script redirects its output to Googleusercontent. Never forward
            # browser headers or replay the submitted body to a redirect target.
            async with client.stream(method, url, **kwargs) as response:
                if 200 <= response.status_code < 300:
                    return True
                if response.status_code not in (301, 302, 303, 307, 308):
                    return False
                if method == "POST" and response.status_code in (307, 308):
                    return False
                location = response.headers.get("location")
                if not location:
                    return False
                target = response.url.join(location)
                if not _is_google_url(target):
                    return False
            url = target
            method = "GET"
    return False


async def _submit(
    request: Request,
    env_name: str,
    validate: Callable[[dict[str, Any]], dict[str, Any]],
) -> JSONResponse:
    url = _configured_url(env_name)
    if url is None:
        return _result(503)
    try:
        payload = validate(await _read_json(request))
    except HTTPException as exc:
        return _result(exc.status_code)
    except ValueError:
        return _result(400)

    try:
        delivered = await asyncio.wait_for(
            _deliver(url, payload), timeout=FORM_TOTAL_TIMEOUT_SECONDS
        )
    except (httpx.HTTPError, httpx.InvalidURL, asyncio.TimeoutError):
        return _result(502)
    return _result(200 if delivered else 502)


@router.post("/submit-contact")
async def submit_contact(request: Request):
    return await _submit(request, CONTACT_SCRIPT_ENV, _contact_payload)


@router.post("/newsletter-track")
async def newsletter_track(request: Request):
    return await _submit(request, NEWSLETTER_SCRIPT_ENV, _newsletter_payload)
