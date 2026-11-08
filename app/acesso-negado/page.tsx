import { ShieldX } from "lucide-react";
import { signOut } from "@/app/actions";
export default function Forbidden() {
  return (
    <main className="centered">
      <section className="state-card">
        <ShieldX size={40} />
        <span className="eyebrow">ACESSO RESTRITO</span>
        <h1>Esta conta não tem acesso.</h1>
        <p className="muted">
          O painel está disponível apenas para usuários ADMIN. Solicite a
          permissão ao responsável pelo Meedas ou entre com outra conta.
        </p>
        <form action={signOut}>
          <button className="button primary">Entrar com outra conta</button>
        </form>
      </section>
    </main>
  );
}
