"use client";
// LOGIN REAL - mesmo visual do prototipo, agora autenticando no Supabase
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const C = { bg: "#0B0B0F", surface: "#15151C", surface2: "#1C1C25", border: "#26262F", text: "#F2F2F5", muted: "#8A8A96", cyan: "#2AF0E6", pink: "#FF3B5C" };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos. Se acabou de assinar, use o link de definir senha enviado no seu e-mail.");
      return;
    }
    router.replace("/comunidade");
  };

  const esqueci = async () => {
    if (!email) { setErro("Digite seu e-mail acima e toque de novo em Esqueci minha senha."); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/definir-senha` });
    setErro("Enviamos um link pro seu e-mail pra definir uma nova senha.");
  };

  const input = { width: "100%", padding: "13px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 34, color: C.text, textShadow: `2px 0 0 ${C.pink}55, -2px 0 0 ${C.cyan}55`, marginBottom: 10 }}>
          TKPRO<span style={{ color: C.cyan }}>.</span>
        </div>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginBottom: 28 }}>Comunidade fechada de TikTok Ads</p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>E-mail</label>
          <input style={input} placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label style={{ fontSize: 13, color: C.muted, display: "block", margin: "16px 0 6px" }}>Senha</label>
          <input style={input} type="password" placeholder="********" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} />
          {erro && <p style={{ fontSize: 12.5, color: C.pink, marginTop: 12, lineHeight: 1.5 }}>{erro}</p>}
          <button onClick={entrar} disabled={carregando} style={{ width: "100%", marginTop: 22, padding: "14px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15, cursor: "pointer", opacity: carregando ? 0.6 : 1 }}>
            {carregando ? "Entrando..." : "Entrar na comunidade"}
          </button>
          <button onClick={esqueci} style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 12, marginTop: 16, cursor: "pointer" }}>
            Esqueci minha senha
          </button>
        </div>
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL} style={{ display: "inline-block", textDecoration: "none", border: `1px solid ${C.pink}55`, borderRadius: 10, padding: "12px 22px", color: C.pink, fontWeight: 600, fontSize: 14 }}>
            Ainda nao e membro? Assinar agora
          </a>
        </div>
      </div>
    </div>
  );
}
