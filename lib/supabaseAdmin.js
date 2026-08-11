// Cliente ADMIN do Supabase - so roda no SERVIDOR (webhook e painel do fundador).
// Usa a service_role key, que ignora as regras de seguranca (RLS).
// NUNCA importe este arquivo em componentes de pagina/cliente.
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
