import { Aeronave } from "./Aeronave.js";
import * as fs from 'node:fs';

export class Relatorio {
    public gerar(aeronave: Aeronave, cliente: string, dataEntrega: Date): string {
        let conteudo = `RELATÓRIO FINAL DE ENTREGA - AEROCODE\n`;
        conteudo += `=========================================\n`;
        conteudo += `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}\n`;
        conteudo += `Cliente: ${cliente}\n`;
        conteudo += `Data de Entrega: ${dataEntrega.toLocaleDateString('pt-BR')}\n\n`;

        conteudo += `DADOS DA AERONAVE\n`;
        conteudo += `-----------------\n`;
        conteudo += `Código: ${aeronave.codigo}\n`;
        conteudo += `Modelo: ${aeronave.modelo}\n`;
        conteudo += `Tipo: ${aeronave.tipo}\n`;
        conteudo += `Capacidade: ${aeronave.capacidade} passageiros\n\n`;

        conteudo += `PEÇAS UTILIZADAS\n`;
        conteudo += `----------------\n`;
        aeronave.pecas.forEach(p => {
            conteudo += `- ${p.nome} (Fornecedor: ${p.fornecedor}, Tipo: ${p.tipo})\n`;
        });
        
        conteudo += `\nETAPAS DE PRODUÇÃO CONCLUÍDAS\n`;
        conteudo += `-----------------------------\n`;
        aeronave.etapas.forEach(e => {
            conteudo += `- ${e.nome} (Status: ${e.status})\n`;
        });
        
        conteudo += `\nRESULTADOS DOS TESTES\n`;
        conteudo += `---------------------\n`;
        aeronave.testes.forEach(t => {
            conteudo += `- Tipo: ${t.tipo}, Resultado: ${t.resultado}\n`;
        });
        
        conteudo += `\n=========================================\n`;
        conteudo += `Aeronave Aprovada para Entrega.\n`;

        return conteudo;
    }

    public salvar(conteudo: string, nomeArquivo: string): void {
        try {
            fs.writeFileSync(nomeArquivo, conteudo, 'utf-8');
            console.log(`Relatório salvo com sucesso em: ${nomeArquivo}`);
        } catch (error) {
            console.error("Erro ao salvar o relatório:", error);
        }
    }
}