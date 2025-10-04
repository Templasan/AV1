// src/models/Peca.ts

import { TipoPeca, StatusPeca } from "../enums/enums";

export class Peca {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    status: StatusPeca;

    constructor(nome: string, tipo: TipoPeca, fornecedor: string) {
        this.nome = nome;
        this.tipo = tipo;
        this.fornecedor = fornecedor;
        this.status = StatusPeca.EM_PRODUCAO; // Status inicial padrão
    }

    // Método para atualizar o status da peça 
    public atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
        console.log(`O status da peça '${this.nome}' foi atualizado para: ${novoStatus}`);
    }
}