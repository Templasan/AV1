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
    capacidade?: number;
    alcance?: number;
}

export class AeronaveService {
    
    public create(data: CreateAeronaveDTO, aeronavesList: Aeronave[]): Aeronave {
        if (!data.codigo || !data.modelo) {
            throw new Error('Código e modelo são obrigatórios.');
        }
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

        aeronave.modelo = data.modelo ?? aeronave.modelo;
        aeronave.capacidade = data.capacidade ?? aeronave.capacidade;
        aeronave.alcance = data.alcance ?? aeronave.alcance;

        return aeronave;
    }

    public delete(codigo: string, aeronavesList: Aeronave[]): void {
        const index = aeronavesList.findIndex(a => a.codigo.toLowerCase() === codigo.toLowerCase());
        if (index === -1) {
            throw new Error('Aeronave não encontrada.');
        }
        
        aeronavesList.splice(index, 1);
    }
}