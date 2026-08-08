import { redirect } from "next/navigation";

import { LoginForm } from "@/features/admin/components/LoginForm";
import { getSessionAdmin } from "@/features/admin/server/auth";

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();

  if (admin) {
    redirect("/admin/locations");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
