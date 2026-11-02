/* =========================================================
   FORNALHA · Motor de transformação — aparência zerada (aguardando conexão com o Asafe)
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

  /* ---------------- estado (zerado até conectar ao Asafe) ---------------- */
  const APIS = []; // chegam do Gather, pelo Asafe, quando conectado
  const apiNome = (id) => APIS.find((a) => a.id === id)?.nome ?? id;

  const state = {
    selecionadas: new Set(),
    fundindo: false,
    habilidades: [],
    fornadas: [],
    provas: [],
    perf: [],
    alertas: [],
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
  const taxaTxt = () => (state.provas.some((p) => p.status !== "em prova") ? taxaAprovacao() + "%" : "—");
  function updateStats() {
    $("#st-fornadas").textContent = state.fornadas.length;
    $("#st-hab").textContent = state.habilidades.filter((h) => h.status === "aprovada").length;
    $("#st-aprov").textContent = taxaTxt();
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
      <div><b>Sem conexão</b><span>A Fornalha está zerada. Os dados vão chegar quando ela for conectada ao Asafe, junto com os outros motores.</span></div></div>
    <div class="hint">Aqui ficará a conexão com o Asafe (mesmo padrão do painel do Asafe: endereço da API + token). As APIs vêm do Gather pelo Asafe.</div>
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
      kpi("Fornadas em andamento", state.fornadas.length, "no fogo") +
      kpi("Habilidades fundidas", aprov, "prontas") +
      kpi("Taxa de aprovação", taxaTxt(), "nas provas") +
      kpi("Alertas", state.alertas.length, "abertos");

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
    }).join("") : `<div class="empty">Nenhuma fornada no fogo · ${VAZIO}</div>`;

    $("#alertas-n").textContent = state.alertas.length;
    $("#alertas").innerHTML = state.alertas.length ? "" : `<div class="empty">Nenhum alerta</div>`;
    $("#alertas").innerHTML += state.alertas.map((a) =>
      `<div class="alerta ${a.tipo}">${icon(a.tipo === "fail" ? "xc" : "alert", "sm")}<div class="a-msg">${a.msg}</div><time>${hhmm(a.min)}</time></div>`).join("");

    $("#ultimas").innerHTML = `<tr><th>Habilidade</th><th>Receita (APIs do Gather)</th><th>Para</th><th>Status</th><th>Quando</th></tr>` +
      (state.habilidades.length ? state.habilidades.slice(0, 5).map((h) => `<tr><td><b>${esc(h.nome)}</b></td><td>${receita(h)}</td><td>${esc(h.ia)}</td><td>${statusTag(h.status)}</td><td class="mono">${hhmm(h.quando)}</td></tr>`).join("") : linhaVazia(5, "Nenhuma habilidade fundida ainda"));
  }

  const VAZIO = "aguardando conexão com o Asafe";
  const linhaVazia = (cols, txt) => `<tr><td colspan="${cols}"><div class="empty">${txt}</div></td></tr>`;
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
    $("#api-list").innerHTML = APIS.length ? "" : `<div class="empty">Nenhuma API recebida do Gather<br/>${VAZIO}</div>`;
    $("#api-list").innerHTML += APIS.map((a) => `
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
      (state.habilidades.length ? state.habilidades.map((h) => `<tr><td><b>${esc(h.nome)}</b></td><td>${receita(h)}</td><td>${esc(h.ia)}</td><td class="mono">${h.receita.length}</td><td>${statusTag(h.status)}</td></tr>`).join("") : linhaVazia(5, "Nenhuma habilidade fundida ainda"));
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
    const fill = (el, n, arr) => { $(el).innerHTML = arr.length ? arr.map(([p, i]) => cardProva(p, i)).join("") : `<div class="empty">Vazio</div>`; $(n).textContent = arr.length; };
    fill("#k-em", "#n-em", col("em prova"));
    fill("#k-ok", "#n-ok", col("aprovado"));
    fill("#k-fail", "#n-fail", col("reprovado"));
    const fim = state.provas.filter((p) => p.status !== "em prova");
    $("#prova-kpis").innerHTML =
      kpi("Em prova", col("em prova").length, "agora") +
      kpi("Aprovados", state.provas.filter((p) => p.status === "aprovado").length, "liberados") +
      kpi("Reprovados", state.provas.filter((p) => p.status === "reprovado").length, "com motivo") +
      kpi("Taxa de aprovação", taxaTxt(), `${fim.length} provas`);
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
    const media = (arr, k) => (arr.length ? Math.round(arr.reduce((s, p) => s + p[k], 0) / arr.length) : null);
    const ou = (v, suf = "") => (v === null ? "—" : v + suf);
    $("#perf-kpis").innerHTML =
      kpi("Velocidade (p95 média)", ou(media(ok, "p95"), " ms"), "aprovados") +
      kpi("Eficiência média", ou(media(ok, "efic"), "%"), "aprovados") +
      kpi("Consumo médio", ou(media(ok, "cham")), "chamadas/uso") +
      kpi("Reprovados", state.perf.filter((p) => p.status === "reprovada").length, "lento ou desperdício");

    const rep = state.perf.filter((p) => p.status === "reprovada");
    const lenta = rep.find((p) => p.motivo === "lentidão"), desp = rep.find((p) => p.motivo === "desperdício");
    $("#destaques").innerHTML =
      (lenta ? `<div class="destaque">${icon("clock")}<div><b>Reprovado por lentidão: ${esc(lenta.nome)}</b><p>Demora demais para responder sob sobrecarga. Volta para a fundição com outra API de transcrição.</p><span class="mono">p95 ${lenta.p95.toLocaleString("pt-BR")} ms · limite ${LIM.p95.toLocaleString("pt-BR")} ms</span></div></div>` : "") +
      (desp ? `<div class="destaque">${icon("bolt")}<div><b>Reprovado por desperdício: ${esc(desp.nome)}</b><p>Chama as mesmas APIs várias vezes por uso. Precisa guardar o resultado em vez de repetir.</p><span class="mono">${desp.cham} chamadas/uso · eficiência ${desp.efic}% · limite ${LIM.cham}</span></div></div>` : "");

    const lista = state.perf.filter((p) => filtroPerf === "todos" || p.status === filtroPerf);
    $("#perf").innerHTML = `<tr><th>Item</th><th>Velocidade (p95)</th><th>Eficiência</th><th>Consumo</th><th>Memória</th><th>Resultado</th></tr>` +
      (lista.length ? "" : linhaVazia(6, `Nada medido ainda · ${VAZIO}`)) +
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
