#!/usr/bin/env python3
"""Check the public static app with real TLS certificate verification."""
import json
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ORIGIN = "https://stress.valeriizhyla.com"


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url, status=200):
    try:
        response = build_opener(NoRedirect).open(Request(url, headers={"User-Agent": "emotional-damage-verification/1"}), timeout=30)
    except HTTPError as error:
        response = error
    with response:
        assert response.status == status, f"{url}: {response.status}, expected {status}"
        return response.headers, response.read()


def main():
    headers, _ = fetch(ORIGIN.replace("https:", "http:") + "/", 308)
    assert headers["Location"] == ORIGIN + "/"
    headers, body = fetch(ORIGIN + "/")
    html = body.decode()
    assert all(text in html for text in ("Emotional Damage", "Okay", "Tired", "Overloaded", "Exhausted", 'max="19"'))
    assert "script-src 'self'" in headers.get("Content-Security-Policy", "")
    assert "worker-src 'self'" in headers["Content-Security-Policy"]
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Referrer-Policy") == "no-referrer"
    assert "max-age=" in headers.get("Strict-Transport-Security", "")
    print("PASS HTTPS, HTTP redirect, four-zone app and security headers")
    for path, mime in (("/style.css", "text/css"), ("/app.js", "javascript"), ("/sw.js", "javascript"), ("/manifest.webmanifest", "application/manifest+json"), ("/icons/icon.svg", "image/svg+xml"), ("/icons/icon-192.png", "image/png"), ("/icons/icon-512.png", "image/png"), ("/icons/apple-touch-icon.png", "image/png")):
        headers, body = fetch(ORIGIN + path)
        assert mime in headers.get("Content-Type", "") and body, path
        print(f"PASS {path}")
    _, body = fetch(ORIGIN + "/manifest.webmanifest")
    manifest = json.loads(body)
    assert manifest["display"] == "standalone" and manifest["start_url"] == "/"
    for path in ("/healthz", "/.env", "/Caddyfile", "/missing-page"):
        fetch(ORIGIN + path, 404)
    print("PASS install manifest, private readiness and unknown-path handling")


if __name__ == "__main__":
    main()
