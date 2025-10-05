import { Aeronave } from '../models/Aeronave.js';
import { TipoAeronave } from '../enums/enums.js';

export interface CreateAeronaveDTO {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
}

export interface UpdateAeronaveDTO {
    modelo?: string;
    tipo?: TipoAeronave;
    capacidade?: number;
    alcance?: number;
}

export class AeronaveService {

    public create(data: CreateAeronaveDTO, aeronavesList: Aeronave[]): Aeronave {
        if (!data.codigo || !data.modelo) {
            throw new Error('Código e modelo são obrigatórios.');
        }


        if (!Object.values(TipoAeronave).includes(data.tipo)) {
            throw new Error(`Tipo de aeronave inválido: ${data.tipo}`);
        }

        if (data.capacidade <= 0) throw new Error('Capacidade deve ser maior que 0.');
        if (data.alcance <= 0) throw new Error('Alcance deve ser maior que 0.');

        const codigoJaExiste = aeronavesList.some(a => a.codigo.toLowerCase() === data.codigo.toLowerCase());
        if (codigoJaExiste) {
            throw new Error(`O código de aeronave '${data.codigo}' já está em uso.`);
        }

        const novaAeronave = new Aeronave(
            data.codigo,
            data.modelo,
            data.tipo,
            data.capacidade,
            data.alcance
        );

        aeronavesList.push(novaAeronave);
        return novaAeronave;
    }

    public update(codigo: string, data: UpdateAeronaveDTO, aeronavesList: Aeronave[]): Aeronave {
        const aeronave = aeronavesList.find(a => a.codigo.toLowerCase() === codigo.toLowerCase());
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

        if (data.tipo !== undefined && !Object.values(TipoAeronave).includes(data.tipo)) {
            throw new Error(`Tipo de aeronave inválido: ${data.tipo}`);
        }

        if (data.capacidade !== undefined && data.capacidade <= 0) {
            throw new Error('Capacidade deve ser maior que 0.');
        }

        if (data.alcance !== undefined && data.alcance <= 0) {
            throw new Error('Alcance deve ser maior que 0.');
        }

        aeronave.modelo = data.modelo ?? aeronave.modelo;
        aeronave.tipo = data.tipo ?? aeronave.tipo;
        aeronave.capacidade = data.capacidade ?? aeronave.capacidade;
        aeronave.alcance = data.alcance ?? aeronave.alcance;

        return aeronave;
    }

    public delete(codigo: string, aeronavesList: Aeronave[]): void {
        const index = aeronavesList.findIndex(a => a.codigo.toLowerCase() === codigo.toLowerCase());
        if (index === -1) {
            throw new Error('Aeronave não encontrada.');
        }

        const aeronave = aeronavesList[index];

        if ((aeronave.pecas && aeronave.pecas.length > 0) ||
            (aeronave.etapas && aeronave.etapas.length > 0) ||
            (aeronave.testes && aeronave.testes.length > 0)) {
            throw new Error(
                'Não é possível excluir a aeronave enquanto houver peças, etapas ou testes associados.'
            );
        }

        aeronavesList.splice(index, 1);
    }
}