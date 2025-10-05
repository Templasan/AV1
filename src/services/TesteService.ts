import { Aeronave } from '../models/Aeronave.js';
import { Teste } from '../models/Teste.js';
import { TipoTeste, ResultadoTeste } from '../enums/enums.js';

export class TesteService {
    public adicionarTeste(codigoAeronave: string, tipoTeste: TipoTeste, aeronavesList: Aeronave[]): Teste {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

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

    public registrarResultado(codigoAeronave: string, tipoTeste: TipoTeste, resultado: ResultadoTeste, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

        const teste = aeronave.testes.find(t => t.tipo === tipoTeste && !t.resultado);
        if (!teste) {
            throw new Error(`Teste do tipo '${tipoTeste}' não encontrado ou já possui um resultado registado.`);
        }

        teste.registrarResultado(resultado);
    }
}