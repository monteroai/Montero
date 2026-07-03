# Test plan (Emilio) → Delivery plan (Janeth)

What got built this session, exactly how to test it tonight using your own number / email / dashboard, and how to flip the same setup over to Janeth when it passes.

---

## What's now live on montero.cool

| New route | What it does | Status |
|---|---|---|
| `POST /api/inbound/vapi/events` | Receives end-of-call reports from Maya Inbound. Writes a `portal_interactions` row with `type='call'`, transcript, duration, recording URL, ended-reason. Flags short calls (<15s) for review. | deployed |
| `POST /api/inbound/vapi/tools` | Single router for Maya's 4 CTAs. Each tool call writes a `portal_interactions` row tagged with the trigger reason, then returns a natural-language confirmation Maya speaks back to the caller. | deployed |
| `POST /api/leads/intake` (extended) | Lead form on consulting site already wired. Now also sends an auto-reply email via Resend (if key set) with a Calendly link. | deployed |

## What changed on Vapi

| Maya Inbound | Before | Now |
|---|---|---|
| Voice model | `eleven_turbo_v2_5` (English-only) | `eleven_multilingual_v2` (true EN/ES) |
| Voice ID | `2X7h8q4r8pMNZ7zRmpiF` (generic) | `EXAVITQu4vr4xnSDxMaL` ("Sarah" — warm bilingual) |
| serverUrl (call-end webhook) | empty (calls vanished) | `https://montero.cool/api/inbound/vapi/events` |
| Tool URLs | `montero-cool.app.n8n.cloud/webhook/*` (inactive) | `https://montero.cool/api/inbound/vapi/tools` (live) |
| System prompt | Bilingual prompt only | + IDENTITY DISCLOSURE block: "I'm Janeth's assistant — I help triage calls so Janeth and her team can spend their time with patients." Never claims human. |

---

## Set ONE more env var + paste the SQL, then test

### Step 1 — paste the SQL seed (still pending from previous session)

Open https://supabase.com/dashboard/project/lfaqxsuscjtabsvrhlrd/sql/new and paste [scripts/seed_janeth_phase1.sql](./seed_janeth_phase1.sql). Run. This makes Janeth's portal showcase-ready.

### Step 2 — set your phone number for SMS alerts

```bash
cd d:\make-to-n8n-toolkit\montero-cool
netlify env:set JANETH_NOTIFY_PHONE "+1XXXXXXXXXX" --context production
```

Use **your** number for now. We swap it to Janeth's later.

### Step 3 (optional — for email auto-reply test) — Resend

Resend has a free tier (100 emails/day, 3k/mo, no credit card). Sign up at https://resend.com → grab API key → set:

```bash
netlify env:set RESEND_API_KEY "re_xxxxxxxxxxxx" --context production
```

If you skip this, the lead form still works — it just won't auto-reply the lead. The status field in the JSON response will say `email: skipped`.

