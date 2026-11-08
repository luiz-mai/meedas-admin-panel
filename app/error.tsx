"use client";
import { AlertTriangle } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="centered">
      <section className="state-card">
        <AlertTriangle size={35} />
        <h1>Não foi possível carregar o painel.</h1>
        <p className="muted">
          Confira a conexão com o backend e a configuração do acesso
          administrativo. Nenhum dado foi alterado.
        </p>
        <button className="button primary" onClick={reset}>
          Tentar novamente
        </button>
        <a className="text-button" href="/login">
          Voltar ao acesso
        </a>
      </section>
    </main>
  );
}
