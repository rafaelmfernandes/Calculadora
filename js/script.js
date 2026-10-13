const campos = {
  valor: document.getElementById("valor"),
  kmBusca: document.getElementById("kmBusca"),
  minBusca: document.getElementById("minBusca"),
  kmCorrida: document.getElementById("kmCorrida"),
  minCorrida: document.getElementById("minCorrida"),
  custoKm: document.getElementById("custoKm"),
  metaMin: document.getElementById("metaMin"),
};

const saida = {
  caixa: document.getElementById("resultado"),
  veredito: document.getElementById("veredito"),
  km: document.getElementById("rKm"),
  min: document.getElementById("rMin"),
  custo: document.getElementById("rCusto"),
  lucro: document.getElementById("rLucro"),
  lucroKm: document.getElementById("rLucroKm"),
  lucroMin: document.getElementById("rLucroMin"),
};

// Lê um número do campo aceitando vírgula ou ponto. Campo vazio vira 0.
function lerNumero(input) {
  const texto = String(input.value).replace(",", ".").trim();
  const numero = parseFloat(texto);
  return isNaN(numero) ? 0 : numero;
}

function dinheiro(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numero(n, casas) {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

// Guarda os ajustes (custo por km e meta) no próprio aparelho.
function salvarAjustes() {
  try {
    localStorage.setItem("custoKm", campos.custoKm.value);
    localStorage.setItem("metaMin", campos.metaMin.value);
  } catch (e) {
    // Se o navegador bloquear o armazenamento, só segue sem salvar.
  }
}

function carregarAjustes() {
  try {
    const custo = localStorage.getItem("custoKm");
    const meta = localStorage.getItem("metaMin");
    if (custo) campos.custoKm.value = custo;
    if (meta) campos.metaMin.value = meta;
  } catch (e) {
    // Sem armazenamento, mantém os valores padrão do HTML.
  }
}

function calcular() {
  const valor = lerNumero(campos.valor);
  const kmTotal = lerNumero(campos.kmBusca) + lerNumero(campos.kmCorrida);
  const minTotal = lerNumero(campos.minBusca) + lerNumero(campos.minCorrida);
  const custoKm = lerNumero(campos.custoKm);
  const metaMin = lerNumero(campos.metaMin);

  if (valor <= 0 || kmTotal <= 0 || minTotal <= 0) {
    alert("Preencha o valor, os km e os minutos da corrida.");
    return;
  }

  const custo = kmTotal * custoKm;
  const lucro = valor - custo;
  const lucroKm = lucro / kmTotal;
  const lucroMin = lucro / minTotal;

  saida.km.textContent = numero(kmTotal, 1) + " km";
  saida.min.textContent = numero(minTotal, 0) + " min";
  saida.custo.textContent = dinheiro(custo);
  saida.lucro.textContent = dinheiro(lucro);
  saida.lucroKm.textContent = dinheiro(lucroKm);
  saida.lucroMin.textContent = dinheiro(lucroMin);

  saida.caixa.classList.remove("bom", "medio", "ruim");

  if (lucroMin >= metaMin) {
    saida.caixa.classList.add("bom");
    saida.veredito.textContent = "Compensa, aceita!";
  } else if (lucroMin >= metaMin * 0.8) {
    saida.caixa.classList.add("medio");
    saida.veredito.textContent = "No limite, avalie";
  } else {
    saida.caixa.classList.add("ruim");
    saida.veredito.textContent = "Não compensa";
  }

  saida.caixa.classList.remove("oculto");
  saida.caixa.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.getElementById("btnCalcular").addEventListener("click", calcular);
campos.custoKm.addEventListener("change", salvarAjustes);
campos.metaMin.addEventListener("change", salvarAjustes);

carregarAjustes();
