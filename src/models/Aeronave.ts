import { TipoAeronave } from "../enums/enums.js";
import { Peca } from "./Peca.js";
import { Etapa } from "./Etapa.js";
import { Teste } from "./Teste.js";

export class Aeronave {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
    pecas: Peca[] = [];
    etapas: Etapa[] = [];
    testes: Teste[] = [];

    constructor(codigo: string, modelo: string, tipo: TipoAeronave, capacidade: number, alcance: number) {
        this.codigo = codigo;
        this.modelo = modelo;
        this.tipo = tipo;
        this.capacidade = capacidade;
        this.alcance = alcance;
    }

    public adicionarPeca(peca: Peca): void {
        this.pecas.push(peca);
    }

    public adicionarEtapa(etapa: Etapa): void {
        this.etapas.push(etapa);
    }
    
    public adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }
    
    public exibirDetalhes(): void {
        console.log(`\n======================================================`);
        console.log(`  DETALHES DA AERONAVE: ${this.modelo} (${this.codigo})`);
        console.log(`======================================================`);
        console.log(`- Tipo: ${this.tipo}`);
        console.log(`- Capacidade: ${this.capacidade} passageiros`);
        console.log(`- Alcance: ${this.alcance} km`);

        console.log('\n--- PEÇAS REGISTADAS ---');
        if (this.pecas.length === 0) {
            console.log('Nenhuma peça registada.');
        } else {
            this.pecas.forEach(p => {
                console.log(`  - ${p.nome} (Fornecedor: ${p.fornecedor}) - Status: ${p.status}`);
            });
        }

        console.log('\n--- ETAPAS DE PRODUÇÃO ---');
        if (this.etapas.length === 0) {
            console.log('Nenhuma etapa de produção definida.');
        } else {
            this.etapas.forEach(e => {
                const funcionariosNomes = e.funcionarios.map(f => f.nome).join(', ') || 'Nenhum';
                console.log(`  - ${e.nome} (Prazo: ${e.prazo.toLocaleDateString('pt-BR')}) - Status: ${e.status}`);
                console.log(`    > Responsáveis: ${funcionariosNomes}`);
            });
        }

        console.log('\n--- TESTES APLICADOS ---');
        if (this.testes.length === 0) {
            console.log('Nenhum teste aplicado.');
        } else {
            this.testes.forEach(t => {
                console.log(`  - Tipo: ${t.tipo} - Resultado: ${t.resultado || 'Pendente'}`);
            });
        }
        console.log(`======================================================`);
    }
}