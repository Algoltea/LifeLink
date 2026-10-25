# Models and read-aloud

Verified on **2026-10-24**, using unauthenticated GET requests to OpenRouter's public catalog and official documentation. No account credentials, synthesis calls, messages, deployments, or provider mutations were used. Catalog availability is verified; actual account access, latency, voice quality, and synthesis remain untested.

## Verified model configuration

| Purpose | Deployment variable | Exact default ID | Verified capabilities |
| --- | --- | --- | --- |
| Fast extraction | `OPENROUTER_FAST_MODEL` | `z-ai/glm-5.3-flash` | Text/image/video input; text output; structured outputs and tools |
| Scam checks (calls, new email, check form) | `OPENROUTER_SCAM_MODEL` | `openai/gpt-6-luna` | Text/image/file input; structured outputs; no `temperature` (omitted for this tier); low reasoning for calls, medium for email and the form |
| News summaries (on open, saved for everyone) | `OPENROUTER_NEWS_MODEL` | `inception/mercury-3` | Text input; structured outputs; low reasoning |
| Main assistant | `OPENROUTER_MODEL` | `google/gemini-4-argon` | Text/image/video/audio/file input; text output; structured outputs and tools |
| Read-aloud | `OPENROUTER_TTS_MODEL` | `elevenlabs/eleven-v4-turbo` | Text input; speech output |
| Read-aloud voice | `OPENROUTER_TTS_VOICE` | `sarah` | Listed in the ElevenLabs models' `supported_voices` |

The catalog canonical slugs are `z-ai/glm-5.3-flash-20260826`, `google/gemini-4-argon-20261013`, and `elevenlabs/eleven-v4-turbo-20260930`. Requests use the catalog **IDs** above. Existing deployment overrides remain effective and must be updated separately if they still name older models.

Both chat models advertise `response_format`, `structured_outputs`, `tools`, and `tool_choice`. GLM's reasoning is mandatory, defaults to `max`, and supports `low`, `high`, and `max`. Gemini Argon's reasoning is mandatory and supports `low`, `medium`, and `high`, defaulting to `medium`. The structured-completion adapter requests `reasoning.effort: "low"` for bounded extraction and keeps strict JSON-schema requests plus Zod output validation. Neither chat model advertises speech output; read-aloud uses the separate TTS model.

