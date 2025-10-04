// src/index.ts

import { PersistenciaService } from './services/PersistenciaService.js';
import { Aeronave } from './models/Aeronave.js';
import { Funcionario } from './models/Funcionario.js';
import { Peca } from './models/Peca.js';
import { Etapa } from './models/Etapa.js';
import { Teste } from './models/Teste.js';
import { NivelPermissao, TipoAeronave, TipoPeca, StatusPeca, TipoTeste, ResultadoTeste } from './enums/enums.js';
import { FuncionarioService } from './services/FuncionarioService.js';
import { AeronaveService } from './services/AeronaveService.js';
import { PecaService } from './services/PecaService.js';
import { EtapaService } from './services/EtapaService.js';
import { TesteService } from './services/TesteService.js';
import { RelatorioService } from './services/RelatorioService.js';
import * as readline from 'node:readline';

interface IDatabase {
    aeronaves: Aeronave[];
    funcionarios: Funcionario[];
}

class AerocodeApp {
    private persistenciaService: PersistenciaService;
    private funcionarioService: FuncionarioService;
    private aeronaveService: AeronaveService;
    private pecaService: PecaService;
    private etapaService: EtapaService;
    private testeService: TesteService;
    private relatorioService: RelatorioService;
    private database: IDatabase;
    private rl: readline.Interface;
    private loggedInUser: Funcionario | null = null;

