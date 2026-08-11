-- ============================================================
-- TKPRO - Estrutura do banco de dados (rode no SQL Editor do Supabase)
-- ============================================================

-- 1) PERFIS: dados publicos de cada membro (nome, bio, foto...)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  nome text,
  nicho text,
  gestao text,
  bio text,
  foto_url text,
  criado_em timestamptz default now()
);

-- Cria o perfil automaticamente quando um usuario e criado no login/webhook
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) ASSINATURAS: o coracao do controle de acesso.
--    O webhook da Cartpanda escreve aqui; o app le daqui pra liberar/bloquear.
create table public.assinaturas (
  id bigint generated always as identity primary key,
  email text unique not null,
  user_id uuid references auth.users (id),
  status text not null default 'pendente',      -- ativa | bloqueada | reembolsada | cancelada | pendente
  plano text default 'mensal',                  -- mensal | anual
  expira_em timestamptz,                        -- ate quando o acesso vale
  cartpanda_order_id text,
  atualizado_em timestamptz default now()
);

-- 3) LOG DE EVENTOS DE PAGAMENTO: cada aviso da Cartpanda fica registrado
--    (essencial pra investigar qualquer "paguei e nao entrei")
create table public.eventos_pagamento (
  id bigint generated always as identity primary key,
  evento text,
  email text,
  payload jsonb,
  recebido_em timestamptz default now()
);

-- ============================================================
-- SEGURANCA (RLS): cada membro so acessa o que deve
-- ============================================================
alter table public.profiles enable row level security;
alter table public.assinaturas enable row level security;
alter table public.eventos_pagamento enable row level security;

-- Perfis: qualquer membro logado ve os perfis (e a aba Membros);
-- cada um so edita o proprio.
create policy "membros veem perfis" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "edita o proprio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Assinaturas: cada membro ve SOMENTE a propria (pela pagina Assinatura)
create policy "ve a propria assinatura" on public.assinaturas
  for select using (auth.uid() = user_id);

-- eventos_pagamento: ninguem le pelo front (so o servidor com service_role)
