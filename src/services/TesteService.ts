import { Aeronave } from '../models/Aeronave.js';
import { Teste } from '../models/Teste.js';
import { TipoTeste, ResultadoTeste } from '../enums/enums.js';

export interface AdicionarTesteOptions {
    permitirDuplicados?: boolean;
}

export class TesteService {
    public adicionarTeste(
        codigoAeronave: string,
        tipoTeste: TipoTeste,
        aeronavesList: Aeronave[],
        options: AdicionarTesteOptions = {}
    ): Teste {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const testeExistente = aeronave.testes.some(t => t.tipo === tipoTeste && !t.resultado);
        if (testeExistente && !options.permitirDuplicados) {
            throw new Error(`Um teste do tipo '${tipoTeste}' já existe para esta aeronave.`);
        }

        const novoTeste = new Teste(tipoTeste);
        aeronave.adicionarTeste(novoTeste);
        return novoTeste;
    }

    public registrarResultado(
        codigoAeronave: string,
        tipoTeste: TipoTeste,
        resultado: ResultadoTeste,
        aeronavesList: Aeronave[]
    ): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const teste = aeronave.testes.find(t => t.tipo === tipoTeste && !t.resultado);
        if (!teste) throw new Error(`Teste do tipo '${tipoTeste}' não encontrado ou já possui resultado registrado.`);

        teste.registrarResultado(resultado);
    }

    public deleteTeste(codigoAeronave: string, tipoTeste: TipoTeste, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const index = aeronave.testes.findIndex(t => t.tipo === tipoTeste);
        if (index === -1) throw new Error(`Teste do tipo '${tipoTeste}' não encontrado para esta aeronave.`);

        aeronave.testes.splice(index, 1);
    }

    public listarTestes(codigoAeronave: string, aeronavesList: Aeronave[]): Teste[] {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        return aeronave.testes;
    }
}