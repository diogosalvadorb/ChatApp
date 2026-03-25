"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { api } from "@/lib/api";

const schema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
});

type FormData = z.infer<typeof schema>;

interface AddContactModalProps {
  onClose: () => void;
}

export function AddContactModal({ onClose }: AddContactModalProps) {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);

    try {
      await api.contacts.sendRequest(data.email);

      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.message?.toLowerCase().includes("conflict") ||
        err?.message?.toLowerCase().includes("already")
          ? "Já existe uma solicitação para este contato."
          : "Não foi possível enviar a solicitação. Este endereço já está nos seus contatos";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <UserPlus size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Adicionar contato
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Solicitação enviada!
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Aguarde o contato aceitar sua solicitação.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                E-mail do contato
              </label>
              <input
                type="email"
                placeholder="contato@email.com"
                autoComplete="off"
                disabled={form.formState.isSubmitting}
                {...form.register("email")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
                  form.formState.errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200"
                }`}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {form.formState.isSubmitting && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {form.formState.isSubmitting ? "Enviando..." : "Enviar convite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
