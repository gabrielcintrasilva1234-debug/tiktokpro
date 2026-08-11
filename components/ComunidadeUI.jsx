import { useState, useEffect } from "react";

// ---------- Design tokens ----------
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

// ---------- Marca ----------
const Wordmark = ({ size = 26 }) => (
  <div
    style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.02em",
      color: C.text,
      textShadow: `2px 0 0 ${C.pink}55, -2px 0 0 ${C.cyan}55`,
      userSelect: "none",
    }}
  >
    TKPRO<span style={{ color: C.cyan }}>.</span>
  </div>
);

const LiveDot = () => (
  <span
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: C.pink,
      display: "inline-block",
      marginRight: 6,
      animation: "pulse 1.6s ease-in-out infinite",
    }}
  />
);

const Tag = ({ children, color = C.cyan }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      color,
      border: `1px solid ${color}44`,
      background: `${color}12`,
      borderRadius: 999,
      padding: "3px 10px",
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const iniciais = (nome) =>
  nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

// Foto do usuário logado (atualizada ao salvar o perfil; qualquer Avatar com o nome dele passa a usá-la)
let FOTO_EU = null;

const Avatar = ({ nome, size = 40, foto }) => {
  const src = foto || (nome === "Você Fundador" ? FOTO_EU : null);
  if (src) {
    return (
      <img
        src={src}
        alt={nome}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.cyan}33, ${C.pink}33)`,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.36,
        color: C.text,
        flexShrink: 0,
      }}
    >
      {iniciais(nome)}
    </div>
  );
};

// ---------- Dados ----------
const EU = "Você Fundador";

const postsIniciais = [
  {
    id: 1,
    autor: "Camila Duarte",
    papel: "Gestora de tráfego · Moda",
    tempo: "há 2h",
    tag: "Resultado",
    tagCor: C.pink,
    texto:
      "Fechei meu terceiro cliente pelo grupo! 🎯 A indicação veio do Rafael depois da call de auditoria. Obrigada, comunidade!",
    likes: 24,
    curtiu: false,
    comentarios: [
      {
        id: 11,
        autor: "Rafael Lima",
        texto: "Merecido demais, Camila! Teu trabalho na conta de moda é referência aqui. 👏",
        likes: 6,
        curtiu: false,
        respostas: [
          { id: 111, autor: "Camila Duarte", texto: "Obrigada, Rafa! Próximo café é por minha conta ☕" },
        ],
      },
      {
        id: 12,
        autor: "Juliana Prado",
        texto: "Isso que é comunidade funcionando! Parabéns 🚀",
        likes: 3,
        curtiu: false,
        respostas: [],
      },
    ],
  },
  {
    id: 2,
    autor: "Pedro Antunes",
    papel: "Media buyer · Apps",
    tempo: "há 4h",
    tag: "Dúvida",
    tagCor: C.cyan,
    texto:
      "Galera, minha campanha de instalação de app tá com CPI subindo há 3 dias mesmo sem mexer em nada. Alguém passando por isso ou é hora de renovar criativo?",
    likes: 8,
    curtiu: false,
    comentarios: [
      {
        id: 21,
        autor: "Lucas Ferreira",
        texto:
          "3 dias de subida constante geralmente é fadiga de criativo sim. Olha a frequência: se passou de 2.5, troca o hook antes de mexer no resto.",
        likes: 11,
        curtiu: false,
        respostas: [
          { id: 211, autor: "Pedro Antunes", texto: "Frequência tá em 2.8… faz sentido demais. Vou trocar hoje!" },
          { id: 212, autor: "Lucas Ferreira", texto: "Depois conta aqui o resultado, quero ver 📊" },
        ],
      },
    ],
  },
  {
    id: 3,
    autor: "Rafael Lima",
    papel: "Media buyer · E-commerce",
    tempo: "há 6h",
    tag: "Criativo",
    tagCor: "#FFC24B",
    texto:
      "Compartilhando meu melhor criativo do mês: UGC de unboxing com hook nos 2 primeiros segundos. CTR foi de 1,1% pra 2,4%. Print nos comentários.",
    likes: 31,
    curtiu: false,
    comentarios: [
      {
        id: 31,
        autor: "Marina Costa",
        texto: "Que salto! O hook era pergunta ou afirmação polêmica?",
        likes: 2,
        curtiu: false,
        respostas: [
          { id: 311, autor: "Rafael Lima", texto: "Pergunta direta: 'você ainda compra whey sem ver isso?' Simples e funcionou." },
        ],
      },
    ],
  },
  {
    id: 4,
    autor: "Juliana Prado",
    papel: "Dona de agência · Infoprodutos",
    tempo: "ontem",
    tag: "Dúvida",
    tagCor: C.cyan,
    texto:
      "Alguém mais notou CPM subindo em campanhas de conversão essa semana? Quero comparar antes da call de quinta.",
    likes: 9,
    curtiu: false,
    comentarios: [
      {
        id: 41,
        autor: "Você Fundador",
        texto: "Boa pergunta, Ju! Vou trazer os dados agregados da comunidade na call de quinta pra gente comparar.",
        likes: 5,
        curtiu: false,
        respostas: [],
      },
    ],
  },
];

// Agenda com datas reais: gera as próximas 4 quintas às 20h a partir de hoje
const gerarAgendaInicial = () => {
  const base = new Date();
  base.setHours(20, 0, 0, 0);
  let add = (4 - base.getDay() + 7) % 7; // 4 = quinta-feira
  if (add === 0 && base <= new Date()) add = 7;
  const q = (n) => {
    const d = new Date(base);
    d.setDate(d.getDate() + add + 7 * n);
    return d.toISOString();
  };
  return [
    { id: 1, quando: q(0), titulo: "O que mudou no TikTok Ads esta semana", formato: "Atualizações", cor: C.cyan },
    { id: 2, quando: q(1), titulo: "Auditoria ao vivo: conta da Camila (moda feminina)", formato: "Auditoria", cor: C.pink },
    { id: 3, quando: q(2), titulo: "Convidado: escalando infoproduto a R$ 300k/mês", formato: "Convidado", cor: "#FFC24B" },
    { id: 4, quando: q(3), titulo: "Q&A aberto — traga sua conta e suas dúvidas", formato: "Q&A", cor: "#9B8CFF" },
  ];
};

const fmtData = (iso) => {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, "");
  const hora = `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  return `${dia} · ${hora}`;
};

const paraInputLocal = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const proximaCallDe = (agenda) => {
  const agora = Date.now();
  return [...agenda]
    .filter((c) => new Date(c.quando).getTime() > agora)
    .sort((a, b) => new Date(a.quando) - new Date(b.quando))[0];
};

const gravacoes = [
  { titulo: "Smart+ Campaigns: quando usar e quando fugir", formato: "Atualizações", dur: "58 min", data: "06 ago" },
  { titulo: "Auditoria: e-commerce de suplementos do Rafael", formato: "Auditoria", dur: "1h12", data: "30 jul" },
  { titulo: "Criativos UGC que estão escalando em agosto", formato: "Atualizações", dur: "49 min", data: "23 jul" },
  { titulo: "Q&A: políticas de anúncio e contas banidas", formato: "Q&A", dur: "1h04", data: "16 jul" },
];

const membros = [
  { nome: "Camila Duarte", nicho: "Moda feminina", gestao: "R$ 80k/mês em contas", bio: "3 anos rodando TikTok Ads pra marcas de moda. Apaixonada por criativo UGC e teste rápido." },
  { nome: "Rafael Lima", nicho: "E-commerce · Suplementos", gestao: "R$ 150k/mês em contas", bio: "Do dropshipping ao e-commerce próprio. Hoje escalo suplementos com foco em LTV, não só em ROAS." },
  { nome: "Juliana Prado", nicho: "Infoprodutos", gestao: "Agência · 12 clientes", bio: "Fundadora de agência especializada em lançamentos. Time de 6 pessoas, tudo em TikTok e Meta." },
  { nome: "Pedro Antunes", nicho: "Apps e jogos", gestao: "R$ 60k/mês em contas", bio: "User acquisition pra apps. Obcecado por CPI baixo e eventos de otimização bem configurados." },
  { nome: "Marina Costa", nicho: "Beleza e skincare", gestao: "R$ 45k/mês em contas", bio: "Gestora de tráfego e criadora de conteúdo. Faço os próprios criativos das campanhas que rodo." },
  { nome: "Lucas Ferreira", nicho: "Dropshipping", gestao: "R$ 200k/mês em contas", bio: "Full time em dropshipping desde 2023. Testo 20+ criativos por semana e compartilho tudo aqui." },
];

const pagamentos = [
  { data: "10 ago 2026", valor: "R$ 97,00", status: "Pago", metodo: "Cartão •• 4412" },
  { data: "10 jul 2026", valor: "R$ 97,00", status: "Pago", metodo: "Cartão •• 4412" },
  { data: "10 jun 2026", valor: "R$ 97,00", status: "Pago", metodo: "Pix" },
];

// ---------- Login ----------
const Login = ({ onEnter, onAssinar }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Wordmark size={34} />
        </div>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginBottom: 28 }}>Comunidade fechada de TikTok Ads</p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>E-mail</label>
          <input style={inputStyle} placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label style={{ fontSize: 13, color: C.muted, display: "block", margin: "16px 0 6px" }}>Senha</label>
          <input style={inputStyle} type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <button
            onClick={onEnter}
            style={{ width: "100%", marginTop: 22, padding: "14px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15 }}
          >
            Entrar na comunidade
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 16 }}>Esqueci minha senha</p>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 20, lineHeight: 1.5 }}>
          Seu acesso é criado automaticamente após a confirmação do pagamento.
        </p>
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <button
            onClick={onAssinar}
            style={{ background: "none", border: `1px solid ${C.pink}55`, borderRadius: 10, padding: "12px 22px", color: C.pink, fontWeight: 600, fontSize: 14 }}
          >
            Ainda não é membro? Assinar agora →
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Próxima call (contagem baseada na data real da agenda) ----------
const ProximaCall = ({ agenda }) => {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const prox = proximaCallDe(agenda);
  if (!prox) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, marginBottom: 20, fontSize: 14, color: C.muted }}>
        Nenhuma call agendada. Adicione a próxima na aba Calls.
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
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>
        {prox.titulo}
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{fmtData(prox.quando)} · com você ao vivo</div>
      <div style={{ display: "flex", gap: 22 }}>{bloco(d, "DIAS")}{bloco(h, "HORAS")}{bloco(m, "MIN")}{bloco(s, "SEG")}</div>
    </div>
  );
};

