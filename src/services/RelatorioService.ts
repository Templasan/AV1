import { Aeronave } from '../models/Aeronave.js';
import { Relatorio } from '../models/Relatorio.js';
import { StatusEtapa, ResultadoTeste } from '../enums/enums.js';

export class RelatorioService {
    public generateAndSaveReport(aeronave: Aeronave, cliente: string, dataEntrega: Date): void {
        const todasEtapasConcluidas = aeronave.etapas.every(etapa => etapa.status === StatusEtapa.CONCLUIDA);
        if (!todasEtapasConcluidas || aeronave.etapas.length === 0) {
            throw new Error('A aeronave não pode ser entregue. Nem todas as etapas de produção foram concluídas.');
        }

        const todosTestesAprovados = aeronave.testes.every(teste => teste.resultado === ResultadoTeste.APROVADO);
        if (!todosTestesAprovados || aeronave.testes.length === 0) {
            throw new Error('A aeronave não pode ser entregue. Nem todos os testes foram aprovados.');
        }

        const relatorio = new Relatorio();
        const conteudo = relatorio.gerar(aeronave, cliente, dataEntrega);
        const nomeArquivo = `Relatorio_${aeronave.codigo}_${new Date().toISOString().split('T')[0]}.txt`;
        
        relatorio.salvar(conteudo, nomeArquivo);
    }
}