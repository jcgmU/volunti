export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // If no secret key is configured, bypass the check in development
    // but log a warning
    console.warn('TURNSTILE_SECRET_KEY is not configured. Bypassing captcha verification.');
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}
