import Link from "next/link";
export default function NotFound() {
  return (
    <main className="centered">
      <section className="state-card">
        <span className="eyebrow">404</span>
        <h1>Página não encontrada.</h1>
        <Link className="button primary" href="/overview">
          Voltar ao resumo
        </Link>
      </section>
    </main>
  );
}
