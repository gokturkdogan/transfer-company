import { redirect } from "next/navigation";
import { Shield } from "lucide-react";

import { LoginForm } from "@/features/admin/components/LoginForm";
import { adminCopy } from "@/features/admin/copy";
import { getSessionAdmin } from "@/features/admin/server/auth";

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggIGQ9Ik0zNiAxOGMwIDkuOTQtOC4wNiAxOC0xOCAxOHMtMTgtOC4wNi0xOC0xOCA4LjA2LTE4IDE4LTE4IDE4IDguMDYgMTggMTh6bTAtMThjMC05Ljk0LTguMDYtMTgtMTgtMThzLTE4IDguMDYtMTggMTggOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Shield className="h-7 w-7 text-white" aria-hidden />
          </div>
          <h1 className="mt-8 text-3xl font-semibold text-white">
            {adminCopy.brand.title}
          </h1>
          <p className="mt-2 max-w-sm text-blue-100/90">
            Rezervasyon, fiyatlandırma ve operasyon yönetimi için güvenli yönetim
            paneli.
          </p>
        </div>
        <p className="relative text-xs text-blue-200/60">
          © {new Date().getFullYear()} {adminCopy.brand.title}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:p-10">
        <LoginForm />
      </div>
    </div>
  );
}
