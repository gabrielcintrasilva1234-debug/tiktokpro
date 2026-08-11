// ============================================================
// WEBHOOK DA KIWIFY - a ponte entre o pagamento e o acesso
//
// Configuracao na Kiwify: Apps > Webhooks > Criar Webhook
//   Produto: seu produto de assinatura
//   Eventos: Compra aprovada, Compra reembolsada, Chargeback,
//            Assinatura cancelada, Assinatura atrasada, Assinatura renovada
//   URL: https://SEU-APP.vercel.app/api/webhooks/kiwify?token=SEU_KIWIFY_WEBHOOK_TOKEN
//
// Dica: use o botao "Testar Webhook" da Kiwify e o painel de logs dela
// para validar tudo antes da primeira venda real.
//
// O que acontece aqui:
//   compra_aprovada / subscription_renewed -> cria usuario (se preciso),
//       marca assinatura ATIVA, renova a expiracao, envia e-mail de senha
//   compra_reembolsada / chargeback / subscription_canceled / subscription_late
//       -> marca a assinatura como bloqueada (o app barra na porta)
// ============================================================
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

const DIAS_POR_PLANO = { mensal: 35, anual: 370 };

export async function POST(request) {
  // 1) Seguranca: exige o token combinado na URL
  const url = new URL(request.url);
  if (url.searchParams.get("token") !== process.env.KIWIFY_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "token invalido" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "json invalido" }, { status: 400 });
  }

  // 2) Extrai evento e dados do comprador (parse tolerante - a Kiwify usa
  //    campos como webhook_event_type, order_status e Customer)
  const evento = (body.webhook_event_type || body.event || body.order_status || "desconhecido")
    .toString()
    .toLowerCase();
  const cliente = body.Customer || body.customer || {};
  const email = (cliente.email || body.email || "").toLowerCase().trim();
  const nome = cliente.full_name || cliente.name || [cliente.first_name, cliente.last_name].filter(Boolean).join(" ") || "";
  const orderId = (body.order_id || body.order_ref || body.id || "").toString();

  // 3) Log de auditoria: todo evento fica salvo com o JSON bruto
  await supabaseAdmin.from("eventos_pagamento").insert({ evento, email, payload: body });

  if (!email) {
    return NextResponse.json({ ok: true, aviso: "evento sem email" });
  }

  const libera =
    evento.includes("compra_aprovada") ||
    evento.includes("order_approved") ||
    evento.includes("subscription_renewed") ||
    evento === "paid";

  const bloqueia =
    evento.includes("reembols") ||
    evento.includes("refund") ||
    evento.includes("chargeback") ||
    evento.includes("subscription_canceled") ||
    evento.includes("subscription_late");

  if (libera) {
    // 4a) Garante o usuario no login do Supabase
    let userId = null;
    const { data: criado, error: erroCriacao } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (criado?.user) {
      userId = criado.user.id;
      // Novo membro: gera o link de definir senha (enviado pelo e-mail do Supabase)
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/definir-senha` },
      });
    } else if (erroCriacao) {
      // Ja existia (renovacao): busca o id
      const { data: lista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = lista?.users?.find((u) => u.email?.toLowerCase() === email)?.id || null;
    }

    // 4b) Ativa/renova com a nova expiracao
    // (detecta plano anual se o nome do produto/oferta contiver "anual")
    const plano = JSON.stringify(body).toLowerCase().includes("anual") ? "anual" : "mensal";
    const expira = new Date(Date.now() + DIAS_POR_PLANO[plano] * 864e5).toISOString();
    await supabaseAdmin.from("assinaturas").upsert(
      {
        email,
        user_id: userId,
        status: "ativa",
        plano,
        expira_em: expira,
        cartpanda_order_id: orderId, // coluna generica de id do pedido
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
    return NextResponse.json({ ok: true, acao: "acesso liberado", email, expira });
  }

  if (bloqueia) {
    const status = evento.includes("reembols") || evento.includes("refund")
      ? "reembolsada"
      : evento.includes("late")
      ? "atrasada"
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
