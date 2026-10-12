# WhatsApp opportunity intake (test-number MVP)

This feature is isolated on the `feature/whatsapp-opportunity-intake` branch. It does **not** connect or migrate an existing WhatsApp Business app number.

## Set up
1. Apply the Supabase migration `20261012150000_whatsapp_intake.sql`.
2. In Meta for Developers, create/configure a WhatsApp Business Platform app with its **test number**. Subscribe to the `messages` webhook field.
3. Set Vercel environment variables: `WHATSAPP_VERIFY_TOKEN` (random string you choose), `META_APP_SECRET` (from Meta app settings), `OPENAI_API_KEY`, and existing Supabase server credentials. Optional: `OPENAI_WHATSAPP_MODEL`, `GOOGLE_CHAT_WEBHOOK_URL`.
4. Deploy this branch to a Vercel preview. Configure the Meta callback URL to `https://<preview-domain>/api/whatsapp/webhook` and use your `WHATSAPP_VERIFY_TOKEN` for verification.
5. Add approved test recipients in Meta, send a text opportunity to the test number, and verify that a new row appears in `discovered_opportunities` with status `new`. The existing Discoveries page can review it.
6. To credit a member by name, add their WhatsApp phone number (Meta webhook format, digits only) and member name to `whatsapp_member_links` using a secure admin-only database interface. Do not expose this mapping publicly.

## Current scope and limitations
- Text and supported image flyers are extracted. Voice notes and document attachments are ignored.
- New opportunities are stored in the existing Discoveries inbox as `new`; nothing is auto-approved or sent externally.
- A private member contribution dashboard is available at `/whatsapp-intake`; an in-app notification UI is not yet implemented.
- If `GOOGLE_CHAT_WEBHOOK_URL` is configured, admins receive a Google Chat notification; otherwise review the Discoveries inbox.
- Group messaging is **not implemented**. Use a manual share to your PR group after review.
- WhatsApp webhook processing runs synchronously for this MVP. For production, move extraction to a durable queue and worker so Meta retries do not result in stalled/failed processing.
- Duplicate checking currently compares the 500 most recent discoveries; improve it for larger datasets.
- Incoming message content and phone numbers are sensitive. Access is service-role-only, and retention/deletion policies must be defined before production.
- Do not enable the webhook for the existing Business app number without verifying Meta coexistence eligibility and completing a separate migration plan.

## Image flyers and member dashboard (new)
- Image messages (JPEG, PNG or WebP, up to 8 MB) are downloaded through the Meta Graph API and analyzed with an OpenAI vision-capable model. Configure `WHATSAPP_ACCESS_TOKEN`; optional `META_GRAPH_VERSION` (default v23.0) and `OPENAI_WHATSAPP_VISION_MODEL`.
- The `/whatsapp-intake` page displays submission and approval counts. Configure `WHATSAPP_INTAKE_ADMIN_EMAILS` as a comma-separated list of authorized Supabase login email addresses. The page returns 404 to other users. It is not public.
- The dashboard is based on the 2,000 most recent submissions and is not an all-time leaderboard. Unlinked senders are aggregated without exposing phone numbers.
- Image processing and AI extraction have **not** been end-to-end tested against Meta yet. Audio, video, documents and forwarded-message provenance are not supported.
- Review Meta media URL allowlisting and image size safeguards in your deployment environment before enabling real users.
