
/* =========================================================
   CALCULADORA DE CORRIDAS — UBER E 99

   Responsabilidades:
   - Ler os parâmetros recebidos pela URL.
   - Interpretar ofertas da 99 e da Uber.
   - Identificar o valor total da oferta.
   - Ignorar o preço informativo por quilômetro.
   - Identificar o trajeto até o passageiro.
   - Identificar o trajeto percorrido com o passageiro.
   - Converter metros para quilômetros automaticamente.
   - Calcular custo, lucro e rentabilidade.
   - Salvar as configurações do usuário.

   REGRA DOS TRAJETOS:
   1º trajeto = deslocamento até o passageiro.
   2º trajeto = deslocamento com o passageiro.

   IMPORTANTE:
   Este arquivo interpreta o texto recebido pela URL.
   A captura da tela e o OCR são realizados por outra etapa.
   ========================================================= */


/* =========================================================
   1. REFERÊNCIAS DOS CAMPOS
   ========================================================= */

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


/* =========================================================
   2. FUNÇÕES AUXILIARES
   ========================================================= */

// Converte números dos campos aceitando vírgula ou ponto.
function lerNumero(input) {
  if (!input) return 0;

  const texto = String(input.value)
    .trim()
    .replace(",", ".");

  const valor = parseFloat(texto);

  return Number.isFinite(valor) ? valor : 0;
}


// Formata valores monetários.
function dinheiro(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


// Formata números.
function numero(valor, casas) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}


// Prepara um número para ser colocado em um input.
function numeroParaCampo(valor) {
  return String(valor).replace(",", ".");
}


/* =========================================================
   3. SALVAR E CARREGAR CONFIGURAÇÕES
   ========================================================= */

function salvarAjustes() {
  try {
    localStorage.setItem("custoKm", campos.custoKm.value);
    localStorage.setItem("metaMin", campos.metaMin.value);
  } catch (erro) {
    console.warn(
      "[Corridas] Não foi possível salvar os ajustes.",
      erro
    );
  }
}


function carregarAjustes() {
  try {
    const custo = localStorage.getItem("custoKm");
    const meta = localStorage.getItem("metaMin");

    if (custo !== null && custo !== "") {
      campos.custoKm.value = custo;
    }

    if (meta !== null && meta !== "") {
      campos.metaMin.value = meta;
    }
  } catch (erro) {
    console.warn(
      "[Corridas] Não foi possível carregar os ajustes.",
      erro
    );
  }
}


/* =========================================================
   4. CALCULAR A RENTABILIDADE
   ========================================================= */

function calcular() {
  const valor = lerNumero(campos.valor);

  const kmBusca = lerNumero(campos.kmBusca);
  const kmCorrida = lerNumero(campos.kmCorrida);

  const minBusca = lerNumero(campos.minBusca);
  const minCorrida = lerNumero(campos.minCorrida);

  const kmTotal = kmBusca + kmCorrida;
  const minTotal = minBusca + minCorrida;

  const custoKm = lerNumero(campos.custoKm);
  const metaMin = lerNumero(campos.metaMin);

  if (valor <= 0 || kmTotal <= 0 || minTotal <= 0) {
    alert(
      "Preencha o valor, os quilômetros e os minutos da corrida."
    );
    return;
  }

  if (custoKm < 0 || metaMin < 0) {
    alert(
      "O custo por km e a meta por minuto não podem ser negativos."
    );
    return;
  }

  const custo = kmTotal * custoKm;
  const lucro = valor - custo;

  const lucroKm = lucro / kmTotal;
  const lucroMin = lucro / minTotal;

  saida.km.textContent = numero(kmTotal, 2) + " km";
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

  console.log("[Corridas] Cálculo realizado:", {
    valor,
    kmBusca,
    minBusca,
    kmCorrida,
    minCorrida,
    kmTotal,
    minTotal,
    custo,
    lucro,
    lucroKm,
    lucroMin,
  });
}


/* =========================================================
   5. NORMALIZAR O TEXTO

   Aceita:
   - Espaços normais e especiais.
   - Quebras de linha.
   - Ponto ou vírgula decimal.
   - Diferenças de maiúsculas e minúsculas.

   Mantém as quebras de linha para ajudar na leitura
   de informações distribuídas em linhas diferentes.
   ========================================================= */

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFKC")
    .replace(/[\u00A0\u202F\u2007]/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]*/g, "\n")
    .trim();
}


