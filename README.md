# Projeto DApp - Contrato Exemplo
esse readme foi resumido ao longo do projeto.
ta o passo a passo, bjs
Estrutura completa: contrato Solidity, migration do Truffle e interface
gráfica (HTML/CSS/JS) integrada via Web3.js.

```
projeto-dapp/
├── contracts/
│   └── ContratoExemplo.sol      <- o contrato (já existente)
├── migrations/
│   └── 2_deploy_contracts.js    <- script de deploy (já existente)
├── client/
│   ├── index.html               <- interface gráfica (formulário)
│   ├── style.css                <- estilo da interface
│   ├── contractData.js          <- ABI + endereço (editar após o deploy)
│   └── app.js                   <- script de integração com a blockchain
├── truffle-config.js
└── package.json
```

## Passo a passo

### 1. Importar no VS Code
Extraia a pasta `projeto-dapp` em qualquer lugar do seu computador e abra
ela no VS Code (`Arquivo > Abrir Pasta...`).

### 2. Instalar dependências do projeto
No terminal do VS Code, na raiz do projeto:

```bash
npm install
```

(Isso instala o `lite-server`, usado só para servir os arquivos do `client/`.)

Se ainda não tiver o Truffle instalado globalmente:

```bash
npm install -g truffle
```

### 3. Abrir o Ganache
Abra o Ganache (GUI) e confirme que ele está rodando na porta **7545**
(é a porta padrão já configurada em `truffle-config.js`). Se você usa o
`ganache-cli`, ele normalmente roda na porta 8545 — nesse caso ajuste a
porta em `truffle-config.js`.

### 4. Compilar e migrar o contrato

```bash
truffle compile
truffle migrate
```

No final do `truffle migrate`, o terminal vai mostrar algo como:

```
contract address:    0xABC123...
```

### 5. Configurar o endereço no front-end
Copie esse endereço e cole na variável `CONTRACT_ADDRESS` dentro de
`client/contractData.js`.

> O ABI que já deixei nesse arquivo corresponde exatamente às funções
> `numero()` e `guardar(uint128)` do contrato atual, então normalmente
> você só precisa atualizar o endereço. Se mudar o contrato, copie o
> novo ABI de `build/contracts/ContratoExemplo.json` (gerado pelo
> `truffle compile`) e substitua o array `CONTRACT_ABI`.

### 6. Rodar a interface

```bash
npm run client
```

Isso abre a interface em `http://localhost:3000`. Se você tiver a
extensão MetaMask no navegador, conecte ela na rede do Ganache
(RPC: `http://127.0.0.1:7545`, Chain ID conforme exibido no Ganache).
Se não tiver MetaMask, a aplicação tenta se conectar direto no Ganache
(funciona para testes, mas sem confirmação manual de transação).

## O que a interface faz
- Mostra o valor atual armazenado no contrato (lendo `numero()`).
- Permite digitar um novo número e enviar pelo botão **Guardar**, que
  chama a função `guardar(_numero)` (gera uma transação real na rede).
- Botão **Atualizar valor** para reler o valor atual sem precisar
  recarregar a página.
- Área de **Status** com log das ações (sucesso, erro, transação pendente).