    constructor() {
        this.persistenciaService = new PersistenciaService();
        this.funcionarioService = new FuncionarioService();
        this.aeronaveService = new AeronaveService();
        this.pecaService = new PecaService();
        this.etapaService = new EtapaService();
        this.testeService = new TesteService();
        this.relatorioService = new RelatorioService();
        
        this.database = { aeronaves: [], funcionarios: [] };
        
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        
        this.loadDatabase();
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

    public start(): void {
        console.clear();
        console.log('========================================');
        console.log('  Bem-vindo ao Sistema de Gestão Aerocode ');
        console.log('========================================');
        this.showMainMenu();
    }

    // --- MENUS ---
    private showMainMenu(): void {
        console.log('\n--- Menu Principal ---');
        console.log('1. Fazer Login');
        console.log('2. Cadastrar Novo Funcionário');
        console.log('3. Sair');
        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleLogin(); break;
                case '2': this.handleCadastroFuncionario(); break;
                case '3': this.saveAndExit(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.showMainMenu();
                    break;
            }
        });
    }
    
    private showAuthenticatedMenu(): void {
        console.log(`\n--- Painel Principal (Logado como: ${this.loggedInUser?.nome} | ${this.loggedInUser?.nivelPermissao}) ---`);
        console.log('1. Gerir Aeronaves');
        console.log('2. Gerir Peças');
        console.log('3. Gerir Etapas de Produção');
        console.log('4. Gerir Testes');
        console.log('5. Gerar Relatório Final');
        console.log('6. Logout');

        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleGerirAeronaves(); break;
                case '2': this.handleGerirPecas(); break;
                case '3': this.handleGerirEtapas(); break;
                case '4': this.handleGerirTestes(); break;
                case '5': this.handleGerarRelatorio(); break;
                case '6': this.handleLogout(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.showAuthenticatedMenu();
                    break;
            }
        });
    }

    // --- LÓGICA E HANDLERS ---

    private handleGerarRelatorio(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            console.log('\n[ERRO] Acesso negado. Apenas Administradores podem gerar relatórios.');
            this.showAuthenticatedMenu();
            return;
        }

        console.log('\n--- Gerar Relatório Final de Entrega ---');
        this.rl.question('Código da Aeronave a ser entregue: ', codigoAeronave => {
            const aeronave = this.database.aeronaves.find(a => a.codigo === codigoAeronave);
            if (!aeronave) {
                console.log('\n[ERRO] Aeronave não encontrada.');
                this.showAuthenticatedMenu();
                return;
            }

            this.rl.question('Nome do Cliente: ', cliente => {
                this.rl.question('Data de Entrega (AAAA-MM-DD): ', dataStr => {
                    const dataEntrega = new Date(dataStr);
                    if (isNaN(dataEntrega.getTime())) {
                        console.log('\n[ERRO] Formato de data inválido.');
                        this.showAuthenticatedMenu();
                        return;
                    }

                    try {
                        this.relatorioService.generateAndSaveReport(aeronave, cliente, dataEntrega);
                        console.log(`\n[SUCESSO] Relatório para a aeronave '${aeronave.modelo}' gerado com sucesso!`);
                    } catch (error: any) {
                        console.log(`\n[ERRO] Não foi possível gerar o relatório: ${error.message}`);
                    } finally {
                        this.showAuthenticatedMenu();
                    }
                });
            });
        });
    }

    private handleGerirTestes(): void {
        console.log('\n--- Gestão de Testes ---');
        console.log('1. Adicionar Novo Teste a uma Aeronave');
        console.log('2. Registar Resultado de um Teste');
        console.log('3. Voltar ao Painel Principal');

        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleAdicionarTeste(); break;
                case '2': this.handleRegistarResultadoTeste(); break;
                case '3': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirTestes();
                    break;
            }
        });
    }

    private handleAdicionarTeste(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado. Apenas Engenheiros podem adicionar testes.');
            this.handleGerirTestes();
            return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
            console.log('Tipos de Teste: 1. Elétrico | 2. Hidráulico | 3. Aerodinâmico');
            this.rl.question('Escolha o tipo de teste (1-3): ', tipoOpcao => {
                let tipoTeste: TipoTeste;
                switch (tipoOpcao.trim()) {
                    case '1': tipoTeste = TipoTeste.ELETRICO; break;
                    case '2': tipoTeste = TipoTeste.HIDRAULICO; break;
                    case '3': tipoTeste = TipoTeste.AERODINAMICO; break;
                    default:
                        console.log('\n[ERRO] Tipo de teste inválido.');
                        this.handleGerirTestes();
                        return;
                }
                try {
                    this.testeService.adicionarTeste(codigoAeronave, tipoTeste, this.database.aeronaves);
                    console.log(`\n[SUCESSO] Teste do tipo '${tipoTeste}' adicionado à aeronave '${codigoAeronave}'.`);
                } catch (error: any) {
                    console.log(`\n[ERRO] ${error.message}`);
                } finally {
                    this.handleGerirTestes();
                }
            });
        });
    }

    private handleRegistarResultadoTeste(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado. Apenas Engenheiros podem registar resultados de testes.');
            this.handleGerirTestes();
            return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
            console.log('Tipos de Teste: 1. Elétrico | 2. Hidráulico | 3. Aerodinâmico');
            this.rl.question('Escolha o tipo de teste (1-3): ', tipoOpcao => {
                let tipoTeste: TipoTeste;
                switch (tipoOpcao.trim()) {
                    case '1': tipoTeste = TipoTeste.ELETRICO; break;
                    case '2': tipoTeste = TipoTeste.HIDRAULICO; break;
                    case '3': tipoTeste = TipoTeste.AERODINAMICO; break;
                    default:
                        console.log('\n[ERRO] Tipo de teste inválido.');
                        this.handleGerirTestes();
                        return;
                }
                console.log('Resultados: 1. Aprovado | 2. Reprovado');
                this.rl.question('Escolha o resultado (1-2): ', resultadoOpcao => {
                    const resultado = resultadoOpcao.trim() === '1' ? ResultadoTeste.APROVADO : ResultadoTeste.REPROVADO;
                    try {
                        this.testeService.registrarResultado(codigoAeronave, tipoTeste, resultado, this.database.aeronaves);
                        console.log(`\n[SUCESSO] Resultado do teste '${tipoTeste}' registado como '${resultado}' para a aeronave '${codigoAeronave}'.`);
                    } catch (error: any) {
                        console.log(`\n[ERRO] ${error.message}`);
                    } finally {
                        this.handleGerirTestes();
                    }
                });
            });
        });
    }

    private handleLogin(): void {
        console.log('\n--- Autenticação ---');
        this.rl.question('Utilizador: ', usuario => {
            this.rl.question('Senha: ', senha => {
                const user = this.funcionarioService.authenticate(usuario, senha, this.database.funcionarios);
                if (user) {
                    this.loggedInUser = user;
                    console.log(`\n[SUCESSO] Bem-vindo, ${this.loggedInUser.nome}!`);
                    this.showAuthenticatedMenu();
                } else {
                    console.log('\n[ERRO] Utilizador ou senha inválidos.');
                    this.showMainMenu();
                }
            });
        });
    }

    private handleLogout(): void {
        console.log(`\nAté logo, ${this.loggedInUser?.nome}!`);
        this.loggedInUser = null;
        this.showMainMenu();
    }

    private handleGerirAeronaves(): void {
        console.log('\n--- Gestão de Aeronaves ---');
        console.log('1. Cadastrar Nova Aeronave');
        console.log('2. Listar Todas as Aeronaves');
        console.log('3. Voltar ao Painel Principal');
        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleCadastroAeronave(); break;
                case '2': this.handleListarAeronaves(); break;
                case '3': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirAeronaves();
                    break;
            }
        });
    }

    private handleCadastroAeronave(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR && this.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado. Apenas Administradores e Engenheiros podem cadastrar aeronaves.');
            this.handleGerirAeronaves();
            return;
        }
        this.rl.question('Código (ex: FAB001): ', codigo => {
        this.rl.question('Modelo (ex: E195-E2): ', modelo => {
        console.log('Tipos: 1. Comercial | 2. Militar');
        this.rl.question('Escolha o tipo (1-2): ', tipoOpcao => {
            const tipo = tipoOpcao.trim() === '1' ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;
            this.rl.question('Capacidade de passageiros: ', capacidadeStr => {
            this.rl.question('Alcance (km): ', alcanceStr => {
                try {
                    this.aeronaveService.create({ codigo, modelo, tipo, capacidade: parseInt(capacidadeStr), alcance: parseInt(alcanceStr) }, this.database.aeronaves);
                    console.log(`\n[SUCESSO] Aeronave modelo '${modelo}' cadastrada com sucesso!`);
                } catch (error: any) {
                    console.log(`\n[ERRO] ${error.message}`);
                } finally {
                    this.handleGerirAeronaves();
                }
            });});});});});
    }

    private handleListarAeronaves(): void {
        console.log('\n--- Lista de Aeronaves Cadastradas ---');
        if (this.database.aeronaves.length === 0) {
            console.log('Nenhuma aeronave cadastrada no sistema.');
        } else {
            this.database.aeronaves.forEach(aeronave => aeronave.exibirDetalhes());
        }
        this.handleGerirAeronaves();
    }
    
    private handleGerirPecas(): void {
        console.log('\n--- Gestão de Peças ---');
        console.log('1. Adicionar Nova Peça a uma Aeronave');
        console.log('2. Listar Peças de uma Aeronave');
        console.log('3. Atualizar Status de uma Peça');
        console.log('4. Voltar ao Painel Principal');
        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleAdicionarPeca(); break;
                case '2': this.handleListarPecas(); break;
                case '3': this.handleAtualizarStatusPeca(); break;
                case '4': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirPecas();
                    break;
            }
        });
    }

    private handleAdicionarPeca(): void {
        if (this.loggedInUser?.nivelPermissao === NivelPermissao.OPERADOR) {
            console.log('\n[ERRO] Acesso negado. Operadores não podem adicionar peças.');
            this.handleGerirPecas();
            return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Peça: ', nomePeca => {
        console.log('Tipos: 1. Nacional | 2. Importada');
        this.rl.question('Escolha o tipo da peça (1-2): ', tipoOpcao => {
            const tipo = tipoOpcao.trim() === '1' ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;
            this.rl.question('Fornecedor: ', fornecedor => {
                try {
                    this.pecaService.create({ nome: nomePeca, tipo, fornecedor, codigoAeronave }, this.database.aeronaves);
                    console.log(`\n[SUCESSO] Peça '${nomePeca}' adicionada à aeronave '${codigoAeronave}'.`);
                } catch (error: any) {
                    console.log(`\n[ERRO] ${error.message}`);
                } finally {
                    this.handleGerirPecas();
                }
            });});});});
    }

    private handleListarPecas(): void {
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
            try {
                const pecas = this.pecaService.findByAeronave(codigoAeronave, this.database.aeronaves);
                if (pecas.length === 0) {
                    console.log(`\nNenhuma peça encontrada para a aeronave '${codigoAeronave}'.`);
                } else {
                    console.log(`\nPeças da Aeronave '${codigoAeronave}':`);
                    pecas.forEach(p => console.log(`- ${p.nome} (Fornecedor: ${p.fornecedor}, Status: ${p.status})`));
                }
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirPecas();
            }
        });
    }

    private handleAtualizarStatusPeca(): void {
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
            const aeronave = this.database.aeronaves.find(a => a.codigo.toLowerCase() === codigoAeronave.trim().toLowerCase());
            if (!aeronave) {
                console.log('\n[ERRO] Aeronave não encontrada.');
                this.handleGerirPecas();
                return;
            }
            if (aeronave.pecas.length === 0) {
                console.log(`\n[INFO] A aeronave '${aeronave.modelo}' não possui peças para atualizar.`);
                this.handleGerirPecas();
                return;
            }
            console.log(`\n--- Peças da Aeronave ${aeronave.modelo} ---`);
            aeronave.pecas.forEach((peca, index) => console.log(`${index + 1}. ${peca.nome} (Status atual: ${peca.status})`));
            this.rl.question('Escolha o número da peça que deseja atualizar: ', pecaIndexStr => {
                const pecaIndex = parseInt(pecaIndexStr.trim()) - 1;
                const peca = aeronave.pecas[pecaIndex];
                if (!peca) {
                    console.log('\n[ERRO] Número da peça inválido.');
                    this.handleGerirPecas();
                    return;
                }
                console.log('Status Disponíveis: 1. Em Produção | 2. Em Transporte | 3. Pronta');
                this.rl.question(`Escolha o novo status para '${peca.nome}' (1-3): `, statusOpcao => {
                    let novoStatus: StatusPeca;
                    switch (statusOpcao.trim()) {
                        case '1': novoStatus = StatusPeca.EM_PRODUCAO; break;
                        case '2': novoStatus = StatusPeca.EM_TRANSPORTE; break;
                        case '3': novoStatus = StatusPeca.PRONTA; break;
                        default:
                            console.log('\n[ERRO] Opção de status inválida.');
                            this.handleGerirPecas();
                            return;
                    }
                    try {
                        this.pecaService.updateStatus(aeronave.codigo, peca.nome, novoStatus, this.database.aeronaves);
                        console.log(`\n[SUCESSO] Status da peça '${peca.nome}' atualizado para '${novoStatus}'.`);
                    } catch (error: any) {
                        console.log(`\n[ERRO] ${error.message}`);
                    } finally {
                        this.handleGerirPecas();
                    }
                });
            });
        });
    }
    
    private handleGerirEtapas(): void {
        console.log('\n--- Gestão de Etapas de Produção ---');
        console.log('1. Adicionar Nova Etapa a uma Aeronave');
        console.log('2. Iniciar Etapa');
        console.log('3. Finalizar Etapa');
        console.log('4. Associar Funcionário a uma Etapa');
        console.log('5. Listar Etapas de uma Aeronave');
        console.log('6. Voltar ao Painel Principal');
        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleAdicionarEtapa(); break;
                case '2': this.handleIniciarEtapa(); break;
                case '3': this.handleFinalizarEtapa(); break;
                case '4': this.handleAssociarFuncionario(); break;
                case '5': this.handleListarEtapas(); break;
                case '6': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirEtapas();
                    break;
            }
        });
    }

    private handleAdicionarEtapa(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado. Apenas Engenheiros podem adicionar etapas.');
            this.handleGerirEtapas(); return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa: ', nomeEtapa => {
        this.rl.question('Prazo (AAAA-MM-DD): ', prazoStr => {
            try {
                const prazo = new Date(prazoStr);
                if (isNaN(prazo.getTime())) throw new Error('Formato de data inválido.');
                this.etapaService.create({ nome: nomeEtapa, prazo, codigoAeronave }, this.database.aeronaves);
                console.log(`\n[SUCESSO] Etapa '${nomeEtapa}' adicionada à aeronave '${codigoAeronave}'.`);
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirEtapas();
            }
        });});});
    }

    private handleIniciarEtapa(): void {
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa a iniciar: ', nomeEtapa => {
            try {
                this.etapaService.iniciarEtapa(codigoAeronave, nomeEtapa, this.database.aeronaves);
                console.log(`\n[SUCESSO] Etapa '${nomeEtapa}' iniciada.`);
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirEtapas();
            }
        });});
    }

    private handleFinalizarEtapa(): void {
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa a finalizar: ', nomeEtapa => {
            try {
                this.etapaService.finalizarEtapa(codigoAeronave, nomeEtapa, this.database.aeronaves);
                console.log(`\n[SUCESSO] Etapa '${nomeEtapa}' finalizada.`);
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirEtapas();
            }
        });});
    }

    private handleAssociarFuncionario(): void {
        if (this.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR && this.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado.');
            this.handleGerirEtapas(); return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa: ', nomeEtapa => {
        this.rl.question('ID do Funcionário a ser associado: ', idFuncionario => {
            try {
                this.etapaService.associarFuncionario(codigoAeronave, nomeEtapa, idFuncionario, this.database.aeronaves, this.database.funcionarios);
                console.log(`\n[SUCESSO] Funcionário associado com sucesso.`);
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirEtapas();
            }
        });});});
    }
    
    private handleListarEtapas(): void {
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
            const aeronave = this.database.aeronaves.find(a => a.codigo === codigoAeronave);
            if (!aeronave) {
                console.log('\n[ERRO] Aeronave não encontrada.');
            } else if (aeronave.etapas.length === 0) {
                console.log(`\nNenhuma etapa encontrada para a aeronave '${codigoAeronave}'.`);
            } else {
                console.log(`\nEtapas da Aeronave '${codigoAeronave}':`);
                aeronave.etapas.forEach(e => {
                    console.log(`- ${e.nome} (Prazo: ${e.prazo.toLocaleDateString('pt-BR')}, Status: ${e.status}, Funcionários: ${e.funcionarios.length})`);
                });
            }
            this.handleGerirEtapas();
        });
    }

    private handleCadastroFuncionario(): void {
        console.log('\n--- Cadastro de Novo Funcionário ---');
        this.rl.question('Nome completo: ', nome => {
        this.rl.question('Telefone: ', telefone => {
        this.rl.question('Endereço: ', endereco => {
        this.rl.question('Nome de utilizador (login): ', usuario => {
        this.rl.question('Senha: ', senha => {
            console.log('Níveis de Permissão: 1. Administrador | 2. Engenheiro | 3. Operador');
            this.rl.question('Escolha o nível de permissão (1-3): ', nivelOpcao => {
                let nivel: NivelPermissao;
                switch (nivelOpcao.trim()) {
                    case '1': nivel = NivelPermissao.ADMINISTRADOR; break;
                    case '2': nivel = NivelPermissao.ENGENHEIRO; break;
                    case '3': nivel = NivelPermissao.OPERADOR; break;
                    default:
                        console.log('\n[ERRO] Nível de permissão inválido.');
                        this.showMainMenu();
                        return;
                }
                try {
                    this.funcionarioService.create( { nome, telefone, endereco, usuario, senha, nivel }, this.database.funcionarios );
                    console.log(`\n[SUCESSO] Funcionário '${nome}' cadastrado com sucesso!`);
                } catch (error: any) {
                    console.log(`\n[ERRO] ${error.message}`);
                } finally {
                    this.showMainMenu();
                }
            });});});});});
        });
    }

    private saveAndExit(): void {
        this.persistenciaService.saveCollection('aeronaves', this.database.aeronaves);
        this.persistenciaService.saveCollection('funcionarios', this.database.funcionarios);
        console.log('\nDados salvos com sucesso. Aplicação encerrada.');
        this.rl.close();
        process.exit(0);
    }
}

const app = new AerocodeApp();
app.start();