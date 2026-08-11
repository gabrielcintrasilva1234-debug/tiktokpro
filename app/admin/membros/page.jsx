"use client";
// PAINEL DO FUNDADOR - seus dados de clientes e controle de acesso.
// Mostra: quem pagou, qual plano, quando expira, quem esta bloqueado.
// Acoes: bloquear ou reativar qualquer membro na mao.
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const C = { bg: "#0B0B0F", surface: "#15151C", surface2: "#1C1C25", border: "#26262F", text: "#F2F2F5", muted: "#8A8A96", cyan: "#2AF0E6", pink: "#FF3B5C", green: "#3DDC84" };

const CorStatus = { ativa: C.green, bloqueada: C.pink, reembolsada: C.pink, cancelada: "#FFC24B", pendente: C.muted };

export default function PainelMembros() {
  const [membros, setMembros] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErro("Faca login com o e-mail de fundador."); return; }
    const r = await fetch("/api/admin/membros", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!r.ok) { setErro("Acesso restrito ao fundador."); return; }
    const j = await r.json();
    setMembros(j.membros);
  };

  useEffect(() => { carregar(); }, []);

  const agir = async (email, acao) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/admin/membros", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ email, acao }),
    });
    carregar();
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 22 }}>Painel do fundador · Membros</h1>
        {erro && <p style={{ color: C.pink }}>{erro}</p>}
        {membros && (
          <>
            <p style={{ color: C.muted, fontSize: 13.5 }}>
              {membros.length} registros · {membros.filter((m) => m.status === "ativa" && !m.expirada).length} com acesso ativo
            </p>
            {membros.map((m) => (
              <div key={m.email} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: 14.5 }}>{m.nome || m.email}</div>
                  <div style={{ color: C.muted, fontSize: 12.5 }}>{m.email}{m.nicho ? ` · ${m.nicho}` : ""}</div>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted }}>
                  Plano <strong style={{ color: C.text }}>{m.plano}</strong> · expira em <strong style={{ color: m.expirada ? C.pink : C.text }}>{fmt(m.expira_em)}</strong>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: CorStatus[m.status] || C.muted, border: `1px solid ${(CorStatus[m.status] || C.muted)}44`, borderRadius: 999, padding: "3px 10px" }}>
                  {m.expirada && m.status === "ativa" ? "EXPIRADA" : m.status.toUpperCase()}
                </span>
                {m.status === "ativa" && !m.expirada ? (
                  <button onClick={() => agir(m.email, "bloquear")} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${C.pink}55`, background: "none", color: C.pink, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Bloquear</button>
                ) : (
                  <button onClick={() => agir(m.email, "reativar")} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${C.green}55`, background: "none", color: C.green, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Reativar</button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
