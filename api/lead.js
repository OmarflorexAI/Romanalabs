
import fs from 'fs';
import path from 'path';

async function sendEmailWithPdf(to, subject, html, pdfBuffer) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'Romanalabs <no-reply@romanalabs.com>',
      to: [to],
      bcc: process.env.MAIL_BCC ? [process.env.MAIL_BCC] : undefined,
      subject,
      html,
      attachments: [
        { filename: 'pricing-timeline.pdf', content: pdfBuffer.toString('base64') }
      ]
    })
  });
  if (!res.ok) throw new Error(`Resend failed: ${await res.text()}`);
}

async function sendSmsIfPossible(toPhone, message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from || !toPhone) return;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams({ From: from, To: toPhone, Body: message });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
  if (!res.ok) console.error('Twilio error:', await res.text());
}

async function notifySlack(payload) {
  const hook = process.env.SLACK_WEBHOOK_URL;
  if (!hook) return;
  const text = `🚀 New lead: ${payload.name || '(no name)'} · ${payload.email} ${payload.phone ? '· ' + payload.phone : ''}`;
  await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const { name, email, phone } = req.body ?? {};
    if (!email) return res.status(400).json({ ok: false, error: 'Email required' });
    const pdfPath = path.join(process.cwd(), 'assets', 'pricing-timeline.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const link = (process.env.PUBLIC_BASE_URL || '') + '/assets/pricing-timeline.pdf';
    const subject = 'Pricing + 7-Day Delivery Plan';
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0b0f0e">
        <p>Hi ${name || ''},</p>
        <p>Here’s your pricing & 7-day delivery plan. We also included our ROI guarantee.</p>
        <p>You can download it here too: <a href="${link}">${link}</a></p>
        <p>When you’re ready, book your strategy call:<br>
          <a href="${process.env.BOOKING_URL || '#'}">${process.env.BOOKING_URL || 'booking link'}</a>
        </p>
        <p>— Romanalabs</p>
      </div>`.trim();

    await sendEmailWithPdf(email, subject, html, pdfBuffer);
    if (phone) await sendSmsIfPossible(phone, `Your pricing & 7-day plan: ${link}`);
    await notifySlack({ name, email, phone });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