/* =========================================================
   6. EXTRAIR O VALOR DA OFERTA

   Exemplos:
   R$ 19,90
   R$ 19.99
   R$19,99

   IMPORTANTE:
   R$ 1,82/Km e R$ 1,29/km são valores informativos
   por quilômetro e NÃO são o preço total da oferta.

   A função ignora valores monetários seguidos por /km.
   ========================================================= */

function extrairValor(texto) {
  const regexValor =
    /R\s*\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?![\d.,])/gi;

  let correspondencia;

  while (
    (correspondencia = regexValor.exec(texto)) !== null
  ) {
    const textoValor = correspondencia[1];

    const restante = texto.slice(regexValor.lastIndex);

    // Ignora o preço informativo por quilômetro.
    if (/^\s*\/\s*km\b/i.test(restante)) {
      continue;
    }

    let valorNormalizado = textoValor;

    // Exemplo: 1.234,56 -> 1234.56
    if (
      valorNormalizado.includes(".") &&
      valorNormalizado.includes(",")
    ) {
      valorNormalizado = valorNormalizado
        .replace(/\./g, "")
        .replace(",", ".");
    } else if (valorNormalizado.includes(",")) {
      valorNormalizado = valorNormalizado.replace(",", ".");
    }

    const valor = Number(valorNormalizado);

    if (Number.isFinite(valor) && valor > 0) {
      return valor;
    }
  }

  return null;
}


/* =========================================================
   7. CONVERTER DISTÂNCIAS PARA QUILÔMETROS

   Exemplos:
   960 m       -> 0.96 km
   500 metros  -> 0.5 km
   1.200 m     -> 1.2 km
   0.9 km      -> 0.9 km
   14,6 km     -> 14.6 km

   REGRA:
   - Distâncias em metros são divididas por 1.000.
   - Distâncias em quilômetros permanecem em quilômetros.

   Para metros, um número como "1.200 m" representa
   1.200 metros, usando o ponto como separador de milhar.
   ========================================================= */

function converterDistanciaParaKm(valorTexto, unidadeTexto) {
  if (!valorTexto || !unidadeTexto) {
    return null;
  }

  let textoNumero = String(valorTexto).trim();
  const unidade = String(unidadeTexto)
    .trim()
    .toLowerCase()
    .replace(/s$/, "");

  const estaEmMetros =
    unidade === "m" ||
    unidade === "metro";

  let valor;

  if (estaEmMetros) {
    /*
     * Em metros, "1.200" ou "1,200" é interpretado
     * como 1200 metros quando há exatamente três
     * algarismos após o separador.
     *
     * Exemplos:
     * 1.200 m -> 1200 m
     * 1,200 m -> 1200 m
     * 960 m   -> 960 m
     * 960,5 m -> 960.5 m
     */
    if (/^\d{1,3}[.,]\d{3}$/.test(textoNumero)) {
      textoNumero = textoNumero.replace(/[.,]/g, "");
    } else {
      textoNumero = textoNumero.replace(",", ".");
    }

    valor = Number(textoNumero);

    if (!Number.isFinite(valor) || valor < 0) {
      return null;
    }

    return valor / 1000;
  }

  /*
   * Para quilômetros:
   * 14,6 km -> 14.6
   * 14.6 km -> 14.6
   * 1.200 km -> 1.2
   *
   * Se houver ponto e vírgula juntos, considera
   * o ponto como separador de milhar.
   */
  if (
    textoNumero.includes(".") &&
    textoNumero.includes(",")
  ) {
    textoNumero = textoNumero
      .replace(/\./g, "")
      .replace(",", ".");
  } else {
    textoNumero = textoNumero.replace(",", ".");
  }

  valor = Number(textoNumero);

  if (!Number.isFinite(valor) || valor < 0) {
    return null;
  }

  return valor;
}


/* =========================================================
   8. EXTRAIR OS TRAJETOS

   Formatos aceitos:

   99:
   5 min (1,7 km)
   34 min (9,3 km)

   Uber:
   4 min (0.9 km)
   33 minutos (14.6 km)

   Distâncias em metros:
   4 min (960 m)
   33 min (14.6 km)

   Também aceita:
   4 min (960 metros)
   4 minutos (960 m)
   5 mins (1,7 quilômetros)

   Formatos com informações em linhas separadas:
   4 min
   960 m

   33 minutos
   14.6 km

   Os trajetos são retornados na ordem em que aparecem:
   1º = busca do passageiro.
   2º = viagem com o passageiro.
   ========================================================= */