// ---------- Caixa de publicação ----------
const NovoPost = ({ onPublicar }) => {
  const [texto, setTexto] = useState("");
  const [tag, setTag] = useState("Dúvida");
  const tags = [
    { nome: "Dúvida", cor: C.cyan },
    { nome: "Resultado", cor: C.pink },
    { nome: "Criativo", cor: "#FFC24B" },
  ];
  const publicar = () => {
    if (!texto.trim()) return;
    const t = tags.find((x) => x.nome === tag);
    onPublicar(texto.trim(), t.nome, t.cor);
    setTexto("");
  };
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Avatar nome={EU} size={38} />
        <textarea
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Compartilhe uma dúvida, resultado ou criativo com a comunidade…"
          style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14.5, outline: "none", lineHeight: 1.5 }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {tags.map((t) => (
            <button
              key={t.nome}
              onClick={() => setTag(t.nome)}
              style={{
                padding: "6px 13px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${tag === t.nome ? t.cor : C.border}`,
                background: tag === t.nome ? `${t.cor}14` : "transparent",
                color: tag === t.nome ? t.cor : C.muted,
              }}
            >
              {t.nome}
            </button>
          ))}
        </div>
        <button
          onClick={publicar}
          style={{
            padding: "9px 22px",
            borderRadius: 10,
            border: "none",
            background: texto.trim() ? `linear-gradient(90deg, ${C.cyan}, #7FF7F0)` : C.surface2,
            color: texto.trim() ? "#06231F" : C.muted,
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          Publicar
        </button>
      </div>
    </div>
  );
};

