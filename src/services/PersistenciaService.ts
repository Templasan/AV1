import * as fs from 'node:fs';
import * as path from 'node:path';

type Entity = 'aeronaves' | 'funcionarios' | 'pecas' | 'etapas';

export class PersistenciaService {
    private readonly dbDirectory: string;
    private readonly filePaths: Record<Entity, string>;

    constructor() {
        this.dbDirectory = path.resolve(process.cwd(), 'data');

        this.filePaths = {
            aeronaves: path.join(this.dbDirectory, 'aeronaves.json'),
            funcionarios: path.join(this.dbDirectory, 'funcionarios.json'),
            pecas: path.join(this.dbDirectory, 'pecas.json'),
            etapas: path.join(this.dbDirectory, 'etapas.json'),
        };
    }

    saveCollection(entity: Entity, data: any[]): void {
        const filePath = this.filePaths[entity];
        try {
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
        return [];
    }
}