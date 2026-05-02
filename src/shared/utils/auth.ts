export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem('admin_auth') === 'true';
}

export function setAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    sessionStorage.removeItem('admin_auth');
  }
}