// ---------- Comentário (com respostas, edição e exclusão) ----------
const BotaoMini = ({ onClick, cor = C.muted, children }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", fontSize: 12.5, fontWeight: 600, color: cor, padding: 0 }}>
    {children}
  </button>
);

const Comentario = ({ com, onCurtir, onResponder, onEditar, onExcluir, onEditarResposta, onExcluirResposta }) => {
  const [respondendo, setRespondendo] = useState(false);
  const [txt, setTxt] = useState("");
  const [editando, setEditando] = useState(false);
  const [txtEdit, setTxtEdit] = useState(com.texto);
  const [respEditando, setRespEditando] = useState(null);
  const [txtRespEdit, setTxtRespEdit] = useState("");
  const meu = com.autor === EU;

  const enviar = () => {
    if (!txt.trim()) return;
    onResponder(com.id, txt.trim());
    setTxt("");
    setRespondendo(false);
  };
  const salvarEdicao = () => {
    if (!txtEdit.trim()) return;
    onEditar(com.id, txtEdit.trim());
    setEditando(false);
  };
  const salvarEdicaoResp = (rid) => {
    if (!txtRespEdit.trim()) return;
    onEditarResposta(com.id, rid, txtRespEdit.trim());
    setRespEditando(null);
  };

  const inputEdicao = (valor, setValor, onSalvar, onCancelar) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        rows={2}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{ width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", lineHeight: 1.5 }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <BotaoMini onClick={onSalvar} cor={C.cyan}>Salvar</BotaoMini>
        <BotaoMini onClick={onCancelar}>Cancelar</BotaoMini>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Avatar nome={com.autor} size={30} />
        <div style={{ flex: 1 }}>
          {editando ? (
            inputEdicao(txtEdit, setTxtEdit, salvarEdicao, () => { setEditando(false); setTxtEdit(com.texto); })
          ) : (
            <div style={{ background: C.surface2, borderRadius: 12, padding: "10px 13px" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 3 }}>
                {com.autor}
                {com.editado && <span style={{ fontWeight: 400, fontSize: 11.5, color: C.muted }}> · editado</span>}
              </div>
              <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>{com.texto}</div>
            </div>
          )}
          {!editando && (
            <div style={{ display: "flex", gap: 16, marginTop: 6, paddingLeft: 4 }}>
              <BotaoMini onClick={() => onCurtir(com.id)} cor={com.curtiu ? C.pink : C.muted}>
                {com.curtiu ? "❤️" : "🤍"} {com.likes}
              </BotaoMini>
              <BotaoMini onClick={() => setRespondendo(!respondendo)}>Responder</BotaoMini>
              {meu && (
                <>
                  <BotaoMini onClick={() => { setEditando(true); setTxtEdit(com.texto); }}>Editar</BotaoMini>
                  <BotaoMini onClick={() => onExcluir(com.id)} cor="#E86A7A">Excluir</BotaoMini>
                </>
              )}
            </div>
          )}

          {com.respostas.length > 0 && (
            <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: `2px solid ${C.border}` }}>
              {com.respostas.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Avatar nome={r.autor} size={24} />
                  <div style={{ flex: 1 }}>
                    {respEditando === r.id ? (
                      inputEdicao(txtRespEdit, setTxtRespEdit, () => salvarEdicaoResp(r.id), () => setRespEditando(null))
                    ) : (
                      <>
                        <div style={{ background: C.surface2, borderRadius: 10, padding: "8px 11px" }}>
                          <span style={{ fontWeight: 600, fontSize: 12.5, color: C.text }}>
                            {r.autor}
                            {r.editado && <span style={{ fontWeight: 400, fontSize: 11, color: C.muted }}> · editado</span>}
                          </span>
                          <span style={{ fontSize: 13, color: C.text, lineHeight: 1.45, display: "block", marginTop: 2 }}>{r.texto}</span>
                        </div>
                        {r.autor === EU && (
                          <div style={{ display: "flex", gap: 14, marginTop: 4, paddingLeft: 4 }}>
                            <BotaoMini onClick={() => { setRespEditando(r.id); setTxtRespEdit(r.texto); }}>Editar</BotaoMini>
                            <BotaoMini onClick={() => onExcluirResposta(com.id, r.id)} cor="#E86A7A">Excluir</BotaoMini>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {respondendo && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder={`Responder ${com.autor.split(" ")[0]}…`}
                style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", fontFamily: "'Inter', sans-serif" }}
              />
              <button onClick={enviar} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: `${C.cyan}22`, color: C.cyan, fontWeight: 600, fontSize: 13 }}>
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Post ----------
const Post = ({ post, onCurtirPost, onCurtirComentario, onComentar, onResponder, onEditarPost, onExcluirPost, onEditarComentario, onExcluirComentario, onEditarResposta, onExcluirResposta }) => {
  const [aberto, setAberto] = useState(false);
  const [txt, setTxt] = useState("");
  const [editando, setEditando] = useState(false);
  const [txtEdit, setTxtEdit] = useState(post.texto);
  const meu = post.autor === EU;
  const totalComs = post.comentarios.reduce((n, c) => n + 1 + c.respostas.length, 0);
  const comentar = () => {
    if (!txt.trim()) return;
    onComentar(post.id, txt.trim());
    setTxt("");
    setAberto(true);
  };
  const salvarEdicao = () => {
    if (!txtEdit.trim()) return;
    onEditarPost(post.id, txtEdit.trim());
    setEditando(false);
  };
  return (
    <div style={{ background: C.surface, border: `1px solid ${post.tag === "Resultado" ? C.pink + "44" : C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Avatar nome={post.autor} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 14.5, color: C.text }}>{post.autor}</span>
            <Tag color={post.tagCor}>{post.tag}</Tag>
            {post.editado && <span style={{ fontSize: 11.5, color: C.muted }}>editado</span>}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{post.papel} · {post.tempo}</div>
        </div>
        {meu && !editando && (
          <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
            <button onClick={() => { setEditando(true); setTxtEdit(post.texto); }} style={{ background: "none", border: "none", fontSize: 12.5, fontWeight: 600, color: C.muted, padding: 0 }}>Editar</button>
            <button onClick={() => onExcluirPost(post.id)} style={{ background: "none", border: "none", fontSize: 12.5, fontWeight: 600, color: "#E86A7A", padding: 0 }}>Excluir</button>
          </div>
        )}
      </div>
      {editando ? (
        <div style={{ marginBottom: 14 }}>
          <textarea
            rows={3}
            value={txtEdit}
            onChange={(e) => setTxtEdit(e.target.value)}
            style={{ width: "100%", background: C.surface2, border: `1px solid ${C.cyan}66`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14.5, outline: "none", lineHeight: 1.55 }}
          />
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <button onClick={salvarEdicao} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: C.cyan, padding: 0 }}>Salvar</button>
            <button onClick={() => { setEditando(false); setTxtEdit(post.texto); }} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: C.muted, padding: 0 }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>{post.texto}</p>
      )}

      <div style={{ display: "flex", gap: 20, paddingBottom: aberto || post.comentarios.length ? 14 : 0, borderBottom: aberto || post.comentarios.length ? `1px solid ${C.border}` : "none", marginBottom: aberto || post.comentarios.length ? 14 : 0 }}>
        <button onClick={() => onCurtirPost(post.id)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: post.curtiu ? C.pink : C.muted }}>
          {post.curtiu ? "❤️" : "🤍"} {post.likes}
        </button>
        <button onClick={() => setAberto(!aberto)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: aberto ? C.cyan : C.muted }}>
          💬 {totalComs} {totalComs === 1 ? "comentário" : "comentários"}
        </button>
      </div>

      {(aberto || post.comentarios.length > 0) && (
        <div>
          {post.comentarios.map((c) => (
            <Comentario
              key={c.id}
              com={c}
              onCurtir={(cid) => onCurtirComentario(post.id, cid)}
              onResponder={(cid, texto) => onResponder(post.id, cid, texto)}
              onEditar={(cid, texto) => onEditarComentario(post.id, cid, texto)}
              onExcluir={(cid) => onExcluirComentario(post.id, cid)}
              onEditarResposta={(cid, rid, texto) => onEditarResposta(post.id, cid, rid, texto)}
              onExcluirResposta={(cid, rid) => onExcluirResposta(post.id, cid, rid)}
            />
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Avatar nome={EU} size={30} />
            <input
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && comentar()}
              placeholder="Escreva um comentário…"
              style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13.5, outline: "none", fontFamily: "'Inter', sans-serif" }}
            />
            <button onClick={comentar} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: `${C.cyan}22`, color: C.cyan, fontWeight: 600, fontSize: 13 }}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Feed ----------
const Feed = ({ posts, setPosts, agenda }) => {
  const curtirPost = (id) =>
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, curtiu: !p.curtiu, likes: p.likes + (p.curtiu ? -1 : 1) } : p)));

  const curtirComentario = (pid, cid) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id === cid ? { ...c, curtiu: !c.curtiu, likes: c.likes + (c.curtiu ? -1 : 1) } : c
              ),
            }
      )
    );

  const comentar = (pid, texto) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : { ...p, comentarios: [...p.comentarios, { id: Date.now(), autor: EU, texto, likes: 0, curtiu: false, respostas: [] }] }
      )
    );

  const responder = (pid, cid, texto) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id !== cid ? c : { ...c, respostas: [...c.respostas, { id: Date.now(), autor: EU, texto }] }
              ),
            }
      )
    );

  const publicar = (texto, tag, tagCor) =>
    setPosts((ps) => [
      { id: Date.now(), autor: EU, papel: "Fundador · TKPRO", tempo: "agora", tag, tagCor, texto, likes: 0, curtiu: false, comentarios: [] },
      ...ps,
    ]);

  const editarPost = (pid, texto) =>
    setPosts((ps) => ps.map((p) => (p.id === pid ? { ...p, texto, editado: true } : p)));

  const excluirPost = (pid) => setPosts((ps) => ps.filter((p) => p.id !== pid));

  const editarComentario = (pid, cid, texto) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid ? p : { ...p, comentarios: p.comentarios.map((c) => (c.id === cid ? { ...c, texto, editado: true } : c)) }
      )
    );

  const excluirComentario = (pid, cid) =>
    setPosts((ps) =>
      ps.map((p) => (p.id !== pid ? p : { ...p, comentarios: p.comentarios.filter((c) => c.id !== cid) }))
    );

  const editarResposta = (pid, cid, rid, texto) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id !== cid ? c : { ...c, respostas: c.respostas.map((r) => (r.id === rid ? { ...r, texto, editado: true } : r)) }
              ),
            }
      )
    );

  const excluirResposta = (pid, cid, rid) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              comentarios: p.comentarios.map((c) =>
                c.id !== cid ? c : { ...c, respostas: c.respostas.filter((r) => r.id !== rid) }
              ),
            }
      )
    );

  return (
    <div>
      <ProximaCall agenda={agenda} />
      <NovoPost onPublicar={publicar} />
      {posts.map((p) => (
        <Post
          key={p.id}
          post={p}
          onCurtirPost={curtirPost}
          onCurtirComentario={curtirComentario}
          onComentar={comentar}
          onResponder={responder}
          onEditarPost={editarPost}
          onExcluirPost={excluirPost}
          onEditarComentario={editarComentario}
          onExcluirComentario={excluirComentario}
          onEditarResposta={editarResposta}
          onExcluirResposta={excluirResposta}
        />
      ))}
    </div>
  );
};

// ---------- Calls (fundador pode editar data, horário e título) ----------
const Calls = ({ agenda, setAgenda }) => {
  const [editandoId, setEditandoId] = useState(null);
  const [tit, setTit] = useState("");
  const [dt, setDt] = useState("");
  const prox = proximaCallDe(agenda);

  const abrirEdicao = (c) => {
    setEditandoId(c.id);
    setTit(c.titulo);
    setDt(paraInputLocal(c.quando));
  };
  const salvar = (id) => {
    if (!tit.trim() || !dt) return;
    setAgenda((ag) =>
      ag
        .map((c) => (c.id === id ? { ...c, titulo: tit.trim(), quando: new Date(dt).toISOString() } : c))
        .sort((a, b) => new Date(a.quando) - new Date(b.quando))
    );
    setEditandoId(null);
  };

  const inputStyle = {
    width: "100%",
    background: C.surface2,
    border: `1px solid ${C.cyan}66`,
    borderRadius: 10,
    padding: "10px 12px",
    color: C.text,
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    colorScheme: "dark",
  };

  return (
    <div>
      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
        Como fundador, você define data e horário de cada call — a contagem regressiva do Início se ajusta sozinha. Tudo fica gravado na biblioteca.
      </p>
      {agenda.map((c) => (
        <div key={c.id} style={{ background: C.surface, border: `1px solid ${prox && c.id === prox.id ? C.pink + "55" : C.border}`, borderRadius: 14, padding: 18, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {editandoId === c.id ? (
            <>
              <label style={{ fontSize: 12, color: C.muted }}>Título da call</label>
              <input style={inputStyle} value={tit} onChange={(e) => setTit(e.target.value)} />
              <label style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Data e horário</label>
              <input style={inputStyle} type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                <button onClick={() => salvar(c.id)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: C.cyan, padding: 0 }}>Salvar</button>
                <button onClick={() => setEditandoId(null)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: C.muted, padding: 0 }}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: C.muted }}>{fmtData(c.quando)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Tag color={c.cor}>{c.formato}</Tag>
                  <button onClick={() => abrirEdicao(c)} style={{ background: "none", border: "none", fontSize: 12.5, fontWeight: 600, color: C.muted, padding: 0 }}>Editar</button>
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

// ---------- Gravações ----------
const Gravacoes = () => (
  <div>
    <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
      Perdeu uma call? O replay fica disponível aqui até 24h depois do encontro.
    </p>
    {gravacoes.map((g, i) => (
      <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: C.surface2, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>▶</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{g.titulo}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{g.data} · {g.dur} · {g.formato}</div>
        </div>
      </div>
    ))}
  </div>
);

// ---------- Membros (com perfil próprio editável) ----------
const Membros = ({ perfil, setPerfil }) => {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState(perfil);

  const abrir = () => {
    setDraft(perfil);
    setEditando(true);
  };
  const salvar = () => {
    FOTO_EU = draft.foto || null;
    setPerfil(draft);
    setEditando(false);
  };
  const onFoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, foto: r.result }));
    r.readAsDataURL(f);
  };

  const inputStyle = {
    width: "100%",
    background: C.surface2,
    border: `1px solid ${C.cyan}66`,
    borderRadius: 10,
    padding: "10px 12px",
    color: C.text,
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div>
      {/* Seu perfil */}
      <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, #171C22)`, border: `1px solid ${C.cyan}44`, borderRadius: 18, padding: 20, marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.cyan, letterSpacing: "0.08em", marginBottom: 14 }}>SEU PERFIL</div>
        {editando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar nome={EU} size={64} foto={draft.foto} />
              <label
                style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                {draft.foto ? "Trocar foto" : "Adicionar foto"}
                <input type="file" accept="image/*" onChange={onFoto} style={{ display: "none" }} />
              </label>
              {draft.foto && (
                <button onClick={() => setDraft((d) => ({ ...d, foto: null }))} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#E86A7A" }}>
                  Remover
                </button>
              )}
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
              <textarea
                rows={3}
                maxLength={160}
                style={{ ...inputStyle, lineHeight: 1.5 }}
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Conte em 1-2 frases quem você é e com o que trabalha…"
              />
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <button onClick={salvar} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 13.5 }}>
                Salvar perfil
              </button>
              <button onClick={() => setEditando(false)} style={{ background: "none", border: "none", fontSize: 13.5, fontWeight: 600, color: C.muted }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 14 }}>
            <Avatar nome={EU} size={64} foto={perfil.foto} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: C.text }}>{EU}</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{perfil.nicho}</div>
              <div style={{ fontSize: 12.5, color: C.cyan, marginBottom: 8 }}>{perfil.gestao}</div>
              <p style={{ fontSize: 13.5, color: perfil.bio ? C.text : C.muted, lineHeight: 1.5, fontStyle: perfil.bio ? "normal" : "italic" }}>
                {perfil.bio || "Sua bio ainda está vazia — é ela que os outros membros veem quando querem te conhecer."}
              </p>
              <button onClick={abrir} style={{ marginTop: 10, padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13 }}>
                Editar perfil
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
        142 membros ativos. Encontre quem atua no seu nicho e conecte-se.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {membros.map((m, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar nome={m.nome} size={44} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: C.text }}>{m.nome}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{m.nicho}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: C.cyan }}>{m.gestao}</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, flex: 1 }}>{m.bio}</p>
            <button style={{ padding: "9px 0", borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13 }}>
              Conectar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Assinatura ----------
const Assinatura = () => (
  <div>
    <div style={{ background: `linear-gradient(160deg, ${C.surface} 60%, #171E1A)`, border: `1px solid ${C.green}44`, borderRadius: 18, padding: 22, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.green, letterSpacing: "0.08em", marginBottom: 8 }}>✓ ASSINATURA ATIVA</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.text }}>Plano Mensal</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Membro desde junho de 2026</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: C.text }}>R$ 97</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>/mês</div>
        </div>
      </div>
      <div style={{ marginTop: 18, padding: "14px 16px", background: C.surface2, borderRadius: 12, fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
        Próxima cobrança em <strong>10 de setembro</strong> no cartão terminado em <strong>4412</strong>. Sua vaga e seu preço de fundador ficam garantidos enquanto a assinatura estiver ativa.
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button style={{ padding: "11px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.text, fontWeight: 600, fontSize: 13.5 }}>
          Alterar forma de pagamento
        </button>
        <button style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "none", color: C.muted, fontWeight: 600, fontSize: 13.5 }}>
          Cancelar assinatura
        </button>
      </div>
    </div>

    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 12 }}>
      Histórico de pagamentos
    </div>
    {pagamentos.map((p, i) => (
      <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.data}</div>
          <div style={{ fontSize: 12.5, color: C.muted }}>{p.metodo}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.valor}</span>
          <Tag color={C.green}>{p.status}</Tag>
        </div>
      </div>
    ))}
    <p style={{ fontSize: 12.5, color: C.muted, marginTop: 14, lineHeight: 1.5 }}>
      Se um pagamento falhar, você recebe um aviso por e-mail e tem 5 dias para regularizar antes do acesso ser pausado.
    </p>
  </div>
);

