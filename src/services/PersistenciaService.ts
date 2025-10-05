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
        if (!fs.existsSync(this.dbDirectory)) fs.mkdirSync(this.dbDirectory, { recursive: true });

        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf-8');
    }

    loadCollection<T>(entity: Entity): T[] {
        const filePath = this.filePaths[entity];
        if (!fs.existsSync(filePath)) return [];
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(jsonData) as T[];
    }
}