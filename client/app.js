
let web3;
let contratoExemplo;
let contaAtiva;

const connectionStatusEl = document.getElementById("connectionStatus");
const currentValueEl = document.getElementById("currentValue");
const logEl = document.getElementById("log");
const formGuardar = document.getElementById("formGuardar");
const inputNumero = document.getElementById("inputNumero");
const btnGuardar = document.getElementById("btnGuardar");
const btnAtualizar = document.getElementById("btnAtualizar");

function log(mensagem, tipo = "info") {
  const linha = document.createElement("div");
  linha.className = tipo;
  const hora = new Date().toLocaleTimeString();
  linha.textContent = `[${hora}] ${mensagem}`;
  logEl.prepend(linha);
}

function setConnectionStatus(texto, tipo) {
  connectionStatusEl.textContent = texto;
  connectionStatusEl.className = `status status--${tipo}`;
}

async function inicializar() {
  try {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      log("Conectado via MetaMask.", "ok");
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
      log("MetaMask não encontrado. Conectando diretamente ao Ganache (127.0.0.1:7545).", "info");
    }

    const contas = await web3.eth.getAccounts();

    if (!contas || contas.length === 0) {
      throw new Error("Nenhuma conta encontrada. Verifique se o Ganache está rodando.");
    }

    contaAtiva = contas[0];

    if (
      !CONTRACT_ADDRESS ||
      CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        "Endereço do contrato não configurado. Edite client/contractData.js após o deploy."
      );
    }

    contratoExemplo = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    setConnectionStatus(`Conectado | Conta: ${contaAtiva.slice(0, 6)}...${contaAtiva.slice(-4)}`, "connected");
    log(`Contrato carregado em ${CONTRACT_ADDRESS}`, "ok");

    await atualizarValor();
  } catch (erro) {
    console.error(erro);
    setConnectionStatus("Erro ao conectar à blockchain", "error");
    log(`Erro na inicialização: ${erro.message}`, "err");
  }
}

async function atualizarValor() {
  if (!contratoExemplo) {
    log("Contrato ainda não carregado.", "err");
    return;
  }

  try {
    btnAtualizar.disabled = true;
    const valor = await contratoExemplo.methods.numero().call();
    currentValueEl.textContent = valor;
    log(`Valor atual lido do contrato: ${valor}`, "ok");
  } catch (erro) {
    console.error(erro);
    log(`Erro ao ler o valor: ${erro.message}`, "err");
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function guardarValor(novoNumero) {
  if (!contratoExemplo) {
    log("Contrato ainda não carregado.", "err");
    return;
  }

  try {
    btnGuardar.disabled = true;
    log(`Enviando transação para guardar o valor ${novoNumero}...`, "info");

    const recibo = await contratoExemplo.methods
      .guardar(novoNumero)
      .send({ from: contaAtiva });

    log(`Transação confirmada! Hash: ${recibo.transactionHash}`, "ok");

    await atualizarValor();
  } catch (erro) {
    console.error(erro);

    if (erro.code === 4001) {
      log("Transação rejeitada pelo usuário na MetaMask.", "err");
    } else {
      log(`Erro ao guardar valor: ${erro.message}`, "err");
    }
  } finally {
    btnGuardar.disabled = false;
  }
}

formGuardar.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const valorDigitado = inputNumero.value.trim();

  if (valorDigitado === "" || Number(valorDigitado) < 0) {
    log("Digite um número inteiro positivo válido.", "err");
    return;
  }

  guardarValor(valorDigitado);
});

btnAtualizar.addEventListener("click", () => {
  atualizarValor();
});

console.clear();

window.addEventListener("load", () => {
  if (window.Splitting) {
    Splitting();
  }
  inicializar();
});
