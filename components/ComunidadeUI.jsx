"use client";
// ============================================================
// TKPRO - Comunidade (FASE 2: tudo salvo no banco de verdade)
// Perfil, posts, comentarios, curtidas, agenda e assinatura
// agora vem do Supabase e sao compartilhados entre os membros.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const C = {
  bg: "#0B0B0F",
  surface: "#15151C",
  surface2: "#1C1C25",
  border: "#26262F",
  text: "#F2F2F5",
  muted: "#8A8A96",
  cyan: "#2AF0E6",
  pink: "#FF3B5C",
  green: "#3DDC84",
};

const TAGS = [
  { nome: "Dúvida", cor: C.cyan },
  { nome: "Resultado", cor: C.pink },
  { nome: "Criativo", cor: "#FFC24B" },
];
const corDaTag = (nome) => (TAGS.find((t) => t.nome === nome) || TAGS[0]).cor;

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; }
    body { background: ${C.bg}; }
    input::placeholder, textarea::placeholder { color: ${C.muted}; }
    button { font-family: 'Inter', sans-serif; cursor: pointer; }
    textarea { font-family: 'Inter', sans-serif; resize: none; }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .45; transform: scale(.8);} }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  `}</style>
);

const Wordmark = ({ size = 26 }) => (
  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", color: C.text, textShadow: `2px 0 0 ${C.pink}55, -2px 0 0 ${C.cyan}55`, userSelect: "none" }}>
    TKPRO<span style={{ color: C.cyan }}>.</span>
  </div>
);

const LiveDot = () => (
  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.pink, display: "inline-block", marginRight: 6, animation: "pulse 1.6s ease-in-out infinite" }} />
);

const Tag = ({ children, color = C.cyan }) => (
  <span style={{ fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}44`, background: `${color}12`, borderRadius: 999, padding: "3px 10px", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const iniciais = (nome) =>
  (nome || "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar = ({ nome, foto, size = 40 }) => {
  if (foto) {
    return <img src={foto} alt={nome || ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.cyan}33, ${C.pink}33)`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: size * 0.36, color: C.text, flexShrink: 0 }}>
      {iniciais(nome)}
    </div>
  );
};

const BotaoMini = ({ onClick, cor = C.muted, children }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", fontSize: 12.5, fontWeight: 600, color: cor, padding: 0 }}>
    {children}
  </button>
);

// ---------- helpers de data ----------
const tempoRelativo = (iso) => {
  const seg = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return "agora";
  if (seg < 3600) return `há ${Math.floor(seg / 60)}min`;
  if (seg < 86400) return `há ${Math.floor(seg / 3600)}h`;
  if (seg < 172800) return "ontem";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(/\./g, "");
};

const fmtData = (iso) => {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, "");
  const hora = `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  return `${dia} · ${hora}`;
};

