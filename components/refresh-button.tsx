"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="button secondary refresh-button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw size={15} />
      {pending ? "Atualizando…" : "Atualizar"}
    </button>
  );
}
