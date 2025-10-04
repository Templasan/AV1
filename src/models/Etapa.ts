// src/models/Etapa.ts

import { StatusEtapa } from "../enums/enums";
import { Funcionario } from "./Funcionario";

export class Etapa {
    nome: string;
    prazo: Date;
    status: StatusEtapa;
    funcionarios: Funcionario[] = [];

    constructor(nome: string, prazo: Date) {
        this.nome = nome;
        this.prazo = prazo;
        this.status = StatusEtapa.PENDENTE; // Status inicial padrão
    }

    // Método para iniciar a etapa [cite: 104]
    public iniciar(): void {
        this.status = StatusEtapa.EM_ANDAMENTO;
    }

    // Método para finalizar a etapa [cite: 104]
    public finalizar(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    // Associa um funcionário a esta etapa, evitando duplicidade [cite: 111]
    public associarFuncionario(funcionario: Funcionario): void {
        const jaAssociado = this.funcionarios.some(f => f.id === funcionario.id);
        if (!jaAssociado) {
            this.funcionarios.push(funcionario);
        } else {
            console.log(`Funcionário ${funcionario.nome} já está associado a esta etapa.`);
        }
    }
}