const fmtDataLonga = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const paraInputLocal = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const nomeDe = (perfil, email) => (perfil && perfil.nome ? perfil.nome : (email || "Membro").split("@")[0]);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ComunidadeUI() {
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState("inicio");
  const [eu, setEu] = useState(null); // { id, email, fundador }
  const [perfil, setPerfil] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [calls, setCalls] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [curtidas, setCurtidas] = useState([]);
  const [membros, setMembros] = useState([]);

  const carregar = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    const uid = session.user.id;
    const email = (session.user.email || "").toLowerCase();
    const fundador = email === (process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "").toLowerCase();
    setEu({ id: uid, email, fundador });

    const [rPerfil, rAss, rCalls, rPosts, rComs, rCurt, rMembros] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("assinaturas").select("status, plano, expira_em, atualizado_em").eq("user_id", uid).maybeSingle(),
      supabase.from("calls").select("*").order("quando", { ascending: true }),
      supabase.from("posts").select("*, autor:profiles(nome, nicho, gestao, foto_url)").order("criado_em", { ascending: false }),
      supabase.from("comentarios").select("*, autor:profiles(nome, foto_url)").order("criado_em", { ascending: true }),
      supabase.from("curtidas").select("*"),
      supabase.from("profiles").select("id, nome, nicho, gestao, bio, foto_url").order("criado_em", { ascending: true }),
    ]);

    setPerfil(rPerfil.data || null);
    setAssinatura(rAss.data || null);
    setCalls(rCalls.data || []);
    setPosts(rPosts.data || []);
    setComentarios(rComs.data || []);
    setCurtidas(rCurt.data || []);
    setMembros(rMembros.data || []);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const sair = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (carregando || !eu) {
    return (
      <>
        <FontStyles />
        <div style={{ minHeight: "100vh", background: C.bg, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
          Carregando sua comunidade...
        </div>
      </>
    );
  }

  const abas = [
    { id: "inicio", label: "Início" },
    { id: "calls", label: "Calls" },
    { id: "gravacoes", label: "Gravações" },
    { id: "membros", label: "Membros" },
    { id: "assinatura", label: "Assinatura" },
  ];

  return (
    <>
      <FontStyles />
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: `${C.bg}EE`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Wordmark size={22} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar nome={nomeDe(perfil, eu.email)} foto={perfil && perfil.foto_url} size={32} />
            <button onClick={sair} style={{ background: "none", border: "none", color: C.muted, fontSize: 13 }}>Sair</button>
          </div>
        </header>

        <nav style={{ display: "flex", gap: 6, padding: "12px 20px 0", maxWidth: 760, margin: "0 auto", overflowX: "auto" }}>
          {abas.map((a) => (
            <button key={a.id} onClick={() => setAba(a.id)} style={{ padding: "9px 16px", borderRadius: 999, border: `1px solid ${aba === a.id ? C.cyan : C.border}`, background: aba === a.id ? `${C.cyan}14` : "transparent", color: aba === a.id ? C.cyan : C.muted, fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", flexShrink: 0 }}>
              {a.label}
            </button>
          ))}
        </nav>

        <main style={{ maxWidth: 760, margin: "0 auto", padding: "20px 20px 60px" }}>
          {aba === "inicio" && <Feed eu={eu} perfil={perfil} calls={calls} posts={posts} comentarios={comentarios} curtidas={curtidas} recarregar={carregar} />}
          {aba === "calls" && <Calls eu={eu} calls={calls} recarregar={carregar} />}
          {aba === "gravacoes" && <Gravacoes />}
          {aba === "membros" && <Membros eu={eu} perfil={perfil} membros={membros} recarregar={carregar} />}
          {aba === "assinatura" && <Assinatura eu={eu} assinatura={assinatura} />}
        </main>
      </div>
    </>
  );
}

// ============================================================
// PROXIMA CALL (contagem regressiva pela agenda real)
// ============================================================
const ProximaCall = ({ calls }) => {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const prox = calls.filter((c) => new Date(c.quando).getTime() > agora)[0];
  if (!prox) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, marginBottom: 20, fontSize: 14, color: C.muted }}>
        Nenhuma call agendada no momento.
      </div>
    );
  }
  const seg = Math.max(0, Math.floor((new Date(prox.quando).getTime() - agora) / 1000));
  const d = Math.floor(seg / 86400);
  const h = Math.floor((seg % 86400) / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  const bloco = (v, label) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: C.text }}>{String(v).padStart(2, "0")}</div>
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, #171C22)`, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <LiveDot />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.pink, letterSpacing: "0.08em" }}>PRÓXIMA CALL AO VIVO</span>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>{prox.titulo}</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{fmtData(prox.quando)}</div>
      <div style={{ display: "flex", gap: 22 }}>{bloco(d, "DIAS")}{bloco(h, "HORAS")}{bloco(m, "MIN")}{bloco(s, "SEG")}</div>
    </div>
  );
};

// ============================================================
// FEED
// ============================================================
const Feed = ({ eu, perfil, calls, posts, comentarios, curtidas, recarregar }) => {
  const publicar = async (texto, tag) => {
    await supabase.from("posts").insert({ autor_id: eu.id, texto, tag });
    recarregar();
  };
  return (
    <div>
      <ProximaCall calls={calls} />
      <NovoPost perfil={perfil} eu={eu} onPublicar={publicar} />
      <div style={{ background: C.surface, border: `1px dashed ${C.cyan}55`, borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
        📌 <strong style={{ color: C.text }}>Novo por aqui?</strong> Apresente-se no feed: quem você é, que contas gerencia e qual seu maior desafio hoje. É assim que o networking começa.
      </div>
      {posts.length === 0 && (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 14, padding: "30px 0", lineHeight: 1.6 }}>
          O feed está esperando o primeiro post. Que tal se apresentar? 👋
        </div>
      )}
      {posts.map((p) => (
        <Post key={p.id} post={p} eu={eu} perfil={perfil} comentarios={comentarios} curtidas={curtidas} recarregar={recarregar} />
      ))}
    </div>
  );
};

