"use client";
// Pagina onde o novo membro cai pelo link do e-mail pra criar a senha dele
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const C = { bg: "#0B0B0F", surface: "#15151C", surface2: "#1C1C25", border: "#26262F", text: "#F2F2F5", muted: "#8A8A96", cyan: "#2AF0E6" };

export default function DefinirSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");

  const salvar = async () => {
    if (senha.length < 6) { setMsg("A senha precisa ter pelo menos 6 caracteres."); return; }
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) { setMsg("Link expirado ou invalido. Peca um novo em Esqueci minha senha."); return; }
    router.replace("/comunidade");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: 19, color: C.text, marginTop: 0 }}>Crie sua senha</h1>
        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>Seu pagamento foi confirmado. Defina a senha que voce vai usar pra entrar na TKPRO.</p>
        <input type="password" placeholder="Nova senha (min. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box", marginTop: 8 }} />
        {msg && <p style={{ fontSize: 12.5, color: "#FF3B5C", marginTop: 10 }}>{msg}</p>}
        <button onClick={salvar} style={{ width: "100%", marginTop: 18, padding: "14px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          Salvar e entrar
        </button>
      </div>
    </div>
  );
}
