"use client";
import { useActionState } from "react";
import { Save } from "lucide-react";
import { editCatalog } from "@/app/actions";
export function EditCatalog({
  resource,
  row,
}: {
  resource: "stores" | "programs";
  row: { id: string; name: string; active: boolean };
}) {
  const [state, action, pending] = useActionState(editCatalog, {
    ok: false,
    message: "",
  });
  return (
    <details className="edit-details">
      <summary>Editar cadastro</summary>
      <form action={action} className="edit-form">
        <input type="hidden" name="resource" value={resource} />
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="expectedName" value={row.name} />
        <input type="hidden" name="expectedActive" value={String(row.active)} />
        <label>
          Nome
          <input name="name" required maxLength={150} defaultValue={row.name} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="active" defaultChecked={row.active} />{" "}
          Cadastro ativo
        </label>
        <label>
          Justificativa
          <textarea
            name="reason"
            required
            minLength={10}
            maxLength={500}
            placeholder="Descreva o motivo da alteração"
          />
        </label>
        <p className="muted">
          Desativar altera a disponibilidade no catálogo. Coletas futuras podem
          atualizar o cadastro.
        </p>
        {state.message && (
          <p role="status" className={state.ok ? "form-success" : "form-error"}>
            {state.message}
          </p>
        )}
        <button className="button primary" disabled={pending || state.ok}>
          <Save size={15} />
          {pending
            ? "Salvando…"
            : state.ok
              ? "Alteração salva"
              : "Salvar alteração"}
        </button>
      </form>
    </details>
  );
}
