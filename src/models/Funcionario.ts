import { NivelPermissao } from "../enums/enums.js";

export class Funcionario {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    private senha: string;
    nivelPermissao: NivelPermissao;

    constructor(id: string, nome: string, telefone: string, endereco: string, usuario: string, senha: string, nivel: NivelPermissao) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.usuario = usuario;
        this.senha = senha; 
        this.nivelPermissao = nivel;
    }

    public autenticar(usuario: string, senhaInserida: string): boolean {
        return this.usuario === usuario && this.senha === senhaInserida;
    }
}