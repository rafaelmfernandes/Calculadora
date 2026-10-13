
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

// Lê um número do campo aceitando vírgula ou ponto.
// Campo vazio ou inválido retorna 0.
function lerNumero(input) {
  const texto = String(input.value).replace(",", ".").trim();
  const numero = parseFloat(texto);
  return isNaN(numero) ? 0 : numero;
}

function dinheiro(n) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
    // Se o navegador bloquear o armazenamento, continua normalmente.
  }
}

function carregarAjustes() {
  try {
    const custo = localStorage.getItem("custoKm");
    const meta = localStorage.getItem("metaMin");

    if (custo) campos.custoKm.value = custo;
    if (meta) campos.metaMin.value = meta;
  } catch (e) {
    // Mantém os valores padrão do HTML.
  }
}

function calcular() {
  const valor = lerNumero(campos.valor);

  const kmTotal =
    lerNumero(campos.kmBusca) +
    lerNumero(campos.kmCorrida);

  const minTotal =
    lerNumero(campos.minBusca) +
    lerNumero(campos.minCorrida);

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

  saida.caixa.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

document
  .getElementById("btnCalcular")
  .addEventListener("click", calcular);

campos.custoKm.addEventListener("change", salvarAjustes);
campos.metaMin.addEventListener("change", salvarAjustes);

// =========================================================
// LEITURA DO TEXTO EXTRAÍDO DO PRINT
//
// Aceita ofertas da 99 e da Uber.
// Exemplos de trajetos reconhecidos:
//
// 3 min (0,8 km)
// 3 mins (0.8 km)
// 9 minuto (3,7 km)
// 9 minutos (3.7 km)
//
// Também aceita quebras de linha e espaços entre os elementos.
// =========================================================

function preencherPeloTexto(texto) {
  if (!texto || !String(texto).trim()) {
    alert("O texto recebido está vazio. Não consegui ler a corrida.");
    return false;
  }

  // Normaliza espaços especiais que podem aparecer no OCR.
  const textoNormalizado = String(texto)
    .replace(/\u00A0/g, " ")
    .replace(/\u202F/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Procura o valor da corrida, por exemplo:
  // R$ 6,75
  // R$ 11,51
  // R$ 19.90
  const matchValor = textoNormalizado.match(
    /R\$\s*(\d+(?:[.,]\d{1,2})?)/i
  );

  const trajetos = [];

  // CORREÇÃO:
  // Aceita "min", "mins", "minuto" e "minutos".
  // Aceita decimais com ponto ou vírgula.
  const regexTrajeto =
    /(\d+)\s*min(?:uto)?s?\s*\(\s*(\d+(?:[.,]\d+)?)\s*km\s*\)/gi;

  let m;

  while ((m = regexTrajeto.exec(textoNormalizado)) !== null) {
    trajetos.push({
      min: m[1],
      km: m[2].replace(",", "."),
    });
  }

  // Sem valor ou sem nenhum trajeto, não preenche os campos.
  if (!matchValor || trajetos.length === 0) {
    console.warn("Não foi possível interpretar a oferta.", {
      textoRecebido: texto,
      textoNormalizado: textoNormalizado,
      valorEncontrado: matchValor ? matchValor[0] : null,
      trajetosEncontrados: trajetos,
    });

    alert(
      "Não consegui ler a corrida no print. " +
      "Verifique se o texto recebido contém o valor e os trajetos."
    );

    return false;
  }

  // Preenche o valor da corrida.
  campos.valor.value = matchValor[1].replace(",", ".");

  // Quando há dois trajetos:
  // Primeiro = deslocamento até o passageiro.
  // Segundo = viagem com o passageiro.
  if (trajetos.length >= 2) {
    campos.minBusca.value = trajetos[0].min;
    campos.kmBusca.value = trajetos[0].km;

    campos.minCorrida.value = trajetos[1].min;
    campos.kmCorrida.value = trajetos[1].km;
  } else {
    // Se houver apenas um trajeto, considera-o como a corrida.
    campos.minBusca.value = 0;
    campos.kmBusca.value = 0;

    campos.minCorrida.value = trajetos[0].min;
    campos.kmCorrida.value = trajetos[0].km;
  }

  return true;
}

// =========================================================
// LEITURA DOS PARÂMETROS DA URL
//
// Exemplos:
//
// ?valor=19.90&kmBusca=1.7&minBusca=5&kmCorrida=9.3&minCorrida=34
//
// ?texto=R%24%2011%2C51%202%20min%20%280.6%20km%29
//
// O parâmetro "texto" tem prioridade quando está presente.
// =========================================================

function lerParametrosDaURL() {
  const params = new URLSearchParams(window.location.search);

  const texto = params.get("texto");

  if (texto) {
    if (preencherPeloTexto(texto)) {
      calcular();
    }

    return;
  }

  const nomes = [
    "valor",
    "kmBusca",
    "minBusca",
    "kmCorrida",
    "minCorrida",
  ];

  let achou = false;

  nomes.forEach(function (nome) {
    const v = params.get(nome);

    if (v !== null && v !== "") {
      campos[nome].value = v.replace(",", ".");
      achou = true;
    }
  });

  if (achou) {
    calcular();
  }
}

// Ao tocar em um campo, seleciona o valor todo
// para permitir substituição rápida.
document.querySelectorAll("input").forEach(function (campo) {
  campo.addEventListener("focus", function () {
    campo.select();
  });
});

// Inicialização.
carregarAjustes();
lerParametrosDaURL();