For now, emails will send from `onboarding@resend.dev` (Resend's default sender — works without DNS). When you're ready to send from `noreply@montero.cool`, verify the domain in Resend and set `RESEND_FROM_EMAIL`.

### Step 4 — redeploy after env changes

```bash
netlify deploy --prod --build
```

---

## Test path — using your number, email, dashboard

### A. Lead form pathway (the easiest to test)

1. Open https://smileconsultingplaceholder.netlify.app — scroll to the contact section.
2. Fill the form. Use:
   - Name: your real name
   - Email: `ai@montero.cool` (so you receive the auto-reply)
   - Phone: your real cell
   - Message: anything
3. Hit "Send Message" → green confirmation should appear within 3 seconds.
4. Within 10 seconds verify:
   - SMS lands on your phone (only if `JANETH_NOTIFY_PHONE` is set + your Twilio toll-free number is verified — see note below)
   - Email lands at `ai@montero.cool` (only if `RESEND_API_KEY` is set; check spam folder)
5. Log into https://montero.cool/login as `ai@montero.cool`. You should land on YOUR portal (you're admin on client `75bd8018…`). Switch the business switcher to **"Smile Dental Temps"** (your test business). Look at `/portal/activity` — your form submission should be there as a flagged form row with the full message.

> ⚠️ **Twilio toll-free verification gate:** the SMS may not actually deliver until you verify `+18557657345` for A2P toll-free SMS at https://console.twilio.com → Messaging → Regulatory. If it doesn't arrive, that's why. Lead capture still works.

### B. Vapi inbound pathway (the big one)

1. **Call +1 (855) 765-7345.**
2. Maya should answer in English: *"Hey, I'm Maya from Smile Dental Temps. How can I help you today?"* Listen for voice quality — should now sound noticeably warmer and properly bilingual.
3. Test the IDENTITY DISCLOSURE: ask *"Are you a real person or AI?"* — she should say something like *"I'm Janeth's assistant — I help triage calls so Janeth and her team can spend their time with patients."* (Should NOT deny being AI; should NOT claim to be human.)
4. Test Spanish: say *"Hola, hablas español?"* — should switch fluently.
5. Trigger each of the 4 CTA tools by saying things like:
   - **new_application:** *"Hi, I'm a hygienist looking to register as a temp with you all."*
   - **temp_requesting_work:** *"I'm already registered, I need shifts next week."*
   - **Clinic_request_pro:** *"I run a dental office in Newark, we need a hygienist Thursday."*
   - **general_support:** *"I have a billing question."*
6. End the call (you can say *"Thanks bye"* and she should end it).
7. Within ~30 seconds, log into your portal at https://montero.cool/portal — switch to **Smile Dental Temps** — go to `/portal/activity`. You should see:
   - 1 row of `type='call'` from the end-of-call report (full transcript + recording URL in the detail)
   - 1+ row of `type='call'` per CTA Maya triggered (e.g., "New temp application: ...", "Clinic request: ...")
   - Short calls (under 15s) auto-flagged as red

### C. Function logs (debug if anything misbehaves)

Real-time function logs: https://app.netlify.com/projects/shiny-lily-eab65b/logs/functions — filter for `/api/inbound/vapi/`. Errors show as `[vapi/events] ...` or `[vapi/tools] ...`.

Vapi call detail (transcript + tool-call timeline): https://dashboard.vapi.ai/calls — find your call, click into it, see exactly what Maya heard and what she sent to montero.cool.

---

## Delivery to Janeth — same model as your n8n key flow

The architecture is already set up for this. To flip the system from "Emilio's test" to "Janeth's live":

### Three things change — only three

1. **`SDT_TEST_BUSINESS_ID` env var → Janeth's SDT business ID** (currently your test ID)
   ```bash
   netlify env:set SDT_TEST_BUSINESS_ID "522368e4-9b51-4893-8aae-cccb016cc344" --context production
   ```
   That single change re-routes every Maya call + tool log + form submission into **Janeth's** dashboard view instead of yours. She'll see calls show up in her `/portal/activity` for SDT.

2. **`JANETH_NOTIFY_PHONE` → her cell number** (instead of yours). Same `netlify env:set`.

3. **The Vapi phone number** (currently `+18557657345`) — if Janeth has an existing SDT number, port it OR set up call forwarding from her current number to the Vapi number. Customer-facing numbers should never change per the existing rule.

### Why this is so clean — the per-business architecture is already there

Janeth's portal isn't a different codebase. It's the same `/portal/*` route tree filtering by `client_id` via Supabase RLS. When she logs in, she sees ONLY her 3 businesses (SDT/SFD/Smile Consulting), not yours. The dashboard, activity feed, automations toggle, website editor — all of it works exactly the way you experience it now, just scoped to her data.

For the automations registry: when you eventually rebuild the SDT n8n workflows, you'll insert `portal_automations` rows with `client_id = a046a033…` (Janeth's) instead of `75bd8018…` (yours). She sees them as her own. The "Sync from n8n" admin button (which only admins see) lets you pull workflow updates without touching her UI.

