# Phase 1 Handoff — Janeth showcase-ready

What got shipped this session, what you need to do to finish wiring it, and how to test end-to-end.

---

## What shipped

| Layer | Change | Where |
|---|---|---|
| Consulting site | Form now POSTs to `https://montero.cool/api/leads/intake` (replaces dead Netlify Forms flow). Inline status feedback + email fallback on error. Honeypot preserved. | `d:\smile\consulting\dist\index.html` — deployed to https://smileconsultingplaceholder.netlify.app |
| montero.cool portal | New public route `POST /api/leads/intake` — inserts a `portal_interactions` row (`type='form'`, `flagged=true`) for the consulting business + fires a Twilio SMS to `JANETH_NOTIFY_PHONE`. CORS-locked to the consulting site origin. | `d:\make-to-n8n-toolkit\montero-cool\app\api\leads\intake\route.ts` |
| Netlify env vars | Set on `shiny-lily-eab65b` (montero.cool prod): `SUPABASE_SERVICE_ROLE_KEY`, `CONSULTING_BUSINESS_ID` | Set via netlify CLI |
| SQL seed (not yet applied) | Janeth's `onboarding_complete=true`, consulting `website_url`, 6 `portal_website_content` rows seeded from live site copy, 1 `portal_automations` display row "Lead Triage — Smile Consulting" | `scripts/seed_janeth_phase1.sql` |

---

## What I couldn't finish from this machine

DNS for `lfaqxsuscjtabsvrhlrd.supabase.co` is currently NXDOMAIN from my resolver path (the live Netlify site reaches it fine — it's a local-DNS quirk, not a Supabase outage). **You** need to do these two things from a working network:

### 1. Paste the SQL into Supabase Studio (60 seconds)

Open https://supabase.com/dashboard/project/lfaqxsuscjtabsvrhlrd/sql/new and paste the contents of `scripts/seed_janeth_phase1.sql`. Click "Run." The last SELECT returns four sanity-check rows; they should look like:

```
client    | true
business  | https://smileconsultingplaceholder.netlify.app
content   | 6
autom     | Lead Triage — Smile Consulting
```

### 2. Tell the portal where to text Janeth (30 seconds)

From `d:\make-to-n8n-toolkit\montero-cool\` run:

```
netlify env:set JANETH_NOTIFY_PHONE "+19084878669" --context production
netlify deploy --prod --build
```

Swap the number for Janeth's real mobile (the example above is the consulting business phone). If you don't want SMS for v1, skip this — the lead still lands in the dashboard, the route just returns `sms: skipped`.

> ⚠️ The `TWILIO_FROM_NUMBER` already on Netlify is `+18557657345` — a toll-free number. Toll-free SMS in the US requires verification with Twilio (Account → Messaging → Regulatory). If your first test fails with a Twilio 21610 / verification error, that's why. The lead-capture half still works.

---

## End-to-end test (do after the two steps above)

1. Open https://smileconsultingplaceholder.netlify.app — scroll to the contact section.
2. Fill out the form with your own name/email/phone (use a real phone for the SMS test).
3. Hit "Send Message". You should see a green "Thank you. We received your message and will reach out shortly." within a few seconds.
4. Log into the portal as Janeth at https://montero.cool/login. Switch the business switcher to "Smile Management and Consulting Solutions LLC."
5. Verify:
   - **Dashboard** → "Active Automations" shows 1 (the Lead Triage row).
   - **Activity** → there's a flagged "form" entry with your submission, the message visible.
   - **Website** → the 6 sections (hero/about/services/testimonials/contact/footer) are populated with editable content.
6. If you set `JANETH_NOTIFY_PHONE` to your number, your phone should have the SMS: `[Smile Consulting] New lead: ...`

If anything misbehaves, montero.cool function logs are at https://app.netlify.com/projects/shiny-lily-eab65b/logs/functions — filter for `/api/leads/intake`.

---

## What's NOT in this phase (deliberate)

- Voice agent on Vapi for Janeth — blocked on voice sample
- Janeth clone video — blocked on voice + script
- Higgsfield marketing creatives — blocked on concept/audience pick
- Multi-tenant intake at `/onboard` for new clients — that's Phase 2, after wedge research

The portal `/portal/businesses/new` page is already a solid intake for new clients you add manually — logo upload, automatic palette extraction from the logo. It's good enough for the showcase demo without further changes.
