let web3;
let contratoExemplo;
let contaAtiva;

const connectionStatusEl = document.getElementById("connectionStatus");
const logEl = document.getElementById("log");
const listaPacientesEl = document.getElementById("listaPacientes");
const detalhesPacienteEl = document.getElementById("detalhesPaciente");
const formPaciente = document.getElementById("formPaciente");
const inputNome = document.getElementById("inputNome");
const inputCpf = document.getElementById("inputCpf");
const inputIdade = document.getElementById("inputIdade");
const inputEndereco = document.getElementById("inputEndereco");
const btnCadastrar = document.getElementById("btnCadastrar");
const btnAtualizarPacientes = document.getElementById("btnAtualizarPacientes");

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

function formatarCPF(cpf) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function mostrarDetalhes(cpf, nome, idade, endereco) {
  detalhesPacienteEl.innerHTML = `
    <div class="paciente-info">
      <h4>Dados do paciente</h4>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>CPF:</strong> ${formatarCPF(cpf)}</p>
      <p><strong>Idade:</strong> ${idade} anos</p>
      <p><strong>Endereço:</strong> ${endereco || "Não informado"}</p>
    </div>
  `;
  detalhesPacienteEl.style.display = "block";
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

    await listarPacientes();
  } catch (erro) {
    console.error(erro);
    setConnectionStatus("Erro ao conectar à blockchain", "error");
    log(`Erro na inicialização: ${erro.message}`, "err");
  }
}

async function cadastrarPaciente(nome, cpf, idade, endereco) {
  if (!contratoExemplo) {
    log("Contrato ainda não carregado.", "err");
    return;
  }

  try {
    btnCadastrar.disabled = true;
    log(`Enviando transação para cadastrar paciente ${nome}...`, "info");

    const recibo = await contratoExemplo.methods
      .cadastrarPaciente(nome, cpf, idade, endereco || "")
      .send({ from: contaAtiva, gas: 500000 });

    log(`Paciente ${nome} cadastrado com sucesso! Hash: ${recibo.transactionHash}`, "ok");

    formPaciente.reset();
    detalhesPacienteEl.style.display = "none";
    await listarPacientes();
  } catch (erro) {
    console.error(erro);

    if (erro.code === 4001) {
      log("Transação rejeitada pelo usuário na MetaMask.", "err");
    } else if (erro.message && (erro.message.includes("IdadeInvalida") || erro.message.includes("Idade deve ser maior"))) {
      log("Erro: Idade deve ser maior que 12 anos.", "err");
    } else if (erro.message && (erro.message.includes("CpfJaCadastrado") || erro.message.includes("CPF ja cadastrado"))) {
      log("Erro: Este CPF já foi cadastrado.", "err");
    } else if (erro.message && (erro.message.includes("CampoVazio") || erro.message.includes("nao pode estar vazio"))) {
      log("Erro: CPF deve ter exatamente 11 dígitos.", "err");
    } else {
      log(`Erro ao cadastrar paciente: ${erro.message}`, "err");
    }
  } finally {
    btnCadastrar.disabled = false;
  }
}

async function listarPacientes() {
  if (!contratoExemplo) {
    log("Contrato ainda não carregado.", "err");
    return;
  }

  try {
    btnAtualizarPacientes.disabled = true;
    log("Buscando pacientes cadastrados...", "info");

    const eventos = await contratoExemplo.getPastEvents("PacienteCadastrado", {
      fromBlock: 0,
      toBlock: "latest"
    });

    if (eventos.length === 0) {
      listaPacientesEl.innerHTML = "";
      listaPacientesEl.textContent = "Nenhum paciente cadastrado ainda.";
      log("Nenhum paciente encontrado.", "info");
      return;
    }

    let html = "";
    for (const evento of eventos) {
      const cpf = evento.returnValues.cpf;
      const nome = evento.returnValues.nome;
      html += `<div class="paciente-item" data-cpf="${cpf}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7CFFB2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="paciente-nome">${nome}</span>
        <span class="paciente-cpf">${formatarCPF(cpf)}</span>
      </div>`;
    }

    listaPacientesEl.innerHTML = html;

    detalhesPacienteEl._ultimoCpf = null;

    document.querySelectorAll(".paciente-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const cpf = item.dataset.cpf;

        if (detalhesPacienteEl._ultimoCpf === cpf) {
          detalhesPacienteEl.classList.add("fechando");
          setTimeout(() => {
            detalhesPacienteEl.style.display = "none";
            detalhesPacienteEl.classList.remove("fechando");
          }, 200);
          detalhesPacienteEl._ultimoCpf = null;
          return;
        }

        try {
          const dados = await contratoExemplo.methods.consultarPaciente(cpf).call();
          if (dados.existe) {
            mostrarDetalhes(dados.cpf, dados.nome, dados.idade, dados.endereco);
            detalhesPacienteEl._ultimoCpf = cpf;
          }
        } catch (erro) {
          log("Erro ao buscar detalhes.", "err");
        }
      });
    });

    log(`${eventos.length} paciente(s) encontrado(s). Clique em um paciente para ver detalhes.`, "ok");
  } catch (erro) {
    console.error(erro);
    log(`Erro ao listar pacientes: ${erro.message}`, "err");
  } finally {
    btnAtualizarPacientes.disabled = false;
  }
}

formPaciente.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  let cpf = inputCpf.value.trim().replace(/\D/g, "");
  const idade = parseInt(inputIdade.value, 10);
  const endereco = inputEndereco.value.trim();

  if (!nome) {
    log("Digite um nome válido.", "err");
    return;
  }

  if (cpf.length !== 11) {
    log("CPF deve ter exatamente 11 dígitos.", "err");
    return;
  }

  if (!idade || idade < 13) {
    log("A idade deve ser maior que 12 anos.", "err");
    return;
  }

  cadastrarPaciente(nome, cpf, idade, endereco);
});

btnAtualizarPacientes.addEventListener("click", () => {
  detalhesPacienteEl.style.display = "none";
  listarPacientes();
});

console.clear();

window.addEventListener("load", () => {
  if (window.Splitting) {
    Splitting();
  }
  inicializar();
});