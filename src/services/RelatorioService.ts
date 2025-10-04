// src/services/RelatorioService.ts
import { Aeronave } from '../models/Aeronave.js';
import { Relatorio } from '../models/Relatorio.js';
import { StatusEtapa, ResultadoTeste } from '../enums/enums.js';

export class RelatorioService {
    
    /**
     * Gera e salva o relatório final de uma aeronave, após validar se ela está pronta para entrega.
     * @param aeronave - A aeronave para a qual o relatório será gerado.
     * @param cliente - O nome do cliente.
     * @param dataEntrega - A data de entrega da aeronave.
     * @throws Lança um erro se a aeronave não estiver pronta para entrega.
     */
    public generateAndSaveReport(aeronave: Aeronave, cliente: string, dataEntrega: Date): void {
        // Validação 1: Todas as etapas de produção devem estar concluídas.
        const todasEtapasConcluidas = aeronave.etapas.every(etapa => etapa.status === StatusEtapa.CONCLUIDA);
        if (!todasEtapasConcluidas || aeronave.etapas.length === 0) {
            throw new Error('A aeronave não pode ser entregue. Nem todas as etapas de produção foram concluídas.');
        }

        // Validação 2: Todos os testes devem ter sido aprovados.
        const todosTestesAprovados = aeronave.testes.every(teste => teste.resultado === ResultadoTeste.APROVADO);
        if (!todosTestesAprovados || aeronave.testes.length === 0) {
            throw new Error('A aeronave não pode ser entregue. Nem todos os testes foram aprovados.');
        }

        const relatorio = new Relatorio();
        const conteudo = relatorio.gerar(aeronave, cliente, dataEntrega);
        
        // Gera um nome de ficheiro único para o relatório
        const nomeArquivo = `Relatorio_${aeronave.codigo}_${new Date().toISOString().split('T')[0]}.txt`;
        
        relatorio.salvar(conteudo, nomeArquivo);
    }
}