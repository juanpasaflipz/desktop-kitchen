export async function sendPinEmail(email, pin, restaurantName, subdomain) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email] No RESEND_API_KEY — PIN for ${email}: ${pin}`);
    return;
  }
  const loginUrl = subdomain
    ? `https://${subdomain}.desktop.kitchen`
    : 'https://pos.desktop.kitchen';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Desktop Kitchen <noreply@desktop.kitchen>',
        to: [email],
        subject: `Your POS Login PIN — ${restaurantName}`,
        html: `<h2>Welcome to Desktop Kitchen!</h2><p>Your admin PIN: <strong style="font-size:24px">${pin}</strong></p><p>Log in at <a href="${loginUrl}">${loginUrl.replace('https://', '')}</a></p>`,
      }),
    });
  } catch (err) {
    console.error('[Email] Failed to send PIN email:', err.message);
  }
}
