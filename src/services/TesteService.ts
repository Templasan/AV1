// src/services/TesteService.ts
import { Aeronave } from '../models/Aeronave.js';
import { Teste } from '../models/Teste.js';
import { TipoTeste, ResultadoTeste } from '../enums/enums.js';

export class TesteService {
    /**
     * Adiciona um novo teste a uma aeronave.
     */
    public adicionarTeste(codigoAeronave: string, tipoTeste: TipoTeste, aeronavesList: Aeronave[]): Teste {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

        // Validação opcional: não permitir adicionar o mesmo tipo de teste repetidamente.
        const testeExistente = aeronave.testes.some(t => t.tipo === tipoTeste);
        if (testeExistente) {
            // Nota: Dependendo da regra de negócio, pode-se querer permitir múltiplos testes do mesmo tipo.
            // Para este exemplo, vamos assumir que apenas um de cada tipo é adicionado.
            // console.warn(`Aviso: Um teste do tipo '${tipoTeste}' já existe para esta aeronave.`);
        }

        const novoTeste = new Teste(tipoTeste);
        aeronave.adicionarTeste(novoTeste);
        return novoTeste;
    }

    /**
     * Regista o resultado de um teste realizado numa aeronave.
     */
    public registrarResultado(codigoAeronave: string, tipoTeste: TipoTeste, resultado: ResultadoTeste, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

        // Procura o primeiro teste daquele tipo que ainda não tenha um resultado.
        const teste = aeronave.testes.find(t => t.tipo === tipoTeste && !t.resultado);
        if (!teste) {
            throw new Error(`Teste do tipo '${tipoTeste}' não encontrado ou já possui um resultado registado.`);
        }

        teste.registrarResultado(resultado);
    }
}