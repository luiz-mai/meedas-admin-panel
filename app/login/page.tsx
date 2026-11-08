import { ShieldCheck, Activity, ArrowUpRight } from "lucide-react";
import { LoginForm } from "@/components/login-form";
export default function Login() {
  return (
    <main className="login-page">
      <section className="login-story">
        <a href="https://app.meedas.com.br" className="brand">
          <img src="/brand/wordmark.png" alt="Meedas" />
        </a>
        <div>
          <span className="eyebrow">MEEDAS ADMIN</span>
          <h1>
            Uma visão clara.
            <br />
            Cada ponto
            <br />
            <em>sob controle.</em>
          </h1>
          <p>Catálogo, coletas e operação em um só lugar.</p>
          <div className="story-note">
            <Activity size={20} />
            <span>Informação confiável começa com uma boa operação.</span>
          </div>
        </div>
        <a className="back-app" href="https://app.meedas.com.br">
          Ir para o Meedas <ArrowUpRight size={16} />
        </a>
      </section>
      <section className="login-content">
        <div className="login-card">
          <div className="login-shield">
            <ShieldCheck size={26} />
          </div>
          <span className="eyebrow">ACESSO RESTRITO</span>
          <h2>Bem-vindo à operação.</h2>
          <p className="muted">
            Entre com sua conta Meedas. Somente usuários com permissão ADMIN
            podem acessar o painel.
          </p>
          <LoginForm />
          <p className="login-footnote">
            Sem senha. Use o código enviado ao seu e-mail.
          </p>
        </div>
      </section>
    </main>
  );
}