function extrairTrajetos(texto) {
  const trajetos = [];

  /*
   * Expressão numérica que aceita:
   * 960
   * 0.9
   * 14,6
   * 1.200
   *
   * Também permite números com separadores de milhar.
   */
  const numeroDistancia =
    "\\d{1,3}(?:[.,]\\d{3})+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?";

  /*
   * Unidades aceitas:
   * km, kms, quilômetro, quilômetros,
   * m, metro, metros.
   *
   * A unidade km aparece antes de m para
   * identificar corretamente os quilômetros.
   */
  const unidadeDistancia =
    "(?:quil[oô]metros?|kms?|km|metros?|m)";

  /*
   * PRIMEIRA TENTATIVA:
   *
   * Procura pares completos, com minutos e distância
   * dentro do mesmo bloco entre parênteses.
   *
   * Exemplos:
   * 5 min (1,7 km)
   * 4 min (960 m)
   * 33 minutos (14.6 km)
   */
  const regexCompleto = new RegExp(
    "(\\d{1,3})\\s*min(?:uto)?s?\\s*" +
    "\\(\\s*(" + numeroDistancia + ")\\s*" +
    "(" + unidadeDistancia + ")\\s*\\)",
    "gi"
  );

  let resultado;

  while (
    (resultado = regexCompleto.exec(texto)) !== null
  ) {
    const minutos = Number(resultado[1]);

    const km = converterDistanciaParaKm(
      resultado[2],
      resultado[3]
    );

    if (
      Number.isFinite(minutos) &&
      km !== null &&
      minutos >= 0 &&
      km > 0
    ) {
      trajetos.push({
        min: minutos,
        km,
        indice: resultado.index,
      });
    }
  }

  // Se encontrou pares completos, mantém a ordem original.
  if (trajetos.length > 0) {
    return trajetos.sort(
      (a, b) => a.indice - b.indice
    );
  }

  /*
   * SEGUNDA TENTATIVA:
   *
   * Algumas capturas OCR separam minutos e distância
   * em linhas diferentes.
   *
   * Exemplo:
   * 4 min
   * 960 m
   *
   * 33 minutos
   * 14.6 km
   */

  const linhas = texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const itens = [];

  const regexMinutos =
    /\b(\d{1,3})\s*min(?:uto)?s?\b/i;

  const regexDistancia = new RegExp(
    "\\b(" + numeroDistancia + ")\\s*" +
    "(" + unidadeDistancia + ")\\b",
    "i"
  );

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    const matchMin = linha.match(regexMinutos);
    const matchDistancia = linha.match(regexDistancia);

    if (matchMin) {
      itens.push({
        tipo: "min",
        valor: Number(matchMin[1]),
        linha: i,
      });
    }

    if (matchDistancia) {
      const km = converterDistanciaParaKm(
        matchDistancia[1],
        matchDistancia[2]
      );

      if (km !== null && km > 0) {
        itens.push({
          tipo: "distancia",
          valor: km,
          linha: i,
        });
      }
    }
  }

  const minutosEncontrados = itens.filter(
    (item) => item.tipo === "min"
  );

  const distanciasEncontradas = itens.filter(
    (item) => item.tipo === "distancia"
  );

  const distanciasUsadas = new Set();

  for (const itemMin of minutosEncontrados) {
    let melhorIndice = -1;
    let menorDistancia = Infinity;

    for (
      let i = 0;
      i < distanciasEncontradas.length;
      i++
    ) {
      if (distanciasUsadas.has(i)) {
        continue;
      }

      const distanciaLinhas = Math.abs(
        itemMin.linha - distanciasEncontradas[i].linha
      );

      if (distanciaLinhas < menorDistancia) {
        menorDistancia = distanciaLinhas;
        melhorIndice = i;
      }
    }

    // Só associa informações que estejam em linhas próximas.
    if (
      melhorIndice !== -1 &&
      menorDistancia <= 2
    ) {
      const itemDistancia =
        distanciasEncontradas[melhorIndice];

      distanciasUsadas.add(melhorIndice);

      trajetos.push({
        min: itemMin.valor,
        km: itemDistancia.valor,
        indice: itemMin.linha,
      });
    }
  }

  return trajetos.sort(
    (a, b) => a.indice - b.indice
  );
}


