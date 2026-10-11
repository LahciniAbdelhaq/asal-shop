import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';

export const ADMIN_COOKIE = 'asal_admin';
export const CUSTOMER_COOKIE = 'asal_customer';
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');

type Payload = { sub: string; kind: 'admin' | 'customer' };

export async function signToken(p: Payload, days = 7) {
  return new SignJWT({ kind: p.kind })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined, kind: Payload['kind']) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.kind === kind && payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

const cookieOpts = (days: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1',
  path: '/',
  maxAge: days * 86400,
});

export async function setSession(kind: Payload['kind'], id: number) {
  const jar = await cookies();
  jar.set(kind === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE, await signToken({ sub: String(id), kind }), cookieOpts(7));
}

export async function clearSession(kind: Payload['kind']) {
  (await cookies()).delete(kind === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE);
}

export async function getAdmin() {
  const id = await verifyToken((await cookies()).get(ADMIN_COOKIE)?.value, 'admin');
  return id ? db.adminUser.findUnique({ where: { id } }) : null;
}

/** À appeler au début de chaque action / page du back-office. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

export async function getCustomer() {
  const id = await verifyToken((await cookies()).get(CUSTOMER_COOKIE)?.value, 'customer');
  return id ? db.customer.findUnique({ where: { id } }) : null;
}