// ---------- Checkout (plano → conta → pagamento → sucesso) ----------
const Checkout = ({ onConcluir, onVoltar }) => {
  const [passo, setPasso] = useState(1);
  const [plano, setPlano] = useState("mensal");
  const [conta, setConta] = useState({ nome: "", email: "", senha: "" });
  const [metodo, setMetodo] = useState("pix");
  const [cartao, setCartao] = useState({ numero: "", validade: "", cvv: "", titular: "" });
  const [pagando, setPagando] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };
  const labelStyle = { fontSize: 13, color: C.muted, display: "block", marginBottom: 6 };

  const contaOk = conta.nome.trim() && conta.email.includes("@") && conta.senha.length >= 6;
  const cartaoOk = cartao.numero.replace(/\D/g, "").length >= 13 && cartao.validade.length >= 4 && cartao.cvv.length >= 3 && cartao.titular.trim();

  const pagar = () => {
    setPagando(true);
    setTimeout(() => {
      setPagando(false);
      setPasso(4);
    }, 1800);
  };

  const Progresso = () => (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: passo >= n ? C.cyan : C.border }} />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Wordmark size={30} />
        </div>

        {/* PASSO 4 — SUCESSO */}
        {passo === 4 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.green}55`, borderRadius: 18, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.text, marginBottom: 8 }}>
              Pagamento aprovado!
            </div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>
              Sua conta foi criada com o e-mail <strong style={{ color: C.text }}>{conta.email || "informado"}</strong> e sua assinatura {plano === "mensal" ? "mensal" : "anual"} está ativa.
            </p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 22 }}>
              Você já pode participar da próxima call ao vivo e se apresentar no feed.
            </p>
            <button
              onClick={onConcluir}
              style={{ width: "100%", padding: "14px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15 }}
            >
              Entrar na comunidade
            </button>
          </div>
        ) : (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 }}>
            <Progresso />

            {/* PASSO 1 — PLANO */}
            {passo === 1 && (
              <>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: C.text, marginBottom: 4 }}>
                  Escolha seu plano
                </div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
                  Calls semanais ao vivo, networking com gestores do Brasil inteiro e atualizações do TikTok Ads toda semana.
                </p>
                {[
                  { id: "mensal", nome: "Mensal", preco: "R$ 97", sufixo: "/mês", nota: "Preço de fundador — travado enquanto sua assinatura estiver ativa" },
                  { id: "anual", nome: "Anual", preco: "R$ 970", sufixo: "/ano", nota: "2 meses grátis — equivale a R$ 80,83/mês", destaque: true },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlano(p.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: plano === p.id ? `${C.cyan}0E` : C.surface2,
                      border: `1px solid ${plano === p.id ? C.cyan : C.border}`,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 12,
                      position: "relative",
                    }}
                  >
                    {p.destaque && (
                      <span style={{ position: "absolute", top: -9, right: 14, fontSize: 10.5, fontWeight: 600, background: C.pink, color: "#fff", borderRadius: 999, padding: "3px 10px", letterSpacing: "0.04em" }}>
                        MAIS VANTAJOSO
                      </span>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{p.nome}</span>
                      <span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>{p.preco}</span>
                        <span style={{ fontSize: 12.5, color: C.muted }}>{p.sufixo}</span>
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: plano === p.id ? C.cyan : C.muted, marginTop: 6, lineHeight: 1.4 }}>{p.nota}</div>
                  </button>
                ))}
                <button
                  onClick={() => setPasso(2)}
                  style={{ width: "100%", marginTop: 8, padding: "14px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${C.cyan}, #7FF7F0)`, color: "#06231F", fontWeight: 600, fontSize: 15 }}
                >
                  Continuar
                </button>
                <button onClick={onVoltar} style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600 }}>
                  Já sou membro — fazer login
                </button>
              </>
            )}

            {/* PASSO 2 — CONTA */}
            {passo === 2 && (
              <>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: C.text, marginBottom: 4 }}>
                  Crie sua conta
                </div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
                  É com esse e-mail e senha que você vai entrar na comunidade após o pagamento.
                </p>
                <label style={labelStyle}>Nome completo</label>
                <input style={inputStyle} value={conta.nome} onChange={(e) => setConta((c) => ({ ...c, nome: e.target.value }))} placeholder="Seu nome" />
                <label style={{ ...labelStyle, marginTop: 14 }}>E-mail</label>
                <input style={inputStyle} value={conta.email} onChange={(e) => setConta((c) => ({ ...c, email: e.target.value }))} placeholder="voce@email.com" />
                <label style={{ ...labelStyle, marginTop: 14 }}>Senha (mín. 6 caracteres)</label>
                <input style={inputStyle} type="password" value={conta.senha} onChange={(e) => setConta((c) => ({ ...c, senha: e.target.value }))} placeholder="••••••••" />
                <button
                  onClick={() => contaOk && setPasso(3)}
                  style={{ width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 10, border: "none", background: contaOk ? `linear-gradient(90deg, ${C.cyan}, #7FF7F0)` : C.surface2, color: contaOk ? "#06231F" : C.muted, fontWeight: 600, fontSize: 15 }}
                >
                  Ir para o pagamento
                </button>
                <button onClick={() => setPasso(1)} style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600 }}>
                  ← Voltar
                </button>
              </>
            )}

            {/* PASSO 3 — PAGAMENTO */}
            {passo === 3 && (
              <>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: C.text, marginBottom: 4 }}>
                  Pagamento
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: C.surface2, borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13.5 }}>
                  <span style={{ color: C.muted }}>Plano {plano === "mensal" ? "Mensal" : "Anual"}</span>
                  <strong style={{ color: C.text }}>{plano === "mensal" ? "R$ 97,00/mês" : "R$ 970,00/ano"}</strong>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  {[
                    { id: "pix", label: "Pix" },
                    { id: "cartao", label: "Cartão de crédito" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMetodo(m.id)}
                      style={{ flex: 1, padding: "11px 0", borderRadius: 10, fontWeight: 600, fontSize: 13.5, border: `1px solid ${metodo === m.id ? C.cyan : C.border}`, background: metodo === m.id ? `${C.cyan}14` : "transparent", color: metodo === m.id ? C.cyan : C.muted }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {metodo === "pix" ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 160, height: 160, margin: "0 auto 14px", borderRadius: 14, background: `repeating-conic-gradient(${C.surface2} 0% 25%, #23232D 0% 50%) 0 0 / 20px 20px`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, color: C.muted, background: C.bg, padding: "4px 8px", borderRadius: 6 }}>QR Code Pix</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                      Escaneie com o app do seu banco ou use o copia e cola. O acesso libera na hora da confirmação.
                    </p>
                    <button
                      onClick={() => { setPixCopiado(true); setTimeout(() => setPixCopiado(false), 2000); }}
                      style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: pixCopiado ? C.green : C.text, fontWeight: 600, fontSize: 13 }}
                    >
                      {pixCopiado ? "✓ Código copiado" : "Copiar código Pix"}
                    </button>
                  </div>
                ) : (
                  <>
                    <label style={labelStyle}>Número do cartão</label>
                    <input style={inputStyle} inputMode="numeric" value={cartao.numero} onChange={(e) => setCartao((c) => ({ ...c, numero: e.target.value }))} placeholder="0000 0000 0000 0000" />
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Validade</label>
                        <input style={inputStyle} value={cartao.validade} onChange={(e) => setCartao((c) => ({ ...c, validade: e.target.value }))} placeholder="MM/AA" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>CVV</label>
                        <input style={inputStyle} inputMode="numeric" value={cartao.cvv} onChange={(e) => setCartao((c) => ({ ...c, cvv: e.target.value }))} placeholder="123" />
                      </div>
                    </div>
                    <label style={{ ...labelStyle, marginTop: 14 }}>Nome no cartão</label>
                    <input style={inputStyle} value={cartao.titular} onChange={(e) => setCartao((c) => ({ ...c, titular: e.target.value }))} placeholder="Como está impresso" />
                  </>
                )}

                <button
                  onClick={() => (metodo === "pix" || cartaoOk) && !pagando && pagar()}
                  style={{ width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 10, border: "none", background: pagando ? C.surface2 : metodo === "pix" || cartaoOk ? `linear-gradient(90deg, ${C.cyan}, #7FF7F0)` : C.surface2, color: pagando ? C.muted : metodo === "pix" || cartaoOk ? "#06231F" : C.muted, fontWeight: 600, fontSize: 15 }}
                >
                  {pagando ? "Processando pagamento…" : metodo === "pix" ? "Já paguei — verificar" : `Assinar por ${plano === "mensal" ? "R$ 97/mês" : "R$ 970/ano"}`}
                </button>
                <p style={{ fontSize: 11.5, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  🔒 Pagamento seguro. Cancele quando quiser, sem multa.
                </p>
                <button onClick={() => setPasso(2)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600 }}>
                  ← Voltar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- App ----------
export default function ComunidadeTikTokAds() {
  const [logado, setLogado] = useState(true); // login real e feito pelo Supabase antes de chegar aqui
  const [tela, setTela] = useState("login");
  const [aba, setAba] = useState("inicio");
  const [posts, setPosts] = useState(postsIniciais);
  const [agenda, setAgenda] = useState(gerarAgendaInicial);
  const [perfil, setPerfil] = useState({
    nicho: "TikTok Ads · Fundador da TKPRO",
    gestao: "Especialista na plataforma",
    bio: "",
    foto: null,
  });

  if (!logado) {
    return (
      <>
        <FontStyles />
        {tela === "checkout" ? (
          <Checkout onConcluir={() => { setLogado(true); setTela("login"); }} onVoltar={() => setTela("login")} />
        ) : (
          <Login onEnter={() => setLogado(true)} onAssinar={() => setTela("checkout")} />
        )}
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
            <Avatar nome={EU} size={32} />
            <button onClick={() => setLogado(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 13 }}>Sair</button>
          </div>
        </header>

        <nav style={{ display: "flex", gap: 6, padding: "12px 20px 0", maxWidth: 760, margin: "0 auto", overflowX: "auto" }}>
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                border: `1px solid ${aba === a.id ? C.cyan : C.border}`,
                background: aba === a.id ? `${C.cyan}14` : "transparent",
                color: aba === a.id ? C.cyan : C.muted,
                fontWeight: 600,
                fontSize: 13.5,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {a.label}
            </button>
          ))}
        </nav>

        <main style={{ maxWidth: 760, margin: "0 auto", padding: "20px 20px 60px" }}>
          {aba === "inicio" && <Feed posts={posts} setPosts={setPosts} agenda={agenda} />}
          {aba === "calls" && <Calls agenda={agenda} setAgenda={setAgenda} />}
          {aba === "gravacoes" && <Gravacoes />}
          {aba === "membros" && <Membros perfil={perfil} setPerfil={setPerfil} />}
          {aba === "assinatura" && <Assinatura />}
        </main>
      </div>
    </>
  );
}
