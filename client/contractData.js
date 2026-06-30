const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "CampoVazio",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CpfJaCadastrado",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IdadeInvalida",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "cpf",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nome",
        "type": "string"
      }
    ],
    "name": "PacienteCadastrado",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_nome",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_cpf",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_idade",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_endereco",
        "type": "string"
      }
    ],
    "name": "cadastrarPaciente",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cpf",
        "type": "string"
      }
    ],
    "name": "consultarPaciente",
    "outputs": [
      {
        "internalType": "string",
        "name": "nome",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cpf",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "idade",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "endereco",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "existe",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_cpf",
        "type": "string"
      }
    ],
    "name": "pacienteExiste",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0x5335de082C25378B500106c340ACA80290d98644";
