"use client";
// A COMUNIDADE - protegida pelo "porteiro":
// 1) precisa estar logado; 2) precisa ter assinatura ATIVA e nao expirada.
// Quem nao passa e mandado pro login ou pra pagina de assinar.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ComunidadeUI from "@/components/ComunidadeUI";

export default function Comunidade() {
  const router = useRouter();
  const [liberado, setLiberado] = useState(null); // null = verificando

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      // Fundador sempre entra
      if (session.user.email === process.env.NEXT_PUBLIC_FOUNDER_EMAIL) { setLiberado(true); return; }

      const { data: ass } = await supabase
        .from("assinaturas")
        .select("status, expira_em")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const ativa = ass && ass.status === "ativa" && (!ass.expira_em || new Date(ass.expira_em) > new Date());
      if (!ativa) { router.replace("/assinar"); return; }
      setLiberado(true);
    })();
  }, [router]);

  if (liberado === null) {
    return <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#8A8A96", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Verificando seu acesso...</div>;
  }
  return <ComunidadeUI />;
}