const NovoPost = ({ perfil, eu, onPublicar }) => {
  const [texto, setTexto] = useState("");
  const [tag, setTag] = useState("Dúvida");
  const [enviando, setEnviando] = useState(false);
  const publicar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    await onPublicar(texto.trim(), tag);
    setTexto("");
    setEnviando(false);
  };
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Avatar nome={nomeDe(perfil, eu.email)} foto={perfil && perfil.foto_url} size={38} />
        <textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Compartilhe uma dúvida, resultado ou criativo com a comunidade…" style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14.5, outline: "none", lineHeight: 1.5 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {TAGS.map((t) => (
            <button key={t.nome} onClick={() => setTag(t.nome)} style={{ padding: "6px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${tag === t.nome ? t.cor : C.border}`, background: tag === t.nome ? `${t.cor}14` : "transparent", color: tag === t.nome ? t.cor : C.muted }}>
              {t.nome}
            </button>
          ))}
        </div>
        <button onClick={publicar} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: texto.trim() && !enviando ? `linear-gradient(90deg, ${C.cyan}, #7FF7F0)` : C.surface2, color: texto.trim() && !enviando ? "#06231F" : C.muted, fontWeight: 600, fontSize: 13.5 }}>
          {enviando ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
};

const Post = ({ post, eu, perfil, comentarios, curtidas, recarregar }) => {
  const [aberto, setAberto] = useState(false);
  const [txt, setTxt] = useState("");
  const [editando, setEditando] = useState(false);
  const [txtEdit, setTxtEdit] = useState(post.texto);
  const meu = post.autor_id === eu.id;
  const podeExcluir = meu || eu.fundador;

  const coms = comentarios.filter((c) => c.post_id === post.id && !c.pai_id);
  const totalComs = comentarios.filter((c) => c.post_id === post.id).length;
  const likes = curtidas.filter((k) => k.post_id === post.id);
  const curtiu = likes.some((k) => k.user_id === eu.id);

  const curtir = async () => {
    if (curtiu) await supabase.from("curtidas").delete().eq("post_id", post.id).eq("user_id", eu.id);
    else await supabase.from("curtidas").insert({ user_id: eu.id, post_id: post.id });
    recarregar();
  };
  const comentar = async () => {
    if (!txt.trim()) return;
    await supabase.from("comentarios").insert({ post_id: post.id, autor_id: eu.id, texto: txt.trim() });
    setTxt("");
    setAberto(true);
    recarregar();
  };
  const salvarEdicao = async () => {
    if (!txtEdit.trim()) return;
    await supabase.from("posts").update({ texto: txtEdit.trim(), editado: true }).eq("id", post.id);
    setEditando(false);
    recarregar();
  };
  const excluir = async () => {
    await supabase.from("posts").delete().eq("id", post.id);
    recarregar();
  };

  const autorNome = post.autor && post.autor.nome ? post.autor.nome : "Membro";
  const papel = post.autor ? [post.autor.nicho, post.autor.gestao].filter(Boolean).join(" · ") : "";

  return (
    <div style={{ background: C.surface, border: `1px solid ${post.tag === "Resultado" ? C.pink + "44" : C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Avatar nome={autorNome} foto={post.autor && post.autor.foto_url} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 14.5, color: C.text }}>{autorNome}</span>
            <Tag color={corDaTag(post.tag)}>{post.tag}</Tag>
            {post.editado && <span style={{ fontSize: 11.5, color: C.muted }}>editado</span>}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{papel ? `${papel} · ` : ""}{tempoRelativo(post.criado_em)}</div>
        </div>
        {(meu || podeExcluir) && !editando && (
          <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
            {meu && <BotaoMini onClick={() => { setEditando(true); setTxtEdit(post.texto); }}>Editar</BotaoMini>}
            {podeExcluir && <BotaoMini onClick={excluir} cor="#E86A7A">Excluir</BotaoMini>}
          </div>
        )}
      </div>

      {editando ? (
        <div style={{ marginBottom: 14 }}>
          <textarea rows={3} value={txtEdit} onChange={(e) => setTxtEdit(e.target.value)} style={{ width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14.5, outline: "none", lineHeight: 1.55 }} />
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <BotaoMini onClick={salvarEdicao} cor={C.cyan}>Salvar</BotaoMini>
            <BotaoMini onClick={() => setEditando(false)}>Cancelar</BotaoMini>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.55, marginBottom: 14, whiteSpace: "pre-wrap" }}>{post.texto}</p>
      )}

      <div style={{ display: "flex", gap: 20, paddingBottom: aberto || coms.length ? 14 : 0, borderBottom: aberto || coms.length ? `1px solid ${C.border}` : "none", marginBottom: aberto || coms.length ? 14 : 0 }}>
        <button onClick={curtir} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: curtiu ? C.pink : C.muted }}>
          {curtiu ? "❤️" : "🤍"} {likes.length}
        </button>
        <button onClick={() => setAberto(!aberto)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: aberto ? C.cyan : C.muted }}>
          💬 {totalComs} {totalComs === 1 ? "comentário" : "comentários"}
        </button>
      </div>

      {(aberto || coms.length > 0) && (
        <div>
          {coms.map((c) => (
            <Comentario key={c.id} com={c} eu={eu} comentarios={comentarios} curtidas={curtidas} recarregar={recarregar} />
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Avatar nome={nomeDe(perfil, eu.email)} foto={perfil && perfil.foto_url} size={30} />
            <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && comentar()} placeholder="Escreva um comentário…" style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", fontFamily: "'Inter', sans-serif" }} />
            <button onClick={comentar} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: `${C.cyan}22`, color: C.cyan, fontWeight: 600, fontSize: 13 }}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Comentario = ({ com, eu, comentarios, curtidas, recarregar }) => {
  const [respondendo, setRespondendo] = useState(false);
  const [txt, setTxt] = useState("");
  const [editando, setEditando] = useState(false);
  const [txtEdit, setTxtEdit] = useState(com.texto);
  const meu = com.autor_id === eu.id;
  const podeExcluir = meu || eu.fundador;

  const respostas = comentarios.filter((c) => c.pai_id === com.id);
  const likes = curtidas.filter((k) => k.comentario_id === com.id);
  const curtiu = likes.some((k) => k.user_id === eu.id);

  const curtir = async () => {
    if (curtiu) await supabase.from("curtidas").delete().eq("comentario_id", com.id).eq("user_id", eu.id);
    else await supabase.from("curtidas").insert({ user_id: eu.id, comentario_id: com.id });
    recarregar();
  };
  const responder = async () => {
    if (!txt.trim()) return;
    await supabase.from("comentarios").insert({ post_id: com.post_id, pai_id: com.id, autor_id: eu.id, texto: txt.trim() });
    setTxt("");
    setRespondendo(false);
    recarregar();
  };
  const salvarEdicao = async () => {
    if (!txtEdit.trim()) return;
    await supabase.from("comentarios").update({ texto: txtEdit.trim(), editado: true }).eq("id", com.id);
    setEditando(false);
    recarregar();
  };
  const excluir = async (id) => {
    await supabase.from("comentarios").delete().eq("id", id);
    recarregar();
  };

  const autorNome = com.autor && com.autor.nome ? com.autor.nome : "Membro";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Avatar nome={autorNome} foto={com.autor && com.autor.foto_url} size={30} />
        <div style={{ flex: 1 }}>
          {editando ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea rows={2} value={txtEdit} onChange={(e) => setTxtEdit(e.target.value)} style={{ width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", lineHeight: 1.5 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <BotaoMini onClick={salvarEdicao} cor={C.cyan}>Salvar</BotaoMini>
                <BotaoMini onClick={() => setEditando(false)}>Cancelar</BotaoMini>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 13px" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 3 }}>
                  {autorNome}
                  {com.editado && <span style={{ fontWeight: 400, fontSize: 11.5, color: C.muted }}> · editado</span>}
                </div>
                <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{com.texto}</div>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 6, paddingLeft: 4 }}>
                <BotaoMini onClick={curtir} cor={curtiu ? C.pink : C.muted}>{curtiu ? "❤️" : "🤍"} {likes.length}</BotaoMini>
                <BotaoMini onClick={() => setRespondendo(!respondendo)}>Responder</BotaoMini>
                {meu && <BotaoMini onClick={() => { setEditando(true); setTxtEdit(com.texto); }}>Editar</BotaoMini>}
                {podeExcluir && <BotaoMini onClick={() => excluir(com.id)} cor="#E86A7A">Excluir</BotaoMini>}
              </div>
            </>
          )}

          {respostas.length > 0 && (
            <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: `2px solid ${C.border}` }}>
              {respostas.map((r) => {
                const rNome = r.autor && r.autor.nome ? r.autor.nome : "Membro";
                const rMeu = r.autor_id === eu.id;
                return (
                  <div key={r.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <Avatar nome={rNome} foto={r.autor && r.autor.foto_url} size={24} />
                    <div style={{ flex: 1 }}>
                      <div style={{ background: C.surface2, borderRadius: 10, padding: "8px 11px" }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: C.text }}>
                          {rNome}
                          {r.editado && <span style={{ fontWeight: 400, fontSize: 11, color: C.muted }}> · editado</span>}
                        </span>
                        <span style={{ fontSize: 13, color: C.text, lineHeight: 1.45, display: "block", marginTop: 2, whiteSpace: "pre-wrap" }}>{r.texto}</span>
                      </div>
                      {(rMeu || eu.fundador) && (
                        <div style={{ display: "flex", gap: 14, marginTop: 4, paddingLeft: 4 }}>
                          <BotaoMini onClick={() => excluir(r.id)} cor="#E86A7A">Excluir</BotaoMini>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {respondendo && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && responder()} placeholder={`Responder ${autorNome.split(" ")[0]}…`} style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", fontFamily: "'Inter', sans-serif" }} />
              <button onClick={responder} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: `${C.cyan}22`, color: C.cyan, fontWeight: 600, fontSize: 13 }}>Enviar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CALLS (agenda real; fundador edita)
// ============================================================
const Calls = ({ eu, calls, recarregar }) => {
  const [editandoId, setEditandoId] = useState(null);
  const [tit, setTit] = useState("");
  const [dt, setDt] = useState("");
  const prox = calls.filter((c) => new Date(c.quando).getTime() > Date.now())[0];

  const abrirEdicao = (c) => { setEditandoId(c.id); setTit(c.titulo); setDt(paraInputLocal(c.quando)); };
  const salvar = async (id) => {
    if (!tit.trim() || !dt) return;
    await supabase.from("calls").update({ titulo: tit.trim(), quando: new Date(dt).toISOString() }).eq("id", id);
    setEditandoId(null);
    recarregar();
  };

  const inputStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif", colorScheme: "dark" };

  return (
    <div>
      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
        {eu.fundador ? "Você define data e horário de cada call — a contagem do Início se ajusta pra todos os membros." : "Os encontros ao vivo da comunidade. Chegue alguns minutos antes!"}
      </p>
      {calls.map((c) => (
        <div key={c.id} style={{ background: C.surface, border: `1px solid ${prox && c.id === prox.id ? C.pink + "55" : C.border}`, borderRadius: 14, padding: 18, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {editandoId === c.id ? (
            <>
              <label style={{ fontSize: 12, color: C.muted }}>Título da call</label>
              <input style={inputStyle} value={tit} onChange={(e) => setTit(e.target.value)} />
              <label style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Data e horário</label>
              <input style={inputStyle} type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                <BotaoMini onClick={() => salvar(c.id)} cor={C.cyan}>Salvar</BotaoMini>
                <BotaoMini onClick={() => setEditandoId(null)}>Cancelar</BotaoMini>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: C.muted }}>{fmtData(c.quando)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Tag color={c.cor}>{c.formato}</Tag>
                  {eu.fundador && <BotaoMini onClick={() => abrirEdicao(c)}>Editar</BotaoMini>}
                </div>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16.5, color: C.text, lineHeight: 1.35 }}>{c.titulo}</div>
              {prox && c.id === prox.id && (
                <button style={{ alignSelf: "flex-start", marginTop: 4, padding: "10px 18px", borderRadius: 10, border: "none", background: C.pink, color: "#fff", fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center" }}>
                  <LiveDot />
                  Entrar na sala quando abrir
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================
// GRAVACOES (biblioteca - por enquanto vazia)
// ============================================================
const Gravacoes = () => (
  <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 8 }}>
      Os replays das calls vão morar aqui
    </div>
    <p style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
      Toda call ao vivo é gravada e disponibilizada nesta biblioteca. Participe da primeira e volte aqui pra rever!
    </p>
  </div>
);

// ============================================================
// MEMBROS (perfis reais + edicao do proprio)
// ============================================================
const Membros = ({ eu, perfil, membros, recarregar }) => {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState({ nome: "", nicho: "", gestao: "", bio: "", foto_url: null });
  const [salvando, setSalvando] = useState(false);

  const abrir = () => {
    setDraft({
      nome: (perfil && perfil.nome) || "",
      nicho: (perfil && perfil.nicho) || "",
      gestao: (perfil && perfil.gestao) || "",
      bio: (perfil && perfil.bio) || "",
      foto_url: (perfil && perfil.foto_url) || null,
    });
    setEditando(true);
  };
  const salvar = async () => {
    setSalvando(true);
    await supabase.from("profiles").update({
      nome: draft.nome.trim() || null,
      nicho: draft.nicho.trim() || null,
      gestao: draft.gestao.trim() || null,
      bio: draft.bio.trim() || null,
      foto_url: draft.foto_url,
    }).eq("id", eu.id);
    setSalvando(false);
    setEditando(false);
    recarregar();
  };
  const onFoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { alert("Escolha uma imagem de até 1,5 MB."); return; }
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, foto_url: r.result }));
    r.readAsDataURL(f);
  };

  const inputStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" };
  const outros = membros.filter((m) => m.id !== eu.id);
  const meuNome = nomeDe(perfil, eu.email);

  return (
    <div>
      <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, #171C22)`, border: `1px solid ${C.cyan}44`, borderRadius: 18, padding: 20, marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.cyan, letterSpacing: "0.08em", marginBottom: 14 }}>SEU PERFIL</div>
        {editando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Avatar nome={draft.nome || meuNome} foto={draft.foto_url} size={64} />
              <label style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {draft.foto_url ? "Trocar foto" : "Adicionar foto"}
                <input type="file" accept="image/*" onChange={onFoto} style={{ display: "none" }} />
              </label>
              {draft.foto_url && <BotaoMini onClick={() => setDraft((d) => ({ ...d, foto_url: null }))} cor="#E86A7A">Remover</BotaoMini>}
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>Seu nome</label>
              <input style={inputStyle} value={draft.nome} onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))} placeholder="Como quer ser chamado" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>Nicho de atuação</label>
              <input style={inputStyle} value={draft.nicho} onChange={(e) => setDraft((d) => ({ ...d, nicho: e.target.value }))} placeholder="Ex.: E-commerce · Moda" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>O que você gerencia</label>
              <input style={inputStyle} value={draft.gestao} onChange={(e) => setDraft((d) => ({ ...d, gestao: e.target.value }))} placeholder="Ex.: R$ 100k/mês em contas" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 5 }}>
                Bio rápida <span style={{ color: draft.bio.length > 140 ? C.pink : C.muted }}>({draft.bio.length}/160)</span>
              </label>
              <textarea rows={3} maxLength={160} style={{ ...inputStyle, lineHeight: 1.5 }} value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} placeholder="Conte em 1-2 frases quem você é e com o que trabalha…" />
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <button onClick={salvar} disabled={salvando} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 13.5, opacity: salvando ? 0.6 : 1 }}>
                {salvando ? "Salvando..." : "Salvar perfil"}
              </button>
              <BotaoMini onClick={() => setEditando(false)}>Cancelar</BotaoMini>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14 }}>
            <Avatar nome={meuNome} foto={perfil && perfil.foto_url} size={64} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: C.text }}>
                {meuNome} {eu.fundador && <Tag color={C.cyan}>Fundador</Tag>}
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{(perfil && perfil.nicho) || "Adicione seu nicho"}</div>
              {perfil && perfil.gestao && <div style={{ fontSize: 12.5, color: C.cyan, marginBottom: 8 }}>{perfil.gestao}</div>}
              <p style={{ fontSize: 13.5, color: perfil && perfil.bio ? C.text : C.muted, lineHeight: 1.5, fontStyle: perfil && perfil.bio ? "normal" : "italic" }}>
                {(perfil && perfil.bio) || "Sua bio ainda está vazia — é ela que os outros membros veem quando querem te conhecer."}
              </p>
              <button onClick={abrir} style={{ marginTop: 10, padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13 }}>
                Editar perfil
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
        {membros.length} {membros.length === 1 ? "membro" : "membros"} na comunidade.
      </p>
      {outros.length === 0 ? (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 13.5, padding: "20px 0", lineHeight: 1.6 }}>
          Os próximos membros que entrarem vão aparecer aqui. 🚀
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
          {outros.map((m) => (
            <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar nome={m.nome || "Membro"} foto={m.foto_url} size={44} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: C.text }}>{m.nome || "Membro"}</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>{m.nicho || "—"}</div>
                </div>
              </div>
              {m.gestao && <div style={{ fontSize: 12.5, color: C.cyan }}>{m.gestao}</div>}
              {m.bio && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, flex: 1 }}>{m.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// ASSINATURA (dados reais; pagamento gerenciado na Cartpanda)
// ============================================================
const Assinatura = ({ eu, assinatura }) => {
  if (eu.fundador) {
    return (
      <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, #171E1A)`, border: `1px solid ${C.green}44`, borderRadius: 18, padding: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.green, letterSpacing: "0.08em", marginBottom: 8 }}>✓ ACESSO DE FUNDADOR</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.text }}>Vitalício</div>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>Você é o dono da casa. Gerencie os membros em /admin/membros.</p>
      </div>
    );
  }

  const ativa = assinatura && assinatura.status === "ativa" && (!assinatura.expira_em || new Date(assinatura.expira_em) > new Date());

  return (
    <div>
      <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, ${ativa ? "#171E1A" : "#1E1717"})`, border: `1px solid ${ativa ? C.green + "44" : C.pink + "44"}`, borderRadius: 18, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: ativa ? C.green : C.pink, letterSpacing: "0.08em", marginBottom: 8 }}>
              {ativa ? "✓ ASSINATURA ATIVA" : "ASSINATURA INATIVA"}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.text }}>
              Plano {assinatura && assinatura.plano === "anual" ? "Anual" : "Mensal"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: C.text }}>
              {assinatura && assinatura.plano === "anual" ? "R$ 970" : "R$ 97"}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{assinatura && assinatura.plano === "anual" ? "/ano" : "/mês"}</div>
          </div>
        </div>

        {ativa && assinatura && assinatura.expira_em && (
          <div style={{ marginTop: 18, padding: "14px 16px", background: C.surface2, borderRadius: 12, fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
            Seu acesso está garantido até <strong>{fmtDataLonga(assinatura.expira_em)}</strong>. A renovação é feita automaticamente pela Cartpanda — quando o pagamento é confirmado, essa data se estende sozinha.
          </div>
        )}
        {!ativa && (
          <div style={{ marginTop: 18, padding: "14px 16px", background: C.surface2, borderRadius: 12, fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
            Sua assinatura não está ativa. Reative pra voltar a participar das calls e do feed.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {ativa ? (
            <a href="https://pedidos.cartpanda.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none", padding: "11px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13.5 }}>
              Gerenciar pagamento e cancelamento
            </a>
          ) : (
            <a href={process.env.NEXT_PUBLIC_CHECKOUT_URL} style={{ textDecoration: "none", padding: "11px 18px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 13.5 }}>
              Reativar assinatura
            </a>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
        Trocas de cartão, comprovantes e cancelamento são feitos no portal seguro da Cartpanda (pedidos.cartpanda.com), usando o mesmo e-mail da sua compra. Se um pagamento falhar, a Cartpanda tenta novamente nos dias seguintes antes do acesso ser pausado.
      </p>
    </div>
  );
};
