"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register";

export default function AuthenticationPage() {
  const [view, setView] = useState<"login" | "register">("login");

  const subtitle =
    view === "login"
      ? "Converse com seus contatos de forma simples e rápida."
      : "Crie sua conta e comece a conversar agora.";

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col items-center justify-center bg-blue-600 lg:flex">
        <div className="flex flex-col items-center gap-4 text-center text-white">
          <div className="rounded-2xl bg-blue-500/60 p-4">
            <MessageSquare size={36} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ChatApp</h1>
          <p className="max-w-xs text-sm text-blue-100">{subtitle}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        {view === "login" ? (
          <LoginForm onSwitchToRegister={() => setView("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
