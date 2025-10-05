import { Aeronave } from '../models/Aeronave.js';
import { Relatorio } from '../models/Relatorio.js';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export class RelatorioService {
    public generateAndSaveReport(aeronave: Aeronave, cliente: string, dataEntrega: Date): void {
        const todasEtapasConcluidas = aeronave.etapas.length > 0 &&
            aeronave.etapas.every(etapa => etapa.status.toUpperCase() === 'CONCLUIDA');

        if (!todasEtapasConcluidas) {
            throw new Error('A aeronave não pode ser entregue. Nem todas as etapas de produção foram concluídas.');
        }

        const todosTestesAprovados = aeronave.testes.length > 0 &&
            aeronave.testes.every(teste => teste.resultado?.toUpperCase() === 'APROVADO');

        if (!todosTestesAprovados) {
            throw new Error('A aeronave não pode ser entregue. Nem todos os testes foram aprovados.');
        }

        const relatorio = new Relatorio();
        const conteudo = relatorio.gerar(aeronave, cliente, dataEntrega);

        const relatorioDir = join('data', 'Relatorios');
        if (!existsSync(relatorioDir)) mkdirSync(relatorioDir, { recursive: true });

        const nomeArquivo = join(relatorioDir, `Relatorio_${aeronave.codigo}_${new Date().toISOString().split('T')[0]}.txt`);

        relatorio.salvar(conteudo, nomeArquivo);
    }
}