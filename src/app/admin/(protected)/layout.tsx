import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import SessionProvider from "@/components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar user={session.user} />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
