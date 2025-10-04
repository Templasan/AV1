// src/models/Funcionario.ts

import { NivelPermissao } from "../enums/enums";

export class Funcionario {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    private senha: string; // A senha deve ser privada
    nivelPermissao: NivelPermissao;

    constructor(id: string, nome: string, telefone: string, endereco: string, usuario: string, senha: string, nivel: NivelPermissao) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.usuario = usuario;
        this.senha = senha; // Idealmente, isso seria um hash
        this.nivelPermissao = nivel;
    }

    // Método para autenticar o funcionário 
    public autenticar(usuario: string, senhaInserida: string): boolean {
        // Em um sistema real, compararíamos o hash da senha
        return this.usuario === usuario && this.senha === senhaInserida;
    }
}