### The "input your n8n key and it took it" flow

The `client_secrets` table is the per-tenant key store. When Janeth wants to connect HER own services (a Twilio sub-account for her business, a separate Vapi assistant trained on her own voice, a Resend domain for her own emails), the flow is:

1. Janeth opens `/portal/integrations`
2. Pastes her API key
3. Portal stores it encrypted in `client_secrets` (service='twilio', client_id=Janeth, secret_value=key)
4. Any portal route that needs to act *as Janeth* (vs. Emilio's master accounts) looks up the secret via the vault RPC `get_client_secret_plaintext(p_client_id, p_service)` and uses HERS instead of the env var fallback

The integrations page exists today; the vault is wired (it's what `/api/portal/automations` already uses for the n8n toggle). The only thing not yet polished is the per-service "connect" UI on `/portal/integrations` (would be a 1-day build when you want to give her self-serve key entry).

---

## Voice quality — what to listen for + upgrade path

The voice you'll hear tonight (Sarah / eleven_multilingual_v2) is good — but if Janeth or her clients react with *"sounds like AI"*, here's the escalation ladder:

| Tier | What | When to use | Cost |
|---|---|---|---|
| **1. Curated preset** (current) | Sarah on multilingual_v2 | Default. Should pass most casual listeners. | included in Vapi base |
| **2. Different preset** | Try `pFZP5JQG7iQjIQuC4Bku` (Lily — warmer young female), `cgSgspJ2msm6clMCkdW9` (Jessica — older, professional), `Xb7hH8MSUJpSbSDYk0k2` (Alice — UK-leaning). Each is a 30-second config change. | When Sarah doesn't fit Janeth's brand voice | included |
| **3. Voice clone of Janeth** | ElevenLabs Instant Voice Clone (30s sample, $5/mo Starter plan, 90% accuracy) | When you have a clean Janeth voice sample | $5/mo + included |
| **4. Pro Voice Clone of Janeth** | ElevenLabs Pro Voice Clone (1-3 hours of audio, $99/mo Creator plan, 99% accuracy) | When clones at Tier 3 still get detected | $99/mo |
| **5. Different provider** | Cartesia Sonic-2 (75ms latency, native multilingual, cheaper) or OpenAI Realtime (gpt-4o-realtime — most natural but you trade Vapi tools for OpenAI tools) | Only if Tier 4 still hits ceiling. ~half-day rewire on Vapi. | Cartesia ~$0.03/min, OpenAI Realtime ~$0.30/min |

**My honest recommendation:** ship Tier 1 to Janeth's SDT line tonight, listen for actual pushback for 2 weeks, then jump to Tier 3 (instant clone) if needed. Skip Tiers 2 and 4. Don't change providers — Vapi is fine.

---

## What's still NOT built (deliberate — surfacing so you know what's next)

| Pathway | Status | Build estimate |
|---|---|---|
| **Inbound email parsing** (someone emails `ai@montero.cool` → lands in portal) | ❌ no route, no Cloudflare Email Routing | 1 day |
| **Instagram / Meta DMs** | ❌ no app, no webhook, no route | 3 days |
| **Outbound calls via Maya Outbound** (cold call or appointment reminder) | 🟡 assistant exists, calls would fail at n8n tool layer same way inbound used to | 2 days to rebuild outbound tool flows in portal |
| **Higgsfield marketing creatives** | ❌ keys in env, no code | 1 day per concept |
| **Janeth clone video** | ❌ blocked on voice sample + script | 0.5 day once unblocked |
| **Self-serve integrations UI** | 🟡 backend wired (client_secrets vault), UI partial | 1 day |
| **"What to improve" insights dashboard** | ❌ no analytics view yet | 2 days once real data flows |

The Vapi side (inbound calls + dashboard visibility) is the biggest unlock and it's done as of tonight. The next-best leverage after testing tonight: **either** the Instagram pathway (if leads are coming from there) **or** the analytics view (if you want the "what to improve" feature working before showing Janeth).
