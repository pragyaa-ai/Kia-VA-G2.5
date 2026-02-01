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
            try:
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    self.ingest_url,
                    data=data,
                    method="POST",
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                )

                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    if resp.status == 200:
                        result = json.loads(resp.read().decode("utf-8"))
                        print(f"[{call_id}] ✅ Pushed to Admin UI: {result.get('callSessionId', 'OK')}")
                        return True
                    else:
                        print(f"[{call_id}] ⚠️ Admin UI returned status {resp.status}")
                        return False

            except urllib.error.HTTPError as e:
                print(f"[{call_id}] ⚠️ Admin UI HTTP error: {e.code} {e.reason}")
                return False
            except urllib.error.URLError as e:
                print(f"[{call_id}] ⚠️ Admin UI connection error: {e.reason}")
                return False
            except Exception as e:
                print(f"[{call_id}] ⚠️ Admin UI request error: {e}")
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
