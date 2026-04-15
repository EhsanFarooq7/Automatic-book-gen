import httpx
import os

TEAMS_WEBHOOK_URL = os.environ.get("TEAMS_WEBHOOK_URL")


async def send_notification(message: str):
    if not TEAMS_WEBHOOK_URL:
        print(f"Notification (Log only): {message}")
        return

    payload = {"text": message}
    async with httpx.AsyncClient() as client:
        try:
            await client.post(TEAMS_WEBHOOK_URL, json=payload)
        except Exception as e:
            print(f"Failed to send Teams notification: {e}")
