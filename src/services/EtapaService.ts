// src/services/EtapaService.ts
import { Aeronave } from '../models/Aeronave.js';
import { Etapa } from '../models/Etapa.js';
import { Funcionario } from '../models/Funcionario.js';
import { StatusEtapa } from '../enums/enums.js';

export interface CreateEtapaDTO {
    nome: string;
    prazo: Date;
    codigoAeronave: string;
}

export class EtapaService {
    /**
     * Adiciona uma nova etapa de produção a uma aeronave.
     */
    public create(data: CreateEtapaDTO, aeronavesList: Aeronave[]): Etapa {
        const aeronave = aeronavesList.find(a => a.codigo === data.codigoAeronave);
        if (!aeronave) {
            throw new Error('Aeronave não encontrada.');
        }

        const etapaJaExiste = aeronave.etapas.some(e => e.nome.toLowerCase() === data.nome.toLowerCase());
        if (etapaJaExiste) {
            throw new Error(`A etapa '${data.nome}' já existe para esta aeronave.`);
        }

        const novaEtapa = new Etapa(data.nome, data.prazo);
        aeronave.adicionarEtapa(novaEtapa);

        return novaEtapa;
    }

    /**
     * Inicia uma etapa de produção, validando a ordem sequencial.
     */
    public iniciarEtapa(codigoAeronave: string, nomeEtapa: string, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const indiceEtapa = aeronave.etapas.findIndex(e => e.nome.toLowerCase() === nomeEtapa.toLowerCase());
        if (indiceEtapa === -1) throw new Error('Etapa não encontrada.');

        const etapa = aeronave.etapas[indiceEtapa];
        
        // CORREÇÃO: Adicionada verificação explícita para remover qualquer ambiguidade para o TypeScript.
        if (!etapa) {
            throw new Error('Erro inesperado: A etapa não foi encontrada no índice fornecido.');
        }

        if (etapa.status !== StatusEtapa.PENDENTE) {
            throw new Error(`A etapa '${etapa.nome}' já foi iniciada ou concluída.`);
        }

        // Validação da ordem: a etapa anterior (se existir) deve estar concluída.
        if (indiceEtapa > 0) {
            const etapaAnterior = aeronave.etapas[indiceEtapa - 1];
            if (etapaAnterior && etapaAnterior.status !== StatusEtapa.CONCLUIDA) {
                throw new Error(`Não é possível iniciar a etapa '${etapa.nome}' pois a etapa anterior ('${etapaAnterior.nome}') não foi concluída.`);
            }
        }

        etapa.iniciar();
    }

    /**
     * Finaliza uma etapa de produção.
     */
    public finalizarEtapa(codigoAeronave: string, nomeEtapa: string, aeronavesList: Aeronave[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const etapa = aeronave.etapas.find(e => e.nome.toLowerCase() === nomeEtapa.toLowerCase());
        
        if (!etapa) {
            throw new Error('Etapa não encontrada.');
        }

        if (etapa.status !== StatusEtapa.EM_ANDAMENTO) {
            throw new Error(`A etapa '${etapa.nome}' não pode ser finalizada pois não está em andamento.`);
        }

        etapa.finalizar();
    }

    /**
     * Associa um funcionário a uma etapa de produção.
     */
    public associarFuncionario(codigoAeronave: string, nomeEtapa: string, idFuncionario: string, aeronavesList: Aeronave[], funcionariosList: Funcionario[]): void {
        const aeronave = aeronavesList.find(a => a.codigo === codigoAeronave);
        if (!aeronave) throw new Error('Aeronave não encontrada.');

        const etapa = aeronave.etapas.find(e => e.nome.toLowerCase() === nomeEtapa.toLowerCase());

        if (!etapa) {
            throw new Error('Etapa não encontrada.');
        }

        const funcionario = funcionariosList.find(f => f.id === idFuncionario);
        if (!funcionario) throw new Error('Funcionário não encontrado.');

        etapa.associarFuncionario(funcionario);
    }
}