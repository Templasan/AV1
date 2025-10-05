import { StatusEtapa } from "../enums/enums.js";
import { Funcionario } from "./Funcionario.js";

export class Etapa {
    nome: string;
    prazo: Date;
    status: StatusEtapa;
    funcionarios: Funcionario[] = [];

    constructor(nome: string, prazo: Date) {
        this.nome = nome;
        this.prazo = prazo;
        this.status = StatusEtapa.PENDENTE; // 
    }

    public iniciar(): void {
        this.status = StatusEtapa.ANDAMENTO;
    }

    public finalizar(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    public associarFuncionario(funcionario: Funcionario): void {
        const jaAssociado = this.funcionarios.some(f => f.id === funcionario.id);
        if (!jaAssociado) {
            this.funcionarios.push(funcionario);
        } else {
            console.log(`Funcionário ${funcionario.nome} já está associado a esta etapa.`);
        }
    }
}