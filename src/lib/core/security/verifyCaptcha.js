export async function verifyHCaptcha(token) {
  // Allow skipping verification in development or when explicitly requested.
  if (process.env.HCAPTCHA_SKIP_VERIFY === 'true') {
    console.warn('HCAPTCHA verification skipped (HCAPTCHA_SKIP_VERIFY=true)');
    return true;
  }

  const secret = process.env.HCAPTCHA_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('HCAPTCHA secret missing; skipping verification in development');
      return true;
    }
    return false;
  }

  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${secret}`,
  });

  const data = await res.json();
  return data.success === true;
}
