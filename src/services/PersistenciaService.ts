// src/services/PersistenciaService.ts

import * as fs from 'node:fs';
import * as path from 'node:path'; // Importamos o módulo 'path'

// Um tipo genérico para as nossas entidades, para sabermos o que esperar
type Entity = 'aeronaves' | 'funcionarios' | 'pecas' | 'etapas';

export class PersistenciaService {
    private readonly dbDirectory: string;
    private readonly filePaths: Record<Entity, string>;

    constructor() {
        // CORREÇÃO: Usamos path.resolve() para garantir que a pasta 'data' fique na raiz do projeto
        this.dbDirectory = path.resolve(process.cwd(), 'data');

        // Mapeia cada entidade para seu respectivo arquivo usando path.join para segurança
        this.filePaths = {
            aeronaves: path.join(this.dbDirectory, 'aeronaves.json'),
            funcionarios: path.join(this.dbDirectory, 'funcionarios.json'),
            pecas: path.join(this.dbDirectory, 'pecas.json'),
            etapas: path.join(this.dbDirectory, 'etapas.json'),
        };
    }

    // Método genérico para salvar uma coleção de dados (ex: todas as aeronaves)
    saveCollection(entity: Entity, data: any[]): void {
        const filePath = this.filePaths[entity];
        try {
            // Garante que o diretório de dados exista
            if (!fs.existsSync(this.dbDirectory)) {
                fs.mkdirSync(this.dbDirectory, { recursive: true });
            }

            const jsonData = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, jsonData, 'utf-8');
            console.log(`Coleção '${entity}' salva com sucesso em: ${filePath}`);
        } catch (error) {
            console.error(`Erro ao salvar a coleção '${entity}':`, error);
        }
    }

    // Método genérico para carregar uma coleção de dados
    loadCollection<T>(entity: Entity): T[] {
        const filePath = this.filePaths[entity];
        try {
            if (fs.existsSync(filePath)) {
                const jsonData = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(jsonData) as T[];
            }
        } catch (error) {
            console.error(`Erro ao carregar a coleção '${entity}':`, error);
        }

        // Se o arquivo não existir ou der erro, retorna uma lista vazia
        return [];
    }
}