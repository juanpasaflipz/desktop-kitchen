export async function sendPasswordResetEmail(email, resetUrl, tenantName) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Email] No RESEND_API_KEY — reset URL for ${email}: ${resetUrl}`);
    return;
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Desktop Kitchen <noreply@desktop.kitchen>',
        to: [email],
        subject: 'Reset your password — Desktop Kitchen',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#0d9488">Reset Your Password</h2>
            <p>We received a request to reset the password for <strong>${tenantName}</strong>.</p>
            <p style="margin:24px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reset Password</a>
            </p>
            <p style="color:#666;font-size:14px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('[Email] Failed to send password reset email:', err.message);
  }
}

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
