const ContratoExemplo = artifacts.require("ContratoExemplo");

module.exports = function (deployer) {
  deployer.deploy(ContratoExemplo);
};
