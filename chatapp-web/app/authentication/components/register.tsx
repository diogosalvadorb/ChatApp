"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Informe um e-mail válido"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      await api.auth.register(data.name, data.email, data.password);
      toast.success("Conta criada com sucesso! Fazendo login...");

      const loginResp = await api.auth.login(data.email, data.password);
      const authData = loginResp as unknown as {
        token: string;
        user: { id: string; name: string; email: string; createdAt: string };
      };

      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));
      
      router.push("/chat");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message;
    
      toast.error(message?.toLowerCase().includes("email")
          ? "Este e-mail já está em uso."
          : message || "Erro ao criar conta."
      );
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Criar conta
        </h2>
        <p className="text-sm text-gray-500">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            disabled={isLoading}
            {...form.register("name")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none ${
              form.formState.errors.name ? "border-red-400" : "border-gray-300"
            }`}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isLoading}
            {...form.register("email")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none ${
              form.formState.errors.email ? "border-red-400" : "border-gray-300"
            }`}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              {...form.register("password")}
              className={`w-full rounded-md border px-3 py-2 pr-10 text-sm shadow-sm outline-none ${
                form.formState.errors.password
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Confirmar senha
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              {...form.register("confirmPassword")}
              className={`w-full rounded-md border px-3 py-2 pr-10 text-sm shadow-sm outline-none ${
                form.formState.errors.confirmPassword
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
