type GoogleChatPayload = {
  text: string;
};

export async function sendGoogleChatNotification(text: string): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("GOOGLE_CHAT_WEBHOOK_URL is not configured; notification skipped.");
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text } satisfies GoogleChatPayload),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Google Chat notification failed:", response.status, await response.text());
    return false;
  }
  return true;
}
