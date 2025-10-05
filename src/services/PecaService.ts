import { Aeronave } from '../models/Aeronave.js';
import { Peca } from '../models/Peca.js';
import { TipoPeca, StatusPeca } from '../enums/enums.js';

export interface CreatePecaDTO {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
    codigoAeronave: string;
}

export class PecaService {
    public create(data: CreatePecaDTO, aeronavesList: Aeronave[]): Peca {
        const aeronave = aeronavesList.find(a => a.codigo === data.codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada com o código fornecido.');

        const pecaJaExiste = aeronave.pecas.some(p => p.nome.toLowerCase() === data.nome.toLowerCase());
        if (pecaJaExiste) throw new Error(`A peça '${data.nome}' já existe nesta aeronave.`);

        const novaPeca = new Peca(data.nome, data.tipo, data.fornecedor);
        aeronave.adicionarPeca(novaPeca);
        return novaPeca;
    }

    public findByAeronave(codigoAeronave: string, aeronavesList: Aeronave[]): Peca[] {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada com o código fornecido.');
        return aeronave.pecas;
    }

    public updateStatus(codigoAeronave: string, nomePeca: string, novoStatus: StatusPeca, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada com o código fornecido.');

        const peca = aeronave.pecas.find(p => p.nome.toLowerCase() === nomePeca.toLowerCase());
        if (!peca) throw new Error(`Peça '${nomePeca}' não encontrada na aeronave '${codigoAeronave}'.`);

        peca.atualizarStatus(novoStatus);
    }
}