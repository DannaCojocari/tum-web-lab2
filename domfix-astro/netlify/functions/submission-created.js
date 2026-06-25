const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  const { data, form_name } = payload.payload;
  console.log('PAYLOAD:', JSON.stringify(payload));
  const formData = data || payload;
  const name    = formData.name    || 'Client';
  const phone   = formData.phone   || '—';
  const email   = formData.email   || '';
  const service = formData.service || (form_name === 'oferta' ? 'serviciu solicitat' : 'servicii de renovare');
  const message = formData.message || '';

  if (!email || !email.includes('@')) {
    return { statusCode: 200, body: 'No valid email, skipping.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const messageBlock = message
    ? `\nMesajul dumneavoastră:\n"${message}"\n`
    : '';

  const mailOptions = {
    from: `"DomFix" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Cererea dumneavoastră a fost primită — DomFix',
    text: `Bună ziua, ${name}!

Am primit cererea dumneavoastră pentru: ${service}.
${messageBlock}
Vă vom contacta în cel mai scurt timp la numărul ${phone}.

Cu respect,
Echipa DomFix
Tel: +373 60 138 297
Email: domfixmd@gmail.com
Chișinău, Moldova`,
  };

  try {
    await transporter.sendMail({
      from: `"DomFix Site" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Cerere nouă — ${service}`,
      text: `Cerere nouă primită pe domfix.md:\n\nNume: ${name}\nTelefon: ${phone}\nEmail: ${email}\nServiciu: ${service}\nMesaj: ${message || '—'}`,
    });
    return { statusCode: 200, body: 'Email sent.' };
  } catch (err) {
    console.error('Mail error:', err);
    return { statusCode: 500, body: 'Failed to send email.' };
  }
};