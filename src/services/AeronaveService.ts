// src/services/AeronaveService.ts
import { Aeronave } from '../models/Aeronave.js';
import { TipoAeronave } from '../enums/enums.js';

// DTO para a criação de uma nova aeronave
export interface CreateAeronaveDTO {
    codigo: string;
    modelo: string;
    tipo: TipoAeronave;
    capacidade: number;
    alcance: number;
}

export class AeronaveService {
    
    /**
     * Cria uma nova aeronave, garantindo que o código é único.
     * @param data - Os dados da nova aeronave.
     * @param aeronavesList - A lista atual de aeronaves para validação.
     * @returns A aeronave recém-criada.
     * @throws Lança um erro se o código da aeronave já existir.
     */
    public create(data: CreateAeronaveDTO, aeronavesList: Aeronave[]): Aeronave {
        const codigoJaExiste = aeronavesList.some(a => a.codigo === data.codigo);
        if (codigoJaExiste) {
            throw new Error('Já existe uma aeronave com este código.');
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
}