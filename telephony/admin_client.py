"""
Admin UI API client for pushing call data.

Sends SI payloads to the Admin UI /api/calls/ingest endpoint
for storage in the database and analytics visualization.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, Optional

from config import Config


class AdminClient:
    """Async client for Admin UI API."""

    def __init__(self, cfg: Optional[Config] = None):
        self.cfg = cfg or Config()
        self.base_url = self.cfg.ADMIN_API_BASE.rstrip("/")
        self.ingest_url = f"{self.base_url}/api/calls/ingest"
        self.timeout = 10  # seconds

    async def push_call_data(
        self,
        payload: Dict[str, Any],
        call_id: str,
    ) -> bool:
        """
        Push call data to Admin UI for database storage.

        This is fire-and-forget with error logging - doesn't block call flow.

        Args:
            payload: SI webhook format payload
            call_id: Call ID for logging

        Returns:
            True if successful, False otherwise
        """
        if not self.cfg.ENABLE_ADMIN_PUSH:
            return False

        try:
            # Use aiohttp if available, fall back to sync urllib
            return await self._push_with_urllib(payload, call_id)
        except Exception as e:
            print(f"[{call_id}] ❌ Admin push failed: {e}")
            return False

    async def _push_with_urllib(
        self,
        payload: Dict[str, Any],
        call_id: str,
    ) -> bool:
        """Push using urllib (sync, but run in executor for async)."""
        import urllib.request
        import urllib.error

        def do_request() -> bool:
            url = self.ingest_url
            max_redirects = 3
            
            for attempt in range(max_redirects + 1):
                try:
                    data = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(
                        url,
                        data=data,
                        method="POST",
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                    )

                    # Create opener that doesn't auto-follow redirects
                    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
                        def redirect_request(self, req, fp, code, msg, headers, newurl):
                            # Return None to not auto-follow, we'll handle manually
                            return None

                    opener = urllib.request.build_opener(NoRedirectHandler)
                    
                    try:
                        resp = opener.open(req, timeout=self.timeout)
                        if resp.status == 200:
                            result = json.loads(resp.read().decode("utf-8"))
                            print(f"[{call_id}] ✅ Pushed to Admin UI: {result.get('callSessionId', 'OK')}")
                            return True
                        else:
                            print(f"[{call_id}] ⚠️ Admin UI returned status {resp.status}")
                            return False
                    except urllib.error.HTTPError as e:
                        # Handle redirects (307, 308 preserve method)
                        if e.code in (301, 302, 303, 307, 308):
                            new_url = e.headers.get("Location")
                            if new_url and attempt < max_redirects:
                                # Handle relative URLs
                                if new_url.startswith("/"):
                                    new_url = f"{self.base_url}{new_url}"
                                print(f"[{call_id}] 🔄 Following redirect to: {new_url}")
                                url = new_url
                                continue
                        raise

                except urllib.error.HTTPError as e:
                    print(f"[{call_id}] ⚠️ Admin UI HTTP error: {e.code} {e.reason}")
                    return False
                except urllib.error.URLError as e:
                    print(f"[{call_id}] ⚠️ Admin UI connection error: {e.reason}")
                    return False
                except Exception as e:
                    print(f"[{call_id}] ⚠️ Admin UI request error: {e}")
                    return False
            
            print(f"[{call_id}] ⚠️ Too many redirects")
            return False

        # Run sync request in thread pool to not block event loop
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, do_request)

    async def push_call_data_fire_and_forget(
        self,
        payload: Dict[str, Any],
        call_id: str,
    ) -> None:
        """
        Push call data without waiting for result.
        Errors are logged but don't affect caller.
        """
        try:
            asyncio.create_task(self.push_call_data(payload, call_id))
        except Exception as e:
            print(f"[{call_id}] ⚠️ Failed to schedule Admin push: {e}")
