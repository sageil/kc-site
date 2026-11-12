import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3000;
const PUBLIC = process.env.SITE_DIR || fileURLToPath(new URL('./public', import.meta.url));

const smtp = process.env.SMTP_HOST;
if (!smtp && process.env.NODE_ENV === 'production') throw new Error('SMTP_HOST is required in production');
const transport = smtp
  ? nodemailer.createTransport({
      host: smtp,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });
const MAIL_TO = process.env.MAIL_TO || 'hello@kodacode.dev';
const MAIL_FROM = process.env.MAIL_FROM || MAIL_TO;

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
app.use(compression());

app.post('/api/waitlist',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false }),
  express.urlencoded({ extended: false, limit: '4kb' }),
  async (req, res) => {
    const field = (k, max) => String(req.body?.[k] ?? '').trim().slice(0, max);
    const email = field('email', 254);

    if (field('website', 200)) return res.json({ ok: true });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'invalid' });

    try {
      const info = await transport.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: `Waitlist: ${email}`,
        text: `${email} joined the KodaCode waitlist on ${new Date().toISOString()}.`,
      });
      if (!smtp) console.log('[waitlist] SMTP not configured, message not sent:\n', info.message.toString());
      res.json({ ok: true });
    } catch (err) {
      console.error('[waitlist] send failed', err);
      res.status(502).json({ ok: false, error: 'send_failed' });
    }
  });

app.use(express.static(PUBLIC, {
  setHeaders: (res, file) => res.setHeader('Cache-Control', file.endsWith('.html')
    ? 'no-cache'
    : 'public, max-age=86400, stale-while-revalidate=604800'),
}));
app.use((req, res) => res.status(404).sendFile('404.html', { root: PUBLIC }));

app.listen(PORT, () => console.log(`KodaCode running on http://localhost:${PORT}`));
