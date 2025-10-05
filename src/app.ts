import { PersistenciaService } from './services/PersistenciaService.js';
import { FuncionarioService, type CreateFuncionarioDTO } from './services/FuncionarioService.js';
import { AeronaveService, type CreateAeronaveDTO, type UpdateAeronaveDTO } from './services/AeronaveService.js';
import { PecaService, type CreatePecaDTO } from './services/PecaService.js';
import { EtapaService, type CreateEtapaDTO } from './services/EtapaService.js';
import { TesteService, type AdicionarTesteOptions } from './services/TesteService.js';
import { RelatorioService } from './services/RelatorioService.js';

import { Aeronave } from './models/Aeronave.js';
import { Funcionario } from './models/Funcionario.js';
import { Peca } from './models/Peca.js';
import { Etapa } from './models/Etapa.js';
import { Teste } from './models/Teste.js';

import { TipoAeronave, TipoPeca, StatusPeca, TipoTeste, ResultadoTeste, NivelPermissao } from './enums/enums.js';
import { CliController } from './ui/CliController.js';

export interface IDatabase {
    aeronaves: Aeronave[];
    funcionarios: Funcionario[];
}

export class AerocodeApp {
    private persistenciaService: PersistenciaService;
    private funcionarioService: FuncionarioService;
    private aeronaveService: AeronaveService;
    private pecaService: PecaService;
    private etapaService: EtapaService;
    private testeService: TesteService;
    private relatorioService: RelatorioService;
    
    public database: IDatabase;
    public loggedInUser: Funcionario | null = null;
    
    private cli: CliController;

    constructor() {
        this.persistenciaService = new PersistenciaService();
        this.funcionarioService = new FuncionarioService();
        this.aeronaveService = new AeronaveService();
        this.pecaService = new PecaService();
        this.etapaService = new EtapaService();
        this.testeService = new TesteService();
        this.relatorioService = new RelatorioService();
        
        this.database = { aeronaves: [], funcionarios: [] };
        this.loadDatabase();

        this.cli = new CliController(this);
    }
    
    private loadDatabase(): void {
        const funcionariosData = this.persistenciaService.loadCollection<Funcionario>('funcionarios');
        this.database.funcionarios = funcionariosData.map(data => {
            const funcData = data as any;
            return new Funcionario(funcData.id, funcData.nome, funcData.telefone, funcData.endereco, funcData.usuario, funcData.senha, funcData.nivelPermissao);
        });

        const aeronavesData = this.persistenciaService.loadCollection<Aeronave>('aeronaves');
        this.database.aeronaves = aeronavesData.map(data => {
            const aeronave = new Aeronave(data.codigo, data.modelo, data.tipo, data.capacidade, data.alcance);
            
            aeronave.pecas = (data.pecas || []).map(pData => {
                const peca = new Peca(pData.nome, pData.tipo, pData.fornecedor);
                peca.status = pData.status;
                return peca;
            });
            
            aeronave.etapas = (data.etapas || []).map(eData => {
                const etapa = new Etapa(eData.nome, new Date(eData.prazo));
                etapa.status = eData.status;
                etapa.funcionarios = (eData.funcionarios || []).map((fData: any) => this.database.funcionarios.find(f => f.id === fData.id)).filter(f => f) as Funcionario[];
                return etapa;
            });
            
            aeronave.testes = (data.testes || []).map(tData => {
                const teste = new Teste(tData.tipo);
                if (tData.resultado !== undefined) {
                    teste.resultado = tData.resultado;
                }
                return teste;
            });

            return aeronave;
        });
    }

    // ===========================
    // BUSCAS SEGURAS
    // ===========================
    public findAeronaveByCodigo(codigo: string): Aeronave | null {
        const aeronave = this.database.aeronaves.find(a => a.codigo.toLowerCase() === codigo.toLowerCase());
        return aeronave || null;
    }

    public findFuncionarioById(id: string): Funcionario | null {
        const funcionario = this.database.funcionarios.find(f => f.id === id);
        return funcionario || null;
    }

