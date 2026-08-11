"use server";

import { z } from "zod";

import {
  authenticateAdmin,
  deleteSession,
} from "@/features/admin/server/auth";
import { failure } from "@/server/result";
import { toPublicError } from "@/server/errors";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(rawInput: unknown) {
  const parsed = loginSchema.safeParse(rawInput);

  if (!parsed.success) {
    return failure({
      code: "VALIDATION_ERROR",
      message: "Doğrulama başarısız",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    });
  }

  try {
    await authenticateAdmin(parsed.data.email, parsed.data.password);
  } catch (error) {
    return failure(toPublicError(error));
  }

  redirect("/admin");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/admin/login");
}
