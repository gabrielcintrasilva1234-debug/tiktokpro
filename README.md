# TKPRO — Comunidade paga de TikTok Ads

Seu app com login proprio (e-mail e senha), pagamento pela **Kiwify** e controle
automatico de acesso: quem paga entra; quem cancela, reembolsa, atrasa ou expira
e bloqueado na porta.

## Como funciona (visao geral)

```
Pessoa paga na Kiwify
        |
        v  (webhook "compra_aprovada" / "subscription_renewed")
Seu app (Vercel) recebe o aviso
        |
        v
Supabase: cria o usuario + marca assinatura ATIVA + data de expiracao
        |
        v
Membro recebe e-mail, define a senha e entra em /comunidade
        |
Reembolso / chargeback / cancelou / atrasou?
        -> webhook marca como bloqueada -> app barra o acesso
```

Voce (fundador) acompanha tudo em **/admin/membros**: nome, e-mail, plano,
status e expiracao de cada cliente, com botoes de bloquear/reativar na mao.

---

## PASSO 1 — Supabase (banco + login) · ~15 min

1. Crie conta gratis em https://supabase.com e crie um projeto (regiao Sao Paulo).
2. Menu **SQL Editor** > New query > cole TODO o `supabase/schema.sql` > Run.
3. Menu **Settings > API**: copie `Project URL`, `anon public` e `service_role`.
4. Menu **Authentication > URL Configuration**: em *Site URL* deixe por enquanto
   `http://localhost:3000` (vamos trocar no Passo 2).

## PASSO 2 — Subir o app na Vercel · ~15 min

1. Crie um repositorio no GitHub e envie esta pasta.
2. Em https://vercel.com > Add New Project > importe o repositorio.
3. Em **Environment Variables**, cadastre todas as variaveis do `.env.example`
   com os valores reais.
4. Deploy. Anote a URL final (ex.: `https://tkpro.vercel.app`).
5. Volte no Supabase (Auth > URL Configuration): *Site URL* =
   `https://SEU-APP.vercel.app` e adicione em *Redirect URLs*:
   `https://SEU-APP.vercel.app/definir-senha`.

## PASSO 3 — Kiwify (produto + webhook) · ~15 min

1. Crie seu produto como **Assinatura** (recorrencia mensal de R$ 97; crie
   tambem uma oferta/produto anual se quiser — inclua a palavra "anual" no
   nome, pois o app usa isso pra conceder 370 dias de acesso).
2. Copie o **link de checkout** e coloque em `NEXT_PUBLIC_CHECKOUT_URL` na Vercel.
3. Va em **Apps > Webhooks > Criar Webhook**:
   - Produto: seu produto de assinatura
   - Eventos: **Compra aprovada, Compra reembolsada, Chargeback,
     Assinatura cancelada, Assinatura atrasada, Assinatura renovada**
   - URL: `https://SEU-APP.vercel.app/api/webhooks/kiwify?token=SEU_TOKEN`
     (o mesmo valor de `KIWIFY_WEBHOOK_TOKEN` na Vercel)
4. Salve e use o botao **Testar Webhook** da propria Kiwify.

## PASSO 4 — Testar de ponta a ponta · ~10 min

1. Dispare o teste de "Compra aprovada" pelo botao Testar Webhook.
2. No Supabase (Table Editor > `eventos_pagamento`) confira se o evento chegou
   — o JSON bruto fica salvo ali.
3. Confira em `assinaturas` se o e-mail de teste ficou `ativa` com expiracao.
4. Se o payload de teste vier com campos diferentes do esperado (sem e-mail,
   por exemplo), abra `app/api/webhooks/kiwify/route.js` e ajuste o passo 2
   do parse com base no JSON que voce viu no log. E uma mudanca de 1-2 linhas.
5. Painel de logs da Kiwify (3 pontinhos do webhook > Ver logs): confirme
   status 200 nas entregas; da pra reenviar qualquer evento que falhar.
6. Faca uma compra real de valor simbolico, defina a senha pelo e-mail
   recebido, entre em /comunidade, e depois teste um reembolso pra ver o
   bloqueio funcionando. Confira tudo em /admin/membros.

---

## O que ja esta pronto vs. proxima fase

**Pronto neste projeto:**
- Login/senha real (Supabase), recuperar senha, definir senha do novo membro
- Porteiro de acesso: so entra assinatura ativa e nao expirada
- Webhook Kiwify: libera na compra/renovacao; bloqueia em reembolso,
  chargeback, cancelamento e atraso
- Banco de clientes (perfis + assinaturas + log de todos os eventos)
- Painel do fundador em /admin/membros com bloqueio/reativacao manual
- Toda a interface da comunidade (components/ComunidadeUI.jsx)

**Proxima fase (Fase 2) — ligar a interface ao banco:**
Hoje o feed, comentarios, agenda e perfil da ComunidadeUI guardam os dados
so na tela (estado local). A Fase 2 e criar as tabelas `posts`,
`comentarios`, `respostas` e `calls` no Supabase e trocar os `useState` por
leituras/gravacoes no banco, pra tudo ficar salvo e compartilhado entre os
membros. Trabalho mecanico e bem definido — ideal pra fazer com o Claude
Code apontando pra esta pasta.

## Rodar no seu computador (opcional)

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                   # abre em http://localhost:3000
```
