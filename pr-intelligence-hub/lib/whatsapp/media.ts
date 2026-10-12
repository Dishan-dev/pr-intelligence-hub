import "server-only";

type MediaResponse = { url?: string; mime_type?: string; error?: { message?: string } };

/** Fetches only from Meta's trusted Graph API. Never follow arbitrary webhook-provided URLs. */
export async function downloadWhatsAppImage(mediaId: string): Promise<{ base64: string; mimeType: string } | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !/^[a-zA-Z0-9_-]{1,200}$/.test(mediaId)) return null;
  const version = process.env.META_GRAPH_VERSION ?? "v23.0";
  if (!/^v\\d+\\.\\d+$/.test(version)) throw new Error("Invalid Meta Graph API version");
  const metadataResponse = await fetch(`https://graph.facebook.com/${version}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!metadataResponse.ok) throw new Error(`Meta media lookup failed: ${metadataResponse.status}`);
  const metadata = await metadataResponse.json() as MediaResponse;
  if (!metadata.url) return null;
  const mediaUrl = new URL(metadata.url);
  if (mediaUrl.protocol !== "https:" || !/(^|\\.)facebook\\.com$/.test(mediaUrl.hostname) && !/(^|\\.)fbcdn\\.net$/.test(mediaUrl.hostname)) {
    throw new Error("Untrusted WhatsApp media URL");
  }
  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Meta media download failed: ${response.status}`);
  const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return null;
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 8 * 1024 * 1024) throw new Error("WhatsApp image exceeds 8 MB processing limit");
  return { base64: Buffer.from(bytes).toString("base64"), mimeType };
}
