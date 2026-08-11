// API do painel do fundador: devolve todos os membros com status de pagamento.
// Protegida: so responde se quem chama estiver logado com o FOUNDER_EMAIL.
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "sem sessao" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user || user.email !== process.env.FOUNDER_EMAIL) {
    return NextResponse.json({ error: "acesso restrito ao fundador" }, { status: 403 });
  }

  const { data: assinaturas } = await supabaseAdmin
    .from("assinaturas")
    .select("*")
    .order("atualizado_em", { ascending: false });

  const { data: perfis } = await supabaseAdmin.from("profiles").select("email, nome, nicho");

  const membros = (assinaturas || []).map((a) => ({
    ...a,
    nome: perfis?.find((p) => p.email === a.email)?.nome || "",
    nicho: perfis?.find((p) => p.email === a.email)?.nicho || "",
    expirada: a.expira_em ? new Date(a.expira_em) < new Date() : false,
  }));

  return NextResponse.json({ membros });
}

// Bloquear/reativar manualmente um membro pelo painel
export async function POST(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const { data: { user } } = await supabaseAdmin.auth.getUser(token || "");
  if (!user || user.email !== process.env.FOUNDER_EMAIL) {
    return NextResponse.json({ error: "acesso restrito ao fundador" }, { status: 403 });
  }
  const { email, acao } = await request.json();
  const status = acao === "bloquear" ? "bloqueada" : "ativa";
  const patch = { status, atualizado_em: new Date().toISOString() };
  if (acao === "reativar") patch.expira_em = new Date(Date.now() + 35 * 864e5).toISOString();
  await supabaseAdmin.from("assinaturas").update(patch).eq("email", email);
  return NextResponse.json({ ok: true, email, status });
}
