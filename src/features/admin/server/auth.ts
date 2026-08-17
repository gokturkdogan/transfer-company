import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverEnv } from "@/config/env";
import { db } from "@/db/client";
import { adminSessions, adminUsers } from "@/db/schema";
import {
  verifyPassword,
} from "@/features/admin/server/password";
import { UnauthorizedError } from "@/server/errors";

export { hashPassword, verifyPassword } from "@/features/admin/server/password";

const ADMIN_SESSION_COOKIE = "ADMIN_SESSION";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
};

function hashSessionToken(token: string): string {
  const secret = serverEnv.ADMIN_SESSION_SECRET ?? "";

  return createHash("sha256").update(`${token}${secret}`).digest("hex");
}

export async function createSession(adminUserId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(adminSessions).values({
    adminUserId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });

  return token;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
  }

  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE,
    path: "/admin",
  });
}

export async function getSessionAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const now = new Date();

  const [row] = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      adminId: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      isActive: adminUsers.isActive,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        gt(adminSessions.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row || !row.isActive) {
    return null;
  }

  return {
    id: row.adminId,
    email: row.email,
    name: row.name,
  };
}

export async function requireAdminSession(): Promise<AdminSessionUser> {
  const admin = await getSessionAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

/** API route handlers must throw instead of redirecting. */
export async function requireAdminApiSession(): Promise<AdminSessionUser> {
  const admin = await getSessionAdmin();

  if (!admin) {
    throw new UnauthorizedError("Oturum gerekli");
  }

  return admin;
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminSessionUser> {
  const [admin] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      passwordHash: adminUsers.passwordHash,
      isActive: adminUsers.isActive,
    })
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);

  if (!admin || !admin.isActive) {
    throw new UnauthorizedError("Geçersiz e-posta veya şifre");
  }

  if (!verifyPassword(password, admin.passwordHash)) {
    throw new UnauthorizedError("Geçersiz e-posta veya şifre");
  }

  await createSession(admin.id);

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}
