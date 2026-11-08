"use client";
export default function SectionError({ reset }: { reset: () => void }) {
  return (
    <section className="state-card">
      <h1>Esta seção está indisponível.</h1>
      <p className="muted">
        Verifique os filtros e a conexão com o backend. Se a sessão expirou,
        entre novamente.
      </p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
      <a className="text-button" href="/login">
        Entrar novamente
      </a>
    </section>
  );
}