Sources: [OpenRouter model catalog](https://openrouter.ai/api/v1/models), [speech model catalog](https://openrouter.ai/api/v1/models?output_modalities=speech).

## ElevenLabs through the OpenRouter key

ElevenLabs **is available through OpenRouter**. The official [ElevenLabs push-to-talk cookbook](https://openrouter.ai/docs/cookbook/audio/push-to-talk-button) demonstrates `elevenlabs/eleven-v4-turbo` at the speech endpoint, authenticated with an OpenRouter API key. No direct ElevenLabs key or separate vendor endpoint is required.

The server reads `OPENROUTER_API_KEY` only from its deployment environment and sends:

```text
POST https://openrouter.ai/api/v1/audio/speech
Authorization: Bearer <server-side OpenRouter key>
Content-Type: application/json
```

```json
{
  "model": "elevenlabs/eleven-v4-turbo",
  "input": "Text already visible to the signed-in person.",
  "voice": "sarah",
  "response_format": "mp3"
}
```

The successful response is raw MP3 bytes with `Content-Type: audio/mpeg`, not chat JSON or base64. The server returns bounded Convex bytes; the browser plays an ephemeral blob URL. The endpoint's default output is PCM, so MP3 is always requested explicitly. Speaking speed is applied during playback (0.5–1.5), because OpenRouter does not guarantee every speech provider honors the `speed` parameter.

The provider adapter accepts only these verified ElevenLabs IDs: `eleven-v4`, `eleven-v4-turbo`, `eleven-v3`, `eleven-v3-conversational`, `eleven-flash-v2.5`, `eleven-turbo-v2.5`, `eleven-multilingual-v2`, `eleven-turbo-v2`, and `eleven-flash-v2`, each prefixed with `elevenlabs/`.

All nine advertise `input_modalities: ["text"]`, `output_modalities: ["speech"]`, and these voices: `george`, `sarah`, `adam`, `alice`, `bella`, `bill`, `brian`, `callum`, `charlie`, `chris`, `daniel`, `eric`, `harry`, `jessica`, `laura`, `liam`, `lily`, `matilda`, `river`, `roger`, `will`. Their empty `supported_parameters` arrays describe chat parameters, not the dedicated speech request schema. Discover these models with `output_modalities=speech`; the default chat catalog and the `audio` filter do not list them.

Unrecognized TTS model/voice settings fail clearly. There is no alternate vendor, automatic model substitution, or browser speech-synthesis fallback. Expanding the allowlist requires checking the public speech catalog again.

Sources: [TTS guide](https://openrouter.ai/docs/guides/overview/multimodal/tts), [speech endpoint reference](https://openrouter.ai/docs/api/api-reference/tts/create-speech), [speech catalog](https://openrouter.ai/api/v1/models?output_modalities=speech).

## Implementation and access

- `packages/backend/convex/integrations/openrouter.ts`: requested chat model defaults and low-effort structured extraction.
- `packages/backend/convex/integrations/tts.ts`: isolated ElevenLabs/OpenRouter adapter; verified model/voice configuration; 45-second request timeout; redirects refused; MP3 MIME validation; stream capped at 900 KiB. Provider bodies and the submitted text are never logged or returned as error details. No automatic retries.
- `packages/backend/convex/voice.ts`: authenticated `synthesizeSpeech({ text })` action. It accepts 1–600 trimmed UTF-16 characters and returns `{ audio, contentType, model }`. It never fetches a record or accepts a target account ID. Existing data queries still determine what content the caller can see. Gemini Live session creation remains separate.
- Parent integration: `speechlimits.consume({ characters })` checks the caller's profile, including family profiles, and atomically reserves each chunk before the paid request. Limits are 10 requests per minute and 100,000 characters per 24-hour window per profile, persisted in `speechUsage`. Failed or abandoned provider requests still consume the reservation.
- `apps/web/src/lib/speech.ts`: `useSpeech` replaces browser synthesis. Passages up to 24,000 UTF-16 characters are split at sentence/word boundaries into at most 600-character requests, without splitting surrogate pairs. Only the next chunk is generated; starting a new reader stops the previous reader. Stop, unmount, and replacement discard late action results and release audio listeners/blob URLs. A dispatched Convex action cannot be cancelled, so its current provider request may finish after Stop; no subsequent chunk is requested.
- `apps/web/src/components/app/bits.tsx`: all existing `ReadAloudButton` consumers and the automatic assistant read-aloud hook use the same backend. Loading remains stoppable, errors appear beside the button, and automatic failures use the existing notification surface. Browser autoplay rejection preserves the generated audio behind **Play audio**, avoiding another synthesis request. A manual button can take over audio prepared automatically. One audio element is reused across chunks. The event-to-promise adapter supports browsers without `Promise.withResolvers`.
- `apps/web/src/components/settings/settings-screen.tsx`: the sample uses `ReadAloudButton` and the currently selected rate, including when resuming prepared audio.

Existing buttons cover Today, reminders, assistant replies, task summaries, selected emails, scam results, and trusted-circle text. This change does not grant access to additional records or send app messages. It does not add automatic reading of arbitrary page DOM, microphone recording, or persistent audio storage. Read-aloud sends the selected text to OpenRouter/ElevenLabs, including in Practice mode; Practice still protects consequential app actions separately.

## Local verification

No new regression tests or dependencies were added. Focused Ultracite formatting/lint checks pass for the owned audio/model files and this document. Backend and web TypeScript both pass. Existing backend permission, approval, and journey suites pass: **3 files, 14 tests**. The Settings preview migration passed lint initially; the route agent is concurrently restyling that file, so the parent owns its final formatting pass. Live provider calls and mobile audio playback were not exercised. The parent runs the final combined checks/build after integrating the concurrent overhaul work.
