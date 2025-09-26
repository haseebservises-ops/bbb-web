// app/admin/layout.tsx
import { IS_PROD } from "@/lib/env";
import { notFound } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (IS_PROD) notFound(); // 404 on production
  return (
    <div className="h-dvh w-dvw flex">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
