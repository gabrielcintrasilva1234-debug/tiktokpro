"use client";
// Quem loga sem assinatura ativa cai aqui (expirou, cancelou ou reembolsou)
const C = { bg: "#0B0B0F", surface: "#15151C", border: "#26262F", text: "#F2F2F5", muted: "#8A8A96", cyan: "#2AF0E6", pink: "#FF3B5C" };

export default function Assinar() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 420, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h1 style={{ fontSize: 20, color: C.text, margin: "0 0 8px" }}>Sua assinatura nao esta ativa</h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          Pode ser um pagamento pendente, expirado ou cancelado. Assim que o pagamento for confirmado na Cartpanda, seu acesso volta automaticamente em ate alguns minutos.
        </p>
        <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL}
          style={{ display: "inline-block", marginTop: 14, textDecoration: "none", padding: "14px 26px", borderRadius: 10, background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15 }}>
          Reativar assinatura
        </a>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>Pagou agora ha pouco? Aguarde 2 minutos e recarregue a pagina.</p>
      </div>
    </div>
  );
}
