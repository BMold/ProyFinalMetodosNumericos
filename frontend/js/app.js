/** Prototipo: muestra los cuatro módulos y los resultados exportados por el backend. */
(function () {
  "use strict";

  const TIPOS = { NORMAL: "Normal", ESTRES: "Estrés", MAL_CONDICIONADO: "Mal condicionado" };
  const $ = (id) => document.getElementById(id);
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let datos = null;
  let grafico = null;
  let tipoActivo = "NORMAL";

  function num(v) {
    if (v === null || v === undefined) return "—";
    if (v === 0) return "0";
    const a = Math.abs(v);
    return a < 1e-3 || a >= 1e5 ? v.toExponential(3) : String(Number(v.toPrecision(5)));
  }

  function pintarTarjetas() {
    $("tarjetas").innerHTML = datos.modulos.map((m) => `
      <button type="button" class="tarjeta tarjeta-caso" data-id="${m.id}" aria-pressed="${m.id === 2}">
        <span class="numero">Módulo ${m.id}</span>
        <span class="titulo">${esc(m.nombre)}</span>
        <span class="pregunta">${esc(m.pregunta)}</span>
        <span class="etiqueta ${m.id === 2 ? "activo" : ""}">${esc(m.estado)}</span>
      </button>`).join("");
    $("tarjetas").addEventListener("click", (e) => {
      const b = e.target.closest("[data-id]");
      if (b) pintarDetalle(Number(b.dataset.id));
    });
  }

  function pintarDetalle(id) {
    const m = datos.modulos.find((x) => x.id === id);
    document.querySelectorAll(".tarjeta-caso").forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.id) === id));
    $("detalle").innerHTML = `
      <h2>${esc(m.nombre)}: planteamiento</h2>
      <div class="columnas">
        <div>
          <h3>Modelo</h3>
          <ul class="formulas">${m.modelo.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <h3>Variables y unidades</h3>
          <ul>${m.variables.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>
        </div>
        <div>
          <h3>Hipótesis</h3><p>${esc(m.hipotesis)}</p>
          <h3>Referencia</h3><p>${esc(m.referencia)}</p>
          <h3>Métodos asignados</h3><p>${m.metodos.map(esc).join(", ")}</p>
        </div>
        <div>
          <h3>Escenarios definidos</h3>
          <dl class="escenarios">${Object.entries(m.escenarios).map(([k, v]) => `<dt>${TIPOS[k]}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        </div>
      </div>`;
  }

  function pintarSistema() {
    const e = datos.sistemas.find((s) => s.tipo === tipoActivo);
    document.querySelectorAll("#selector button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tipo === tipoActivo));
    const indicadores = [
      ["Sistema", e.descripcion],
      ["κ₂(A)", num(e.kappa)],
      ["ρ(T Jacobi)", num(e.rho_jacobi)],
      ["ρ(T Gauss-Seidel)", num(e.rho_gauss_seidel)],
      ["Matriz SPD", e.es_spd ? "Sí" : "No"],
      ["Error de la referencia directa", num(e.error_referencia_directa)],
      ["Amplificación de δb en x", num(e.amplificacion_perturbacion)],
    ];
    $("indicadores").innerHTML = indicadores.map(([d, v]) => `<div><dt>${esc(d)}</dt><dd>${esc(v)}</dd></div>`).join("");
    document.querySelector("#tabla tbody").innerHTML = e.metodos.map((m) => `<tr>
      <td>${esc(m.metodo)}</td><td class="num">${m.iteraciones}</td>
      <td><span class="etiqueta ${m.convergio ? "si" : "no"}">${m.convergio ? "✓ Convergió" : "✕ No convergió"}</span></td>
      <td class="num">${num(m.error_abs)}</td><td class="num">${num(m.error_rel)}</td><td class="num">${num(m.residual)}</td>
      <td class="num">${m.tiempo_ms.toFixed(2)}</td><td>${esc(m.criterio)}</td></tr>`).join("");
    $("nota").textContent = tipoActivo === "MAL_CONDICIONADO"
      ? "Mal condicionamiento y falta de convergencia son cosas distintas: LU deja un residuo mínimo con un error mucho mayor por κ alto, mientras Jacobi diverge porque ρ(T) > 1."
      : "Los errores son pequeños y coherentes con κ. Gauss-Seidel requiere menos iteraciones que Jacobi por su menor radio espectral.";

    const colores = ["--serie-1", "--serie-2", "--serie-3", "--serie-4"].map(css);
    if (grafico) grafico.destroy();
    grafico = new Chart($("grafico"), {
      type: "scatter",
      data: {
        datasets: e.metodos.map((m, i) => ({
          label: m.metodo,
          data: m.historial_residual.filter(([, y]) => y !== null && y > 0).map(([x, y]) => ({ x, y })),
          showLine: true,
          borderColor: colores[i],
          backgroundColor: colores[i],
          borderWidth: 2,
          pointRadius: m.historial_residual.length <= 40 ? 3 : 0,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        plugins: {
          legend: { align: "end", labels: { color: css("--texto-2"), usePointStyle: true, boxWidth: 8, boxHeight: 8 } },
          tooltip: { callbacks: { title: (c) => `Iteración ${c[0].parsed.x}`, label: (c) => `${c.dataset.label}: ${num(c.parsed.y)}` } },
        },
        scales: {
          x: { type: "linear", title: { display: true, text: "iteración", color: css("--texto-2") }, grid: { color: css("--rejilla") }, ticks: { color: css("--texto-2") } },
          y: {
            type: "logarithmic",
            title: { display: true, text: "‖b − A x‖ / ‖b‖", color: css("--texto-2") },
            grid: { color: css("--rejilla") },
            ticks: { color: css("--texto-2"), maxTicksLimit: 8, callback: (v) => (Number.isInteger(Math.log10(v)) ? `1e${Math.log10(v)}` : "") },
          },
        },
      },
    });
  }

  async function iniciar() {
    try {
      const r = await fetch("datos/experimentos.json", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      datos = await r.json();
    } catch (error) {
      document.querySelector("main").insertAdjacentHTML("afterbegin", `<p class="error">No se pudieron leer los datos (${esc(error.message)}). Sirva la carpeta por HTTP y ejecute el generador del backend.</p>`);
      return;
    }
    pintarTarjetas();
    pintarDetalle(2);
    $("selector").innerHTML = Object.entries(TIPOS).map(([k, v]) => `<button type="button" data-tipo="${k}">${v}</button>`).join("");
    $("selector").addEventListener("click", (e) => {
      if (e.target.dataset.tipo) { tipoActivo = e.target.dataset.tipo; pintarSistema(); }
    });
    pintarSistema();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", pintarSistema);
  }

  iniciar();
})();
