"use client";
import { useActionState, useState } from "react";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {
    step: "email",
    email: "",
  } satisfies LoginState);
  const [changeEmail, setChangeEmail] = useState(false);
  const codeStep = state.step === "code" && !changeEmail;
  return (
    <form
      action={action}
      className="login-form"
      onSubmit={() => setChangeEmail(false)}
    >
      <label htmlFor="email">E-mail da sua conta</label>
      <div className="input-icon">
        <Mail size={18} />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          readOnly={codeStep}
          placeholder="voce@exemplo.com.br"
        />
      </div>
      {codeStep && (
        <>
          <p className="muted">Enviamos um código para o seu e-mail.</p>
          <label htmlFor="code">Código de acesso</label>
          <div className="input-icon">
            <KeyRound size={18} />
            <input
              autoFocus
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              minLength={6}
              maxLength={8}
              required
              placeholder="000000"
            />
          </div>
        </>
      )}
      <input type="hidden" name="intent" value={codeStep ? "verify" : "send"} />
      {state.error && (
        <p role="alert" className="form-error">
          {state.error}
        </p>
      )}
      <button className="button primary" disabled={pending}>
        {pending
          ? "Aguarde…"
          : codeStep
            ? "Entrar no painel"
            : "Receber código de acesso"}
        <ArrowRight size={17} />
      </button>
      {codeStep && (
        <button
          className="text-button"
          type="button"
          onClick={() => setChangeEmail(true)}
        >
          Alterar e-mail ou solicitar novo código
        </button>
      )}
    </form>
  );
}
