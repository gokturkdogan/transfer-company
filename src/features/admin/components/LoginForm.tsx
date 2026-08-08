"use client";

import { LockKeyhole, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/features/admin/server/actions";
import { adminCopy, translateAdminError } from "@/features/admin/copy";
import { AdminField } from "@/features/admin/components/shell/AdminField";
import { AdminFormSection } from "@/features/admin/components/shell/AdminFormSection";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <h1 className="text-2xl font-semibold text-slate-900">
          {adminCopy.brand.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{adminCopy.login.title}</p>
      </div>

      <AdminFormSection
        title={adminCopy.login.title}
        description="Yönetim paneline erişmek için giriş yapın."
        icon={LockKeyhole}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              setError(null);
              const result = await loginAction({
                email: formData.get("email"),
                password: formData.get("password"),
              });

              if (!result.success) {
                setError(translateAdminError(result.error.message));
                return;
              }

              router.refresh();
            });
          }}
        >
          {error ? <Alert variant="destructive">{error}</Alert> : null}

          <AdminField label={adminCopy.login.email} htmlFor="email" required>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className="pl-9"
                required
              />
            </div>
          </AdminField>

          <AdminField
            label={adminCopy.login.password}
            htmlFor="password"
            required
          >
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="pl-9"
                required
              />
            </div>
          </AdminField>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? adminCopy.login.submitting : adminCopy.login.submit}
          </Button>
        </form>
      </AdminFormSection>
    </div>
  );
}
