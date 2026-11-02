/* =========================================================
   FORNALHA · Motor de transformação — apenas aparência (dados simulados)
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = (id, cls = "") => `<svg class="ic ${cls}"><use href="#i-${id}"/></svg>`;
  const pad = (n) => String(n).padStart(2, "0");
  const now = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const hhmm = (minAtras) => { const d = new Date(Date.now() - minAtras * 60000); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------------- dados de demonstração ---------------- */
  const APIS = [
    { id: "cotacao", nome: "Cotação", rota: "GET /b3/cotacao" },
    { id: "grafico", nome: "Gráfico", rota: "GET /b3/candles" },
    { id: "alerta", nome: "Alerta", rota: "POST /alertas/push" },
    { id: "noticias", nome: "Notícias", rota: "GET /noticias/financas" },
    { id: "calculo", nome: "Cálculo", rota: "POST /mat/calcular" },
    { id: "agenda", nome: "Agenda", rota: "GET /agenda/eventos" },
    { id: "clima", nome: "Clima", rota: "GET /clima/previsao" },
    { id: "voz", nome: "Voz", rota: "POST /voz/falar" },
    { id: "email", nome: "E-mail", rota: "POST /email/enviar" },
    { id: "ocr", nome: "Leitura de documentos", rota: "POST /ocr/ler" },
    { id: "traducao", nome: "Tradução", rota: "POST /traduzir" },
    { id: "transcricao", nome: "Transcrição", rota: "POST /voz/transcrever" },
  ];
  const apiNome = (id) => APIS.find((a) => a.id === id)?.nome ?? id;

  const state = {
    selecionadas: new Set(),
    fundindo: false,
    habilidades: [
      { nome: "Acompanhar ação", ia: "Miquéias", receita: ["cotacao", "grafico", "alerta"], status: "aprovada", quando: 42 },
      { nome: "Resumo da manhã", ia: "Horácio", receita: ["agenda", "clima", "noticias", "voz"], status: "aprovada", quando: 95 },
      { nome: "Calcular posição", ia: "Miquéias", receita: ["cotacao", "calculo"], status: "aprovada", quando: 160 },
      { nome: "Avisar compromisso", ia: "Horácio", receita: ["agenda", "alerta"], status: "aprovada", quando: 240 },
      { nome: "Tradução simultânea", ia: "Horácio", receita: ["transcricao", "traducao", "voz"], status: "reprovada", quando: 300 },
      { nome: "Varredura de notícias", ia: "Miquéias", receita: ["noticias", "cotacao", "alerta"], status: "reprovada", quando: 380 },
      { nome: "Ler e responder documento", ia: "Horácio", receita: ["ocr", "traducao", "email"], status: "em prova", quando: 12 },
    ],
    fornadas: [
      { id: 31, nome: "Ler e responder documento", ia: "Horácio", etapa: 2, pct: 58 },
      { id: 32, nome: "Carteira diária", ia: "Miquéias", etapa: 1, pct: 34 },
      { id: 33, nome: "Lembrete por voz", ia: "Horácio", etapa: 0, pct: 12 },
    ],
    provas: [
      { nome: "Ler e responder documento", tipo: "habilidade", alvo: "Horácio", status: "em prova",
        testes: [["Situações difíceis", "ok", "PDF torto, 3 idiomas"], ["Erros", "run", "OCR fora do ar"], ["Sobrecarga", "wait", "200 docs/min"]] },
      { nome: "Horácio HoV 1.1", tipo: "ia", alvo: "protótipo do Bezalel", status: "em prova",
        testes: [["Situações difíceis", "run", "pedidos ambíguos"], ["Erros", "wait", "API sem resposta"], ["Sobrecarga", "wait", "50 conversas juntas"]] },
      { nome: "Acompanhar ação", tipo: "habilidade", alvo: "Miquéias", status: "aprovado", motivo: "Passou nas 3 provas. p95 de 640 ms com 500 req/s.",
        testes: [["Situações difíceis", "ok", "pregão fechado"], ["Erros", "ok", "cotação atrasada"], ["Sobrecarga", "ok", "500 req/s"]] },
      { nome: "Resumo da manhã", tipo: "habilidade", alvo: "Horácio", status: "aprovado", motivo: "Passou nas 3 provas. Troca de API de clima sem perder o resumo.",
        testes: [["Situações difíceis", "ok", "agenda vazia"], ["Erros", "ok", "clima fora do ar"], ["Sobrecarga", "ok", "100 req/s"]] },
      { nome: "Calcular posição", tipo: "habilidade", alvo: "Miquéias", status: "aprovado", motivo: "Passou nas 3 provas. Resultados conferidos com 1.000 casos.",
        testes: [["Situações difíceis", "ok", "ativos fracionados"], ["Erros", "ok", "valor faltando"], ["Sobrecarga", "ok", "300 req/s"]] },
      { nome: "Tradução simultânea", tipo: "habilidade", alvo: "Horácio", status: "reprovado", motivo: "Lenta demais: p95 de 2.840 ms (limite 1.200 ms) sob sobrecarga.",
        testes: [["Situações difíceis", "ok", "sotaques"], ["Erros", "ok", "áudio cortado"], ["Sobrecarga", "fail", "2.840 ms"]] },
      { nome: "Varredura de notícias", tipo: "habilidade", alvo: "Miquéias", status: "reprovado", motivo: "Desperdício: 14 chamadas por uso, 9 repetidas. Limite é 8.",
        testes: [["Situações difíceis", "ok", "notícia duplicada"], ["Erros", "fail", "loop de repetição"], ["Sobrecarga", "ok", "80 req/s"]] },
      { nome: "Miquéias JpG 1.0", tipo: "ia", alvo: "protótipo do Bezalel", status: "reprovado", motivo: "Errou 3 de 40 cálculos com dados incompletos. Volta para o Bezalel.",
        testes: [["Situações difíceis", "fail", "dados incompletos"], ["Erros", "ok", "API sem resposta"], ["Sobrecarga", "ok", "50 tarefas juntas"]] },
    ],
    perf: [
      { nome: "Acompanhar ação", tipo: "Habilidade", p95: 640, efic: 91, cham: 3, mem: 48, status: "aprovada" },
      { nome: "Resumo da manhã", tipo: "Habilidade", p95: 980, efic: 84, cham: 4, mem: 62, status: "aprovada" },
      { nome: "Calcular posição", tipo: "Habilidade", p95: 210, efic: 96, cham: 2, mem: 21, status: "aprovada" },
      { nome: "Avisar compromisso", tipo: "Habilidade", p95: 330, efic: 93, cham: 2, mem: 18, status: "aprovada" },
      { nome: "Tradução simultânea", tipo: "Habilidade", p95: 2840, efic: 71, cham: 3, mem: 140, status: "reprovada", motivo: "lentidão" },
      { nome: "Varredura de notícias", tipo: "Habilidade", p95: 1110, efic: 38, cham: 14, mem: 96, status: "reprovada", motivo: "desperdício" },
      { nome: "Miquéias JpG 1.0", tipo: "IA nova", p95: 1180, efic: 66, cham: 7, mem: 310, status: "reprovada", motivo: "eficiência" },
    ],
    alertas: [
      { tipo: "fail", msg: "<b>Tradução simultânea</b> reprovada por lentidão (2.840 ms)", min: 4 },
      { tipo: "fail", msg: "<b>Miquéias JpG 1.0</b> reprovado na prova de situações difíceis", min: 18 },
      { tipo: "warn", msg: "API <b>Leitura de documentos</b> do Gather instável na prova de erros", min: 26 },
      { tipo: "warn", msg: "<b>Varredura de notícias</b> gasta 14 chamadas por uso", min: 51 },
    ],
  };
  const LIM = { p95: 1200, efic: 70, cham: 8 };
  const ETAPAS = ["Derretendo", "Fundindo", "Prova de fogo", "Resfriando"];

  /* ---------------- tela de carregamento ---------------- */
  (async () => {
    const splash = $("#splash"), status = $("#splash-status"), bar = $("#splash-bar");
    const embers = $("#splash-embers");
    for (let i = 0; i < 26; i++) {
      const e = document.createElement("i");
      e.style.left = `${10 + Math.random() * 80}%`;
      e.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
      e.style.animationDuration = `${3 + Math.random() * 4}s`;
      e.style.animationDelay = `${Math.random() * 4}s`;
      embers.appendChild(e);
    }
    const steps = [
      ["acendendo a fornalha", 16],
      ["aquecendo o cadinho", 33],
      ["recebendo APIs do Gather", 52],
      ["preparando a prova de fogo", 70],
      ["calibrando medidores de desempenho", 86],
      ["conectando ao Bezalel", 100],
    ];
    for (const [txt, pct] of steps) {
      status.style.opacity = 0; await wait(120);
      status.textContent = txt; status.style.opacity = 1;
      bar.style.width = pct + "%";
      await wait(420 + Math.random() * 260);
    }
    splash.classList.add("ready");
    status.textContent = "fornalha acesa";
    await wait(1000);
    splash.classList.add("done");
    setTimeout(() => splash.remove(), 800);
  })();

  /* ---------------- relógio & topo ---------------- */
  const tick = () => ($("#clock").textContent = now());
  tick(); setInterval(tick, 1000);

  function taxaAprovacao() {
    const fim = state.provas.filter((p) => p.status !== "em prova");
    return fim.length ? Math.round((fim.filter((p) => p.status === "aprovado").length / fim.length) * 100) : 0;
  }
  function updateStats() {
    $("#st-fornadas").textContent = state.fornadas.length;
    $("#st-hab").textContent = state.habilidades.filter((h) => h.status === "aprovada").length;
    $("#st-aprov").textContent = taxaAprovacao() + "%";
    const em = state.provas.filter((p) => p.status === "em prova").length;
    $("#prova-badge").textContent = em;
    $("#prova-badge").classList.toggle("hidden", !em);
  }

  /* ---------------- abas ---------------- */
  function showView(v) {
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    $$(".view").forEach((s) => s.classList.toggle("active", s.id === `view-${v}`));
    if (v === "fundicao") requestAnimationFrame(desenharFios);
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showView(t.dataset.view)));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) showView(b.dataset.go);
  });

  /* ---------------- toasts ---------------- */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="dot"></span>${msg}`;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 3800);
  }

  /* ---------------- janela ---------------- */
  function abrirModal(html) {
    $("#modal-box").innerHTML = html;
    $("#modal").classList.add("open");
    $("#modal").setAttribute("aria-hidden", "false");
    $$("[data-fechar]", $("#modal-box")).forEach((b) => b.addEventListener("click", fecharModal));
  }
  function fecharModal() { $("#modal").classList.remove("open"); $("#modal").setAttribute("aria-hidden", "true"); }
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

  $("#conn-pill").addEventListener("click", () => abrirModal(`
    <div class="modal-head"><div class="avatar logo lg"><img src="assets/fornalha-symbol-orange.png" alt=""/></div>
      <div><b>Modo demonstração</b><span>Esta é só a aparência da Fornalha. Os dados são simulados; a API real ainda será construída.</span></div></div>
    <div class="hint">Quando a Fornalha tiver back-end, aqui ficará a conexão com a API (mesmo padrão do Asafe: endereço + token).</div>
    <div class="modal-acoes"><button class="btn primary" data-fechar>Entendi</button></div>`));

  $("#btn-export").addEventListener("click", () => {
    const dados = { gerado_em: new Date().toISOString(), habilidades: state.habilidades, provas: state.provas, desempenho: state.perf };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
    a.download = "fornalha-relatorio.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Relatório da Fornalha exportado");
  });

  /* =========================================================
     PAINEL GERAL
     ========================================================= */
  function spark(pts) {
    const max = Math.max(...pts), min = Math.min(...pts), w = 100, h = 28;
    const xy = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${xy}" fill="none" stroke="var(--or-2)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
  }
  function kpi(label, val, small, pts) {
    return `<div class="kpi glass"><div class="k-label">${label}</div><div class="k-val">${val}${small ? `<small>${small}</small>` : ""}</div>${pts ? spark(pts) : ""}</div>`;
  }

  function renderPainel() {
    const aprov = state.habilidades.filter((h) => h.status === "aprovada").length;
    $("#painel-kpis").innerHTML =
      kpi("Fornadas em andamento", state.fornadas.length, "no fogo", [2, 3, 2, 4, 3, 3, state.fornadas.length]) +
      kpi("Habilidades fundidas", aprov, "+2 hoje", [1, 1, 2, 2, 3, 4, aprov]) +
      kpi("Taxa de aprovação", taxaAprovacao() + "%", "nas provas", [50, 55, 62, 58, 60, 66, taxaAprovacao()]) +
      kpi("Alertas", state.alertas.length, "abertos", [1, 2, 1, 3, 2, 4, state.alertas.length]);

    $("#fornadas").innerHTML = state.fornadas.length ? state.fornadas.map((f) => {
      const temp = 600 + f.etapa * 250 + Math.round(f.pct * 2.5);
      return `<div class="fornada">
        <div class="f-top">
          <div class="avatar logo sm"><img src="assets/fornalha-symbol-orange.png" alt=""/></div>
          <div class="t"><b>Fornada #${f.id} · ${esc(f.nome)}</b><span>para ${esc(f.ia)} · ${ETAPAS[f.etapa].toLowerCase()}</span></div>
          <div class="f-temp">${temp} °C<small>${f.pct}%</small></div>
        </div>
        <div class="bar heat"><i style="width:${f.pct}%"></i></div>
        <div class="etapas">${ETAPAS.map((e, i) => `<span class="${i < f.etapa ? "feito" : i === f.etapa ? "agora" : ""}">${e}</span>`).join("")}</div>
      </div>`;
    }).join("") : `<div class="empty">Nenhuma fornada no fogo agora.</div>`;

    $("#alertas-n").textContent = state.alertas.length;
    $("#alertas").innerHTML = state.alertas.map((a) =>
      `<div class="alerta ${a.tipo}">${icon(a.tipo === "fail" ? "xc" : "alert", "sm")}<div class="a-msg">${a.msg}</div><time>${hhmm(a.min)}</time></div>`).join("");

    $("#ultimas").innerHTML = `<tr><th>Habilidade</th><th>Receita (APIs do Gather)</th><th>Para</th><th>Status</th><th>Quando</th></tr>` +
      state.habilidades.slice(0, 5).map((h) => `<tr><td><b>${esc(h.nome)}</b></td><td>${receita(h)}</td><td>${esc(h.ia)}</td><td>${statusTag(h.status)}</td><td class="mono">${hhmm(h.quando)}</td></tr>`).join("");
  }

  function receita(h) {
    return `<div class="receita">${h.receita.map((r, i) => `${i ? `<span class="op">+</span>` : ""}<span class="chip cyan">${esc(apiNome(r))}</span>`).join("")}<span class="op eq">→</span><span class="chip or">${esc(h.nome)}</span></div>`;
  }
  function statusTag(s) {
    if (s === "aprovada" || s === "aprovado") return `<span class="tag ok">${icon("check", "xs")}aprovad${s.endsWith("a") ? "a" : "o"}</span>`;
    if (s === "reprovada" || s === "reprovado") return `<span class="tag fail">${icon("x", "xs")}reprovad${s.endsWith("a") ? "a" : "o"}</span>`;
    return `<span class="tag live"><span class="dot pulse"></span>em prova</span>`;
  }

  /* =========================================================
     FUNDIÇÃO
     ========================================================= */
  function renderApis() {
    $("#api-list").innerHTML = APIS.map((a) => `
      <button class="api-item ${state.selecionadas.has(a.id) ? "on" : ""}" data-api="${a.id}">
        <span class="box"></span><span class="t"><b>${a.nome}</b><span>${a.rota}</span></span><span class="tag cyan">gather</span>
      </button>`).join("");
    $("#sel-n").textContent = `${state.selecionadas.size} no cadinho`;
    renderCadinho();
  }
  $("#api-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-api]");
    if (!b || state.fundindo) return;
    const id = b.dataset.api;
    state.selecionadas.has(id) ? state.selecionadas.delete(id) : state.selecionadas.add(id);
    renderApis();
  });

  function renderCadinho(produto) {
    const sel = [...state.selecionadas];
    $("#entradas").innerHTML = sel.length
      ? `<span class="label-xs mono">entradas</span>` + sel.map((id) => `<span class="chip cyan" data-in>${esc(apiNome(id))}</span>`).join("")
      : `<div class="empty">Escolha APIs do Gather<br/>para pôr no cadinho</div>`;
    const nome = $("#h-nome").value.trim();
    $("#saida").innerHTML = `<span class="label-xs mono">saída</span>` + (produto
      ? `<div class="produto" data-out><span class="tag solid">${icon("flame", "xs")}fundida</span><b>${esc(produto.nome)}</b><span>${produto.receita.length} APIs · para ${esc(produto.ia)} · enviada à prova de fogo</span></div>`
      : `<div class="produto vazio" data-out><b>${nome ? esc(nome) : "Habilidade"}</b><span>${sel.length >= 2 ? "pronta para fundir" : "precisa de pelo menos 2 APIs"}</span></div>`);
    if (!state.fundindo) {
      const t = sel.length * 120;
      $("#cadinho-temp").textContent = sel.length ? `aquecendo · ${t} °C` : "frio · 0 °C";
      $("#forno-label").textContent = sel.length ? "metal no cadinho" : "aguardando metal";
    }
    requestAnimationFrame(desenharFios);
  }
  $("#h-nome").addEventListener("input", () => renderCadinho());

  function desenharFios() {
    const svg = $("#fios"), box = $("#cadinho");
    if (!box.offsetParent) return;
    const r0 = box.getBoundingClientRect(), forno = $("#forno").getBoundingClientRect();
    const fx = forno.left + forno.width / 2 - r0.left, fy = forno.top + forno.height / 2 - r0.top;
    let d = "";
    $$("[data-in]", box).forEach((c) => {
      const r = c.getBoundingClientRect(), x = r.right - r0.left, y = r.top + r.height / 2 - r0.top;
      d += `<path d="M${x},${y} C${x + 40},${y} ${fx - 70},${fy} ${fx - 58},${fy}"/>`;
    });
    const o = $("[data-out]", box);
    if (o && !o.classList.contains("vazio")) {
      const r = o.getBoundingClientRect(), x = r.left - r0.left, y = r.top + r.height / 2 - r0.top;
      d += `<path class="out" d="M${fx + 58},${fy} C${fx + 80},${fy} ${x - 30},${y} ${x},${y}"/>`;
    }
    svg.innerHTML = d;
  }
  window.addEventListener("resize", desenharFios);

  $("#exemplo").addEventListener("click", (e) => {
    e.preventDefault();
    if (state.fundindo) return;
    state.selecionadas = new Set(["cotacao", "grafico", "alerta"]);
    $("#h-nome").value = state.habilidades.some((h) => h.nome === "Acompanhar ação") ? "Acompanhar ação v2" : "Acompanhar ação";
    $("#h-ia").value = "Miquéias";
    renderApis();
  });

  $("#btn-fundir").addEventListener("click", async () => {
    if (state.fundindo) return;
    const nome = $("#h-nome").value.trim(), ia = $("#h-ia").value, sel = [...state.selecionadas];
    if (sel.length < 2) { toast("Coloque pelo menos 2 APIs do Gather no cadinho"); return; }
    if (!nome) { $("#h-nome").focus(); toast("Dê um nome para a habilidade"); return; }
    if (state.habilidades.some((h) => h.nome.toLowerCase() === nome.toLowerCase())) { toast(`Já existe uma habilidade chamada <b>${esc(nome)}</b>; use outro nome (ex.: ${esc(nome)} v2)`); return; }
    state.fundindo = true;
    const btn = $("#btn-fundir"); btn.disabled = true; btn.classList.add("carregando");
    $("#forno").classList.add("ativo");
    const fases = [["derretendo", 900], ["fundindo", 1150], ["moldando", 1240]];
    for (const [f, t] of fases) {
      $("#forno-label").textContent = f;
      $("#cadinho-temp").textContent = `${f} · ${t} °C`;
      await wait(850);
    }
    const h = { nome, ia, receita: sel, status: "em prova", quando: 0 };
    state.habilidades.unshift(h);
    state.provas.unshift({ nome, tipo: "habilidade", alvo: ia, status: "em prova",
      testes: [["Situações difíceis", "run", "casos extremos"], ["Erros", "wait", "API do Gather fora do ar"], ["Sobrecarga", "wait", "300 req/s"]] });
    state.fornadas.unshift({ id: 34 + state.habilidades.length, nome, ia, etapa: 2, pct: 60 });
    $("#forno").classList.remove("ativo");
    $("#forno-label").textContent = "fundida";
    $("#cadinho-temp").textContent = "resfriando · 400 °C";
    renderCadinho(h);
    btn.disabled = false; btn.classList.remove("carregando");
    state.fundindo = false;
    toast(`<b>${esc(nome)}</b> fundida · enviada à prova de fogo`);
    renderTudo();
    setTimeout(() => { state.selecionadas.clear(); $("#h-nome").value = ""; renderApis(); }, 3500);
  });

  function renderHabilidades() {
    $("#hab-count").textContent = `${state.habilidades.length} no total`;
    $("#habilidades").innerHTML = `<tr><th>Habilidade</th><th>Receita</th><th>Para</th><th>APIs</th><th>Status</th></tr>` +
      state.habilidades.map((h) => `<tr><td><b>${esc(h.nome)}</b></td><td>${receita(h)}</td><td>${esc(h.ia)}</td><td class="mono">${h.receita.length}</td><td>${statusTag(h.status)}</td></tr>`).join("");
  }

  /* =========================================================
     PROVA DE FOGO
     ========================================================= */
  let filtroProva = "todos";
  $("#prova-filtro").addEventListener("click", (e) => {
    const b = e.target.closest(".seg"); if (!b) return;
    $$(".seg", $("#prova-filtro")).forEach((s) => s.classList.toggle("active", s === b));
    filtroProva = b.dataset.f; renderProvas();
  });
  const testeIc = { ok: "oc", fail: "xc", run: "load", wait: "clock" };

  function cardProva(p, i) {
    const tipo = p.tipo === "ia" ? `<span class="tag green">IA nova</span>` : `<span class="tag">habilidade</span>`;
    return `<div class="prova" data-prova="${i}">
      <div class="prova-top"><b>${esc(p.nome)}</b>${tipo}</div>
      <div class="testes">${p.testes.map(([n, s, d]) => `<div class="teste ${s}">${icon(testeIc[s])}<span>${n}</span><em>${esc(d)}</em></div>`).join("")}</div>
      ${p.motivo ? `<div class="motivo ${p.status === "aprovado" ? "ok" : ""}">${esc(p.motivo)}</div>` : ""}
      <div class="prova-foot"><span>${p.tipo === "ia" ? "vinda do Bezalel" : "para " + esc(p.alvo)}</span>${statusTag(p.status)}</div>
    </div>`;
  }

  function renderProvas() {
    const lista = state.provas.map((p, i) => [p, i]).filter(([p]) => filtroProva === "todos" || p.tipo === filtroProva);
    const col = (s) => lista.filter(([p]) => p.status === s);
    const fill = (el, n, arr) => { $(el).innerHTML = arr.length ? arr.map(([p, i]) => cardProva(p, i)).join("") : `<div class="empty">Nada aqui</div>`; $(n).textContent = arr.length; };
    fill("#k-em", "#n-em", col("em prova"));
    fill("#k-ok", "#n-ok", col("aprovado"));
    fill("#k-fail", "#n-fail", col("reprovado"));
    const fim = state.provas.filter((p) => p.status !== "em prova");
    $("#prova-kpis").innerHTML =
      kpi("Em prova", col("em prova").length, "agora") +
      kpi("Aprovados", state.provas.filter((p) => p.status === "aprovado").length, "liberados") +
      kpi("Reprovados", state.provas.filter((p) => p.status === "reprovado").length, "com motivo") +
      kpi("Taxa de aprovação", taxaAprovacao() + "%", `${fim.length} provas`);
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-prova]"); if (!c) return;
    const p = state.provas[+c.dataset.prova];
    abrirModal(`
      <div class="modal-head"><div class="avatar logo lg"><img src="assets/fornalha-symbol-orange.png" alt=""/></div>
        <div><b>${esc(p.nome)}</b><span>${p.tipo === "ia" ? "IA nova vinda do Bezalel" : "Habilidade para " + esc(p.alvo)} · prova de fogo</span></div>${statusTag(p.status)}</div>
      <div class="testes">${p.testes.map(([n, s, d]) => `<div class="teste ${s}">${icon(testeIc[s])}<span>${n}</span><em>${esc(d)}</em></div>`).join("")}</div>
      ${p.motivo ? `<div class="motivo ${p.status === "aprovado" ? "ok" : ""}">${esc(p.motivo)}</div>` : `<div class="hint">A prova ainda está rodando. O resultado aparece aqui quando terminar.</div>`}
      <div class="modal-acoes">
        ${p.status === "reprovado" ? `<button class="btn ghost" data-fechar id="refazer">Mandar de volta ao fogo</button>` : ""}
        <button class="btn primary" data-fechar>Fechar</button>
      </div>`);
    const r = $("#refazer");
    if (r) r.addEventListener("click", () => {
      p.status = "em prova"; p.motivo = "";
      p.testes = p.testes.map(([n, , d], i) => [n, i === 0 ? "run" : "wait", d]);
      toast(`<b>${esc(p.nome)}</b> voltou para a prova de fogo`);
      renderTudo();
    });
  });

  /* simulação: provas andando sozinhas */
  setInterval(() => {
    const p = state.provas.find((x) => x.status === "em prova");
    if (!p) return;
    const k = p.testes.findIndex(([, s]) => s === "run" || s === "wait");
    if (k < 0) return;
    if (p.testes[k][1] === "wait") { p.testes[k][1] = "run"; renderTudo(); return; }
    const passou = Math.random() > 0.22;
    p.testes[k][1] = passou ? "ok" : "fail";
    if (k + 1 < p.testes.length && passou) p.testes[k + 1][1] = "run";
    const terminou = !passou || k + 1 === p.testes.length;
    if (terminou) {
      p.status = passou ? "aprovado" : "reprovado";
      p.motivo = passou ? "Passou nas 3 provas sem falhas." : `Falhou em ${p.testes[k][0].toLowerCase()} (${p.testes[k][2]}).`;
      const h = state.habilidades.find((x) => x.nome === p.nome);
      if (h) h.status = passou ? "aprovada" : "reprovada";
      const fi = state.fornadas.findIndex((f) => f.nome === p.nome);
      if (fi >= 0) state.fornadas.splice(fi, 1);
      if (!passou) state.alertas.unshift({ tipo: "fail", msg: `<b>${esc(p.nome)}</b> reprovado na prova de fogo`, min: 0 });
      if (h && passou && !state.perf.some((x) => x.nome === h.nome)) {
        state.perf.unshift({ nome: h.nome, tipo: "Habilidade", p95: 300 + Math.round(Math.random() * 700), efic: 75 + Math.round(Math.random() * 20), cham: h.receita.length, mem: 20 + Math.round(Math.random() * 60), status: "aprovada" });
      }
      toast(`Prova de fogo: <b>${esc(p.nome)}</b> ${passou ? "aprovado" : "reprovado"}`);
    }
    renderTudo();
  }, 4200);

  /* simulação: fornadas esquentando */
  setInterval(() => {
    state.fornadas.forEach((f) => {
      if (f.etapa >= 2) return; // na prova de fogo, quem avança é a prova
      f.pct = Math.min(f.pct + 2 + Math.round(Math.random() * 3), 99);
      if (f.pct >= 25 * (f.etapa + 1) + 20 && f.etapa < 1) f.etapa++;
    });
    renderPainel(); updateStats();
  }, 2500);

  /* =========================================================
     DESEMPENHO
     ========================================================= */
  let filtroPerf = "todos";
  $("#perf-filtro").addEventListener("click", (e) => {
    const b = e.target.closest(".seg"); if (!b) return;
    $$(".seg", $("#perf-filtro")).forEach((s) => s.classList.toggle("active", s === b));
    filtroPerf = b.dataset.f; renderPerf();
  });

  function meter(val, max, lim, txt, ruim, inverter = false) {
    const pct = Math.min(100, (val / max) * 100), lp = (lim / max) * 100;
    return `<div class="meter"><span class="${ruim ? "fail-t" : ""}">${txt}</span><div class="bar ${ruim ? "fail" : "heat"}"><i style="width:${pct}%"></i><span class="lim" style="left:${lp}%" title="limite"></span></div></div>`;
  }

  function renderPerf() {
    const ok = state.perf.filter((p) => p.status === "aprovada");
    const media = (arr, k) => Math.round(arr.reduce((s, p) => s + p[k], 0) / (arr.length || 1));
    $("#perf-kpis").innerHTML =
      kpi("Velocidade (p95 média)", media(ok, "p95") + " ms", "aprovados", [820, 760, 700, 690, 640, 610, media(ok, "p95")]) +
      kpi("Eficiência média", media(ok, "efic") + "%", "aprovados", [80, 82, 85, 84, 88, 90, media(ok, "efic")]) +
      kpi("Consumo médio", media(ok, "cham"), "chamadas/uso", [5, 5, 4, 4, 3, 3, media(ok, "cham")]) +
      kpi("Reprovados", state.perf.filter((p) => p.status === "reprovada").length, "lento ou desperdício");

    const rep = state.perf.filter((p) => p.status === "reprovada");
    const lenta = rep.find((p) => p.motivo === "lentidão"), desp = rep.find((p) => p.motivo === "desperdício");
    $("#destaques").innerHTML =
      (lenta ? `<div class="destaque">${icon("clock")}<div><b>Reprovado por lentidão: ${esc(lenta.nome)}</b><p>Demora demais para responder sob sobrecarga. Volta para a fundição com outra API de transcrição.</p><span class="mono">p95 ${lenta.p95.toLocaleString("pt-BR")} ms · limite ${LIM.p95.toLocaleString("pt-BR")} ms</span></div></div>` : "") +
      (desp ? `<div class="destaque">${icon("bolt")}<div><b>Reprovado por desperdício: ${esc(desp.nome)}</b><p>Chama as mesmas APIs várias vezes por uso. Precisa guardar o resultado em vez de repetir.</p><span class="mono">${desp.cham} chamadas/uso · eficiência ${desp.efic}% · limite ${LIM.cham}</span></div></div>` : "");

    const lista = state.perf.filter((p) => filtroPerf === "todos" || p.status === filtroPerf);
    $("#perf").innerHTML = `<tr><th>Item</th><th>Velocidade (p95)</th><th>Eficiência</th><th>Consumo</th><th>Memória</th><th>Resultado</th></tr>` +
      lista.map((p) => `<tr class="perf-row ${p.status}">
        <td><b>${esc(p.nome)}</b><div class="u-sub">${p.tipo}</div></td>
        <td>${meter(p.p95, 3000, LIM.p95, p.p95.toLocaleString("pt-BR") + " ms", p.p95 > LIM.p95)}</td>
        <td>${meter(p.efic, 100, LIM.efic, p.efic + "%", p.efic < LIM.efic)}</td>
        <td>${meter(p.cham, 16, LIM.cham, p.cham + " chamadas/uso", p.cham > LIM.cham)}</td>
        <td class="mono">${p.mem} MB</td>
        <td>${statusTag(p.status)}${p.motivo ? `<div class="u-sub" style="margin-top:5px">por ${p.motivo}</div>` : ""}</td>
      </tr>`).join("");
  }

  /* =========================================================
     SUBMOTORES
     ========================================================= */
  const SUBS = [
    { nome: "Fole", cod: "FRN-C", pilar: "Continuidade", ic: "wind",
      desc: "Como o fole que mantém o fogo aceso: a fundição e as provas nunca param.",
      itens: ["Retoma a fornada de onde parou após uma falha", "Guarda o ponto de cada prova em andamento", "Mantém a fila andando mesmo com uma API fora do ar"] },
    { nome: "Fichário", cod: "FRN-M", pilar: "Memória", ic: "book",
      desc: "A Fornalha lembra de cada fornada e aprende com ela.",
      itens: ["Guarda o resultado de cada prova de fogo", "Registra a receita de cada habilidade fundida", "Aprende o que costuma falhar"] },
    { nome: "Faísca", cod: "FRN-A", pilar: "Autonomia", ic: "spark",
      desc: "A Fornalha decide sozinha, sem esperar o Sr. Nathanael.",
      itens: ["Escolhe quais provas aplicar em cada item", "Reprova sozinha o que não passar", "Sugere novas fusões de APIs"] },
  ];
  $("#subs").innerHTML = SUBS.map((s) => `
    <div class="card glass sub">
      <div class="sub-head"><div class="sub-ic">${icon(s.ic)}</div><div class="t"><b>${s.nome}</b><span>${s.pilar}</span></div><span class="tag dim">em breve</span></div>
      <p>${s.desc}</p>
      <ul>${s.itens.map((i) => `<li>${i}</li>`).join("")}</ul>
      <div class="lock"><span>${s.cod} · nome temporário</span><span>${icon("lock", "xs")} não produzido</span></div>
    </div>`).join("");

  /* ---------------- tudo ---------------- */
  function renderTudo() {
    renderPainel(); renderHabilidades(); renderProvas(); renderPerf(); updateStats();
  }
  renderApis();
  renderTudo();
})();
