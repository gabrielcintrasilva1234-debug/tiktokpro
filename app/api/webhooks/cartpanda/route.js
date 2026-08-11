// ============================================================
// WEBHOOK DA CARTPANDA - a ponte entre o pagamento e o acesso
// Eventos esperados: Pedido pago, Pedido reembolsado,
// Assinatura Criada, Assinatura Cancelada
// ============================================================
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

const DIAS_POR_PLANO = { mensal: 35, anual: 370 };

export async function POST(request) {
  // 1) Seguranca: exige o token combinado na URL
  const token = new URL(request.url).searchParams.get("token");
  if (token !== process.env.CARTPANDA_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "token invalido" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "json invalido" }, { status: 400 });
  }

  // 2) Extrai evento e dados do comprador (parse tolerante)
  const evento = (body.event || body.type || body.webhook_event || "desconhecido")
    .toString()
    .toLowerCase();
  const order = body.order || body.data || body;
  const customer = order.customer || order.client || body.customer || {};
  const email = (customer.email || order.email || body.email || "").toLowerCase().trim();
  const nome =
    customer.name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "";
  const orderId = (order.id || order.order_id || body.id || "").toString();

  // 3) Log de auditoria: todo evento fica salvo com o JSON bruto
  await supabaseAdmin.from("eventos_pagamento").insert({ evento, email, payload: body });

  if (!email) {
    return NextResponse.json({ ok: true, aviso: "evento sem email" });
  }

  const libera =
    evento.includes("paid") ||
    evento.includes("pago") ||
    evento.includes("assinatura criada") ||
    evento.includes("subscription.created") ||
    evento.includes("subscription_created");

  const bloqueia =
    evento.includes("refund") ||
    evento.includes("reembols") ||
    evento.includes("chargeback") ||
    evento.includes("cancel");

  if (libera) {
    // 4a) Garante o usuario no login do Supabase
    let userId = null;
    const { data: criado, error: erroCriacao } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (criado && criado.user) {
      userId = criado.user.id;
      // Novo membro: gera o link "defina sua senha" (enviado pelo e-mail do Supabase)
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/definir-senha` },
      });
    } else if (erroCriacao) {
      // Ja existia (renovacao): busca o id
      const { data: lista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const achado = lista && lista.users
        ? lista.users.find((u) => (u.email || "").toLowerCase() === email)
        : null;
      userId = achado ? achado.id : null;
    }

    // 4b) Ativa/renova a assinatura com a nova expiracao
    const plano = JSON.stringify(body).toLowerCase().includes("anual") ? "anual" : "mensal";
    const expira = new Date(Date.now() + DIAS_POR_PLANO[plano] * 864e5).toISOString();
    await supabaseAdmin.from("assinaturas").upsert(
      {
        email,
        user_id: userId,
        status: "ativa",
        plano,
        expira_em: expira,
        cartpanda_order_id: orderId,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
    return NextResponse.json({ ok: true, acao: "acesso liberado", email, expira });
  }

  if (bloqueia) {
    const status =
      evento.includes("refund") || evento.includes("reembols")
        ? "reembolsada"
        : evento.includes("chargeback")
        ? "chargeback"
        : "cancelada";
    await supabaseAdmin
      .from("assinaturas")
      .update({ status, atualizado_em: new Date().toISOString() })
      .eq("email", email);
    return NextResponse.json({ ok: true, acao: "acesso bloqueado", email, status });
  }

  return NextResponse.json({ ok: true, acao: "evento ignorado", evento });
}