    // ===========================
    // LISTAGENS SEGURAS
    // ===========================
    public listarEtapas(codigoAeronave: string): Etapa[] {
        const aeronave = this.findAeronaveByCodigo(codigoAeronave);
        return aeronave?.etapas || [];
    }

    public listarPecas(codigoAeronave: string): Peca[] {
        const aeronave = this.findAeronaveByCodigo(codigoAeronave);
        return aeronave?.pecas || [];
    }

    public listarTestes(codigoAeronave: string): Teste[] {
        const aeronave = this.findAeronaveByCodigo(codigoAeronave);
        return aeronave?.testes || [];
    }

    // ===========================
    // FUNCIONALIDADES
    // ===========================
    public start(): void {
        this.cli.start(); 
    }

    public saveAndExit(): void {
        this.persistenciaService.saveCollection('aeronaves', this.database.aeronaves);
        this.persistenciaService.saveCollection('funcionarios', this.database.funcionarios);
        console.log('\nDados salvos com sucesso. Aplicação encerrada.');
        this.cli.close();
        process.exit(0);
    }

    public login(usuario: string, senha: string): boolean {
        const user = this.funcionarioService.authenticate(usuario, senha, this.database.funcionarios);
        if (user) {
            this.loggedInUser = user;
            return true;
        }
        return false;
    }

    public logout(): void {
        this.loggedInUser = null;
    }

    public criarFuncionario(data: CreateFuncionarioDTO): void {
        this.funcionarioService.create(data, this.database.funcionarios);
    }

    public cadastrarAeronave(data: CreateAeronaveDTO): void {
        this.aeronaveService.create(data, this.database.aeronaves);
    }

    public editarAeronave(codigo: string, data: UpdateAeronaveDTO): void {
        this.aeronaveService.update(codigo, data, this.database.aeronaves);
    }

    public excluirAeronave(codigo: string): void {
        this.aeronaveService.delete(codigo, this.database.aeronaves);
    }

    public adicionarPeca(data: CreatePecaDTO): void {
        this.pecaService.create(data, this.database.aeronaves);
    }

    public atualizarStatusPeca(codigoAeronave: string, nomePeca: string, status: StatusPeca): void {
        this.pecaService.updateStatus(codigoAeronave, nomePeca, status, this.database.aeronaves);
    }

    public adicionarEtapa(data: CreateEtapaDTO): void {
        this.etapaService.create(data, this.database.aeronaves);
    }

    public iniciarEtapa(codigoAeronave: string, nomeEtapa: string): void {
        this.etapaService.iniciarEtapa(codigoAeronave, nomeEtapa, this.database.aeronaves);
    }

    public finalizarEtapa(codigoAeronave: string, nomeEtapa: string): void {
        this.etapaService.finalizarEtapa(codigoAeronave, nomeEtapa, this.database.aeronaves);
    }

    public associarFuncionarioAEtapa(codigoAeronave: string, nomeEtapa: string, idFuncionario: string): void {
        this.etapaService.associarFuncionario(codigoAeronave, nomeEtapa, idFuncionario, this.database.aeronaves, this.database.funcionarios);
    }

    public adicionarTeste(codigoAeronave: string, tipoTeste: TipoTeste, options?: AdicionarTesteOptions): void {
        this.testeService.adicionarTeste(codigoAeronave, tipoTeste, this.database.aeronaves, options);
    }

    public registrarResultadoTeste(codigoAeronave: string, tipoTeste: TipoTeste, resultado: ResultadoTeste): void {
        this.testeService.registrarResultado(codigoAeronave, tipoTeste, resultado, this.database.aeronaves);
    }

    public excluirTeste(codigoAeronave: string, tipoTeste: TipoTeste): void {
        this.testeService.deleteTeste(codigoAeronave, tipoTeste, this.database.aeronaves);
    }

    public gerarRelatorio(aeronave: Aeronave, cliente: string, dataEntrega: Date): void {
        this.relatorioService.generateAndSaveReport(aeronave, cliente, dataEntrega);
    }

    // ===========================
    // LISTAS COMPLETAS
    // ===========================
    public listarFuncionarios(): Funcionario[] {
        return this.database.funcionarios;
    }

    public listarAeronaves(): Aeronave[] {
        return this.database.aeronaves;
    }
}