/* =========================================================
   9. INTERPRETAR A OFERTA E PREENCHER OS CAMPOS

   O valor total da oferta é extraído separadamente
   dos trajetos.

   Com dois trajetos:
   - Primeiro: busca do passageiro.
   - Segundo: corrida com o passageiro.

   Com apenas um trajeto:
   - O único trajeto é considerado a corrida.
   ========================================================= */

function preencherPeloTexto(texto) {
  if (!texto || !String(texto).trim()) {
    console.error(
      "[Corridas] O texto recebido está vazio."
    );

    alert(
      "O texto recebido está vazio. Não consegui ler a corrida."
    );

    return false;
  }

  const textoOriginal = String(texto);

  const textoNormalizado = normalizarTexto(
    textoOriginal
  );

  console.log("========== LEITURA DA OFERTA ==========");
  console.log("Texto original:", textoOriginal);
  console.log("Texto normalizado:", textoNormalizado);

  const valor = extrairValor(textoNormalizado);

  const trajetos = extrairTrajetos(
    textoNormalizado
  );

  console.log("Valor total identificado:", valor);
  console.log("Trajetos identificados:", trajetos);
  console.log("=======================================");

  if (valor === null || trajetos.length === 0) {
    console.warn(
      "[Corridas] Não foi possível interpretar a oferta.",
      {
        textoOriginal,
        textoNormalizado,
        valorEncontrado: valor,
        trajetosEncontrados: trajetos,
      }
    );

    alert(
      "Não consegui interpretar a oferta.\n\n" +
      "Valor total: " +
      (valor !== null ? dinheiro(valor) : "não encontrado") +
      "\nTrajetos identificados: " +
      trajetos.length +
      "\n\nConsulte o Console do navegador para verificar " +
      "o texto recebido."
    );

    return false;
  }

  // Preenche o preço total da oferta.
  campos.valor.value = numeroParaCampo(valor);

  if (trajetos.length >= 2) {
    // PRIMEIRO TRAJETO:
    // deslocamento até o passageiro.
    campos.minBusca.value = trajetos[0].min;
    campos.kmBusca.value = numeroParaCampo(
      trajetos[0].km
    );

    // SEGUNDO TRAJETO:
    // deslocamento percorrido com o passageiro.
    campos.minCorrida.value = trajetos[1].min;
    campos.kmCorrida.value = numeroParaCampo(
      trajetos[1].km
    );
  } else {
    // Mantém o comportamento para ofertas com um trajeto.
    campos.minBusca.value = 0;
    campos.kmBusca.value = 0;

    campos.minCorrida.value = trajetos[0].min;
    campos.kmCorrida.value = numeroParaCampo(
      trajetos[0].km
    );
  }

  console.log("[Corridas] Campos preenchidos:", {
    valor: campos.valor.value,
    kmBusca: campos.kmBusca.value,
    minBusca: campos.minBusca.value,
    kmCorrida: campos.kmCorrida.value,
    minCorrida: campos.minCorrida.value,
  });

  return true;
}


/* =========================================================
   10. LER OS PARÂMETROS DA URL

   Formato de campos:
   ?valor=19.90&kmBusca=1.7&minBusca=5&kmCorrida=9.3&minCorrida=34

   Formato de texto:
   ?texto=R%24%2019%2C90%205%20min%20%281%2C7%20km%29

   Quando o parâmetro texto estiver presente e não vazio,
   a interpretação do texto terá prioridade.
   ========================================================= */

function lerParametrosDaURL() {
  const params = new URLSearchParams(
    window.location.search
  );

  const texto = params.get("texto");

  if (texto && texto.trim()) {
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
    const valor = params.get(nome);

    if (valor !== null && valor !== "") {
      campos[nome].value = valor.replace(",", ".");
      achou = true;
    }
  });

  if (achou) {
    calcular();
  }
}


/* =========================================================
   11. INICIALIZAR A CALCULADORA
   ========================================================= */

function inicializarCalculadora() {
  document
    .getElementById("btnCalcular")
    .addEventListener("click", calcular);

  campos.custoKm.addEventListener(
    "change",
    salvarAjustes
  );

  campos.metaMin.addEventListener(
    "change",
    salvarAjustes
  );

  // Seleciona o conteúdo do input ao receber foco.
  document.querySelectorAll("input").forEach(
    function (campo) {
      campo.addEventListener("focus", function () {
        campo.select();
      });
    }
  );

  carregarAjustes();
  lerParametrosDaURL();
}


// Aguarda o HTML estar pronto antes de inicializar.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    inicializarCalculadora
  );
} else {
  inicializarCalculadora();
}

