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

// Preenche os campos a partir da URL, por exemplo:
// ?valor=19.90&kmBusca=1.7&minBusca=5&kmCorrida=9.3&minCorrida=34
// Assim o app Atalhos consegue abrir a calculadora já com a corrida calculada.
// Extrai os dados do texto lido do print da 99/Uber (parametro "texto").
// Valor: primeiro "R$ 19,90". Trajetos: "5 min (1,7 km)" e "34 min (9,3 km)".
function preencherPeloTexto(texto) {
  const matchValor = texto.match(/R\$\s*(\d+(?:[.,]\d{1,2})?)/i);
  const trajetos = [];
  const regexTrajeto = /(\d+)\s*min\s*\(\s*(\d+(?:[.,]\d+)?)\s*km\s*\)/gi;
  let m;
  while ((m = regexTrajeto.exec(texto)) !== null) {
    trajetos.push({ min: m[1], km: m[2].replace(",", ".") });
  }

  if (!matchValor || trajetos.length === 0) {
    alert("Não consegui ler a corrida no print. Tente de novo.");
    return false;
  }

  campos.valor.value = matchValor[1].replace(",", ".");

  if (trajetos.length >= 2) {
    campos.minBusca.value = trajetos[0].min;
    campos.kmBusca.value = trajetos[0].km;
    campos.minCorrida.value = trajetos[1].min;
    campos.kmCorrida.value = trajetos[1].km;
  } else {
    campos.minBusca.value = 0;
    campos.kmBusca.value = 0;
    campos.minCorrida.value = trajetos[0].min;
    campos.kmCorrida.value = trajetos[0].km;
  }
  return true;
}

function lerParametrosDaURL() {
  const params = new URLSearchParams(window.location.search);

  const texto = params.get("texto");
  if (texto) {
    if (preencherPeloTexto(texto)) calcular();
    return;
  }

  const nomes = ["valor", "kmBusca", "minBusca", "kmCorrida", "minCorrida"];
  let achou = false;

  nomes.forEach(function (nome) {
    const v = params.get(nome);
    if (v !== null && v !== "") {
      campos[nome].value = v.replace(",", ".");
      achou = true;
    }
  });

  if (achou) calcular();
}

// Ao tocar em um campo, seleciona o valor todo para já poder digitar por cima.
document.querySelectorAll("input").forEach(function (campo) {
  campo.addEventListener("focus", function () {
    campo.select();
  });
});

carregarAjustes();
lerParametrosDaURL();
