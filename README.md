# 7‑Day Health‑Coach Automation Accelerator — Landing Page

Dark, mobile‑first landing page built with **vanilla HTML + Tailwind** and a **reactive wave background**.

## Quick start
1. Open the folder and edit `index.html` (copy updates where needed).
2. Replace `assets/logo.svg` and social links in the footer.
3. Optional: connect the Netlify form to email/slack automations.

## Deploy to Netlify (drag‑and‑drop)
1. Go to Netlify → **Add new site** → **Deploy manually**.
2. Drag the **whole folder** into the drop zone.
3. In **Site settings → Domain management**, add your domain.
4. In **HTTPS** tab, click **Provision certificate** and then **Force HTTPS**.

## Deploy to Netlify (via Git)
1. Create a repo and push this folder.
2. Netlify → **Add new site** → **Import from Git** → pick repo.
3. **Build command:** (none) · **Publish directory:** `/`

## Deploy to Vercel
1. Vercel → **Add New Project** → Import your repo.
2. **Framework preset:** `Other`.
3. **Build command:** (none) · **Output directory:** `/`
4. Add domain in **Settings → Domains** and enable HTTPS.

## Forms (Netlify)
The hero card includes a Netlify form:
```html
<form name="lead" method="POST" data-netlify="true" netlify-honeypot="bot-field"> ... </form>
```
Netlify will capture submissions automatically (no backend).

## Customization
- Colors: set in `:root` inside `<style>` — `--accent`, etc.
- Replace OG image at `assets/og-image.png` and favicon at `assets/favicon.svg`.
- Change section content directly inside `index.html`.

## Notes
- This page uses Tailwind via CDN (no build step).
- The wave canvas runs under the content and reacts to mouse movement.

## Lead form automation (Email PDF + SMS + Slack)

This project includes serverless endpoints that:
- email the **Pricing + 7-Day Delivery Plan** PDF to the lead,
- optionally send an **SMS** with a download link, and
- post a **Slack** notification to your team.

### Environment variables
Set these in Vercel/Netlify dashboard:

```
RESEND_API_KEY=...
MAIL_FROM="Romanalabs <no-reply@romanalabs.com>"
MAIL_BCC=ops@romanalabs.com             # optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ

# Optional SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_FROM=+1XXXXXXXXXX

PUBLIC_BASE_URL=https://romanalabs.com   # used to link the hosted PDF
BOOKING_URL=https://calendly.com/your-calendly/strategy-call
```

Endpoints:
- **Vercel:** `/api/lead`
- **Netlify:** `/.netlify/functions/lead`

The frontend tries `/api/lead` first, then falls back to Netlify automatically.
