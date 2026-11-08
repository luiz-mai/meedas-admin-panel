import { adminSession } from "@/lib/backend";
import { Sidebar } from "@/components/sidebar";
import { signOut } from "@/app/actions";
import { LogOut, ShieldCheck } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await adminSession();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="workspace">
        <header className="topbar">
          <span className="topbar-context">
            <ShieldCheck size={15} /> Área administrativa
          </span>
          <div className="account">
            <span className="role-pill">ADMIN</span>
            <span className="account-email">{session.user.email}</span>
            <form action={signOut}>
              <button title="Sair" aria-label="Sair" className="icon-button">
                <LogOut size={17} />
              </button>
            </form>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>Meedas · Administração</span>
          <span>Horários de Brasília</span>
        </footer>
      </div>
    </div>
  );
}
