// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract ContratoExemplo {

    struct Paciente {
        string nome;
        string cpf;
        uint idade;
        string endereco;
        bool cadastrado;
    }

    mapping(string => Paciente) private pacientes;

    event PacienteCadastrado(string cpf, string nome);

    error IdadeInvalida();
    error CampoVazio();
    error CpfJaCadastrado();

    function cadastrarPaciente(
        string memory _nome,
        string memory _cpf,
        uint _idade,
        string memory _endereco
    ) public {
        if (_idade <= 12) revert IdadeInvalida();
        if (bytes(_nome).length == 0) revert CampoVazio();
        if (bytes(_cpf).length != 11) revert CampoVazio();
        if (pacientes[_cpf].cadastrado) revert CpfJaCadastrado();

        pacientes[_cpf] = Paciente({
            nome: _nome,
            cpf: _cpf,
            idade: _idade,
            endereco: _endereco,
            cadastrado: true
        });

        emit PacienteCadastrado(_cpf, _nome);
    }

    function consultarPaciente(string memory _cpf) public view returns (
        string memory nome,
        string memory cpf,
        uint idade,
        string memory endereco,
        bool existe
    ) {
        Paciente memory p = pacientes[_cpf];
        
        if (!p.cadastrado) {
            return ("", "", 0, "", false);
        }

        return (p.nome, p.cpf, p.idade, p.endereco, true);
    }

    function pacienteExiste(string memory _cpf) public view returns (bool) {
        return pacientes[_cpf].cadastrado;
    }
}