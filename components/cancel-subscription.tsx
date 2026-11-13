"use client";
import { useActionState, useEffect, useRef } from "react";
import { cancelSubscription } from "@/app/actions";

export function CancelSubscription({
  userId,
  subscriptionId,
  livemode,
}: {
  userId: string;
  subscriptionId: string;
  livemode: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(cancelSubscription, {
    ok: false,
    message: "",
  });
  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    const previous = document.body.style.overflow;
    const opened = () => {
      document.body.style.overflow = "hidden";
    };
    const closed = () => {
      document.body.style.overflow = previous;
    };
    current.addEventListener("close", closed);
    const toggled = () => {
      if (current.open) opened();
      else closed();
    };
    current.addEventListener("toggle", toggled);
    return () => {
      current.removeEventListener("close", closed);
      current.removeEventListener("toggle", toggled);
      closed();
    };
  }, []);
  return (
    <>
      <button
        className="button secondary"
        type="button"
        onClick={() => dialog.current?.showModal()}
      >
        Cancelar assinatura agora
      </button>
      <dialog
        className="subscription-dialog"
        ref={dialog}
        aria-labelledby={`cancel-${subscriptionId}`}
        onCancel={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <h2 id={`cancel-${subscriptionId}`}>Encerrar assinatura e Plus?</h2>
        <p>
          A assinatura será encerrada na Stripe e o acesso Plus termina
          imediatamente. O usuário volta ao gratuito; alertas excedentes ficam
          pausados, sem excluir suas configurações.
        </p>
        <p>
          Esta ação não solicita reembolso nem gera cobrança proporcional. Se a
          Stripe já cancelou, o Meedas apenas sincroniza o encerramento.
        </p>
        <p className="mono">
          {subscriptionId} · {livemode ? "Produção" : "Teste"}
        </p>
        <form action={action} className="edit-form">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="subscriptionId" value={subscriptionId} />
          <input type="hidden" name="livemode" value={String(livemode)} />
          <label>
            Justificativa
            <textarea
              name="reason"
              required
              minLength={10}
              maxLength={500}
              disabled={pending || state.ok}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="confirmed"
              required
              disabled={pending || state.ok}
            />
            Confirmo o encerramento imediato da assinatura e do acesso Plus.
          </label>
          {state.message ? (
            <p
              role={state.ok ? "status" : "alert"}
              className={state.ok ? "form-success" : "form-error"}
            >
              {state.message}
            </p>
          ) : null}
          <div className="subscription-dialog-actions">
            <button
              type="button"
              className="button secondary"
              disabled={pending}
              onClick={() => dialog.current?.close()}
            >
              {state.ok ? "Fechar" : "Voltar"}
            </button>
            <button className="button primary" disabled={pending || state.ok}>
              {pending
                ? "Encerrando…"
                : state.ok
                  ? "Assinatura encerrada"
                  : "Confirmar encerramento"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
