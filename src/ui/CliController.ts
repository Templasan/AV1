import * as readline from 'node:readline';
import { AerocodeApp } from '../app.js'; // Assumindo que a classe principal agora está em 'app.ts'
import { NivelPermissao, TipoAeronave, TipoPeca, StatusPeca, TipoTeste, ResultadoTeste } from '../enums/enums.js';
import type { UpdateAeronaveDTO } from '../services/AeronaveService.js';


export class CliController {
    private app: AerocodeApp;
    private rl: readline.Interface;

    constructor(app: AerocodeApp) {
        this.app = app;
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }

    public start(): void {
        console.clear();
        console.log('========================================');
        console.log('  Bem-vindo ao Sistema de Gestão Aerocode ');
        console.log('========================================');
        this.showMainMenu();
    }
    
    public close(): void {
        this.rl.close();
    }

    // --- MENUS ---
    private showMainMenu(): void {
        const hasAdmin = this.app.database.funcionarios.some(f => f.nivelPermissao === NivelPermissao.ADMINISTRADOR);

        console.log('\n--- Menu Principal ---');
        
        if (hasAdmin) {
            console.log('1. Fazer Login');
        } else {
            console.log('1. Cadastrar Primeiro Administrador');
        }
        
        console.log('2. Sair');

        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1':
                    if (hasAdmin) {
                        this.handleLogin();
                    } else {
                        this.handleCadastroFuncionario(true); // 'true' para forçar a criação de um admin
                    }
                    break;
                case '2':
                    this.app.saveAndExit();
                    break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.showMainMenu();
                    break;
            }
        });
    }
    
    private showAuthenticatedMenu(): void {
        console.log(`\n--- Painel Principal (Logado como: ${this.app.loggedInUser?.nome} | ${this.app.loggedInUser?.nivelPermissao}) ---`);
        console.log('1. Gerir Aeronaves');
        console.log('2. Gerir Peças');
        console.log('3. Gerir Etapas de Produção');
        console.log('4. Gerir Testes');
        console.log('5. Gerir Funcionários');
        console.log('6. Gerar Relatório Final');
        console.log('7. Logout');

        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleGerirAeronaves(); break;
                case '2': this.handleGerirPecas(); break;
                case '3': this.handleGerirEtapas(); break;
                case '4': this.handleGerirTestes(); break;
                case '5': this.handleGerirFuncionarios(); break;
                case '6': this.handleGerarRelatorio(); break;
                case '7': this.handleLogout(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.showAuthenticatedMenu();
                    break;
            }
        });
    }

    // --- HANDLERS DE AUTENTICAÇÃO E USUÁRIO ---

    private handleLogin(): void {
        console.log('\n--- Autenticação ---');
        this.rl.question('Utilizador: ', usuario => {
            this.rl.question('Senha: ', senha => {
                const success = this.app.login(usuario, senha);
                if (success) {
                    console.log(`\n[SUCESSO] Bem-vindo, ${this.app.loggedInUser!.nome}!`);
                    this.showAuthenticatedMenu();
                } else {
                    console.log('\n[ERRO] Utilizador ou senha inválidos.');
                    this.showMainMenu();
                }
            });
        });
    }

    private handleLogout(): void {
        console.log(`\nAté logo, ${this.app.loggedInUser?.nome}!`);
        this.app.logout();
        this.showMainMenu();
    }

    // --- HANDLERS DE FUNCIONÁRIOS ---

    private handleGerirFuncionarios(): void {
        console.log('\n--- Gestão de Funcionários ---');
        console.log('1. Listar Todos os Funcionários');
        
        if (this.app.loggedInUser?.nivelPermissao === NivelPermissao.ADMINISTRADOR) {
            console.log('2. Cadastrar Novo Funcionário');
        }
        
        console.log('3. Voltar ao Painel Principal');

        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleListarFuncionarios(); break;
                case '2':
                    if (this.app.loggedInUser?.nivelPermissao === NivelPermissao.ADMINISTRADOR) {
                        this.handleCadastroFuncionario(false);
                    } else {
                        console.log('\n[ERRO] Opção inválida!');
                        this.handleGerirFuncionarios();
                    }
                    break;
                case '3': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirFuncionarios();
                    break;
            }
        });
    }

    private handleCadastroFuncionario(isFirstAdmin: boolean): void {
        const title = isFirstAdmin ? '--- Cadastro do Primeiro Administrador ---' : '--- Cadastro de Novo Funcionário ---';
        console.log(`\n${title}`);

        this.rl.question('Nome completo: ', nome => {
        this.rl.question('Telefone: ', telefone => {
        this.rl.question('Endereço: ', endereco => {
        this.rl.question('Nome de utilizador (login): ', usuario => {
        this.rl.question('Senha: ', senha => {
            if (isFirstAdmin) {
                this.criarFuncionario(nome, telefone, endereco, usuario, senha, NivelPermissao.ADMINISTRADOR, isFirstAdmin);
            } else {
                console.log('Níveis de Permissão: 1. Administrador | 2. Engenheiro | 3. Operador');
                this.rl.question('Escolha o nível de permissão (1-3): ', nivelOpcao => {
                    let nivel: NivelPermissao;
                    switch (nivelOpcao.trim()) {
                        case '1': nivel = NivelPermissao.ADMINISTRADOR; break;
                        case '2': nivel = NivelPermissao.ENGENHEIRO; break;
                        case '3': nivel = NivelPermissao.OPERADOR; break;
                        default:
                            console.log('\n[ERRO] Nível de permissão inválido.');
                            isFirstAdmin ? this.showMainMenu() : this.handleGerirFuncionarios();
                            return;
                    }
                    this.criarFuncionario(nome, telefone, endereco, usuario, senha, nivel, isFirstAdmin);
                });
            }
        });});});});});
    }

    private criarFuncionario(nome: string, telefone: string, endereco: string, usuario: string, senha: string, nivel: NivelPermissao, isFirstAdmin: boolean): void {
        try {
            // Delega a lógica de criação para a classe principal da aplicação
            this.app.criarFuncionario({ nome, telefone, endereco, usuario, senha, nivel });
            console.log(`\n[SUCESSO] Funcionário '${nome}' (${nivel}) cadastrado com sucesso!`);
        } catch (error: any) {
            console.log(`\n[ERRO] ${error.message}`);
        } finally {
            isFirstAdmin ? this.showMainMenu() : this.handleGerirFuncionarios();
        }
    }

    private handleListarFuncionarios(): void {
        console.log('\n--- Lista de Funcionários Cadastrados ---');
        const funcionarios = this.app.database.funcionarios;
        if (funcionarios.length === 0) {
            console.log('Nenhum funcionário cadastrado no sistema.');
        } else {
            funcionarios.forEach(func => {
                console.log(`- ID: ${func.id}`);
                console.log(`  Nome: ${func.nome}`);
                console.log(`  Utilizador: ${func.usuario}`);
                console.log(`  Permissão: ${func.nivelPermissao}\n`);
            });
        }
        this.handleGerirFuncionarios();
    }

    // --- HANDLERS DE AERONAVES ---
    private handleGerirAeronaves(): void {
        console.log('\n--- Gestão de Aeronaves ---');
        console.log('1. Cadastrar Nova Aeronave');
        console.log('2. Listar Todas as Aeronaves');
        console.log('3. Editar Aeronave');
        console.log('4. Excluir Aeronave');
        console.log('5. Voltar ao Painel Principal');
        
        this.rl.question('Escolha uma opção: ', (opcao) => {
            switch (opcao.trim()) {
                case '1': this.handleCadastroAeronave(); break;
                case '2': this.handleListarAeronaves(); break;
                case '3': this.handleEditarAeronave(); break;
                case '4': this.handleExcluirAeronave(); break;
                case '5': this.showAuthenticatedMenu(); break;
                default:
                    console.log('\n[ERRO] Opção inválida!');
                    this.handleGerirAeronaves();
                    break;
            }
        });
    }

    private handleCadastroAeronave(): void {
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR && this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
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
                    this.app.cadastrarAeronave({ codigo, modelo, tipo, capacidade: parseInt(capacidadeStr), alcance: parseInt(alcanceStr) });
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
        const aeronaves = this.app.database.aeronaves;
        if (aeronaves.length === 0) {
            console.log('Nenhuma aeronave cadastrada no sistema.');
        } else {
            aeronaves.forEach(aeronave => aeronave.exibirDetalhes());
        }
        this.handleGerirAeronaves();
    }
    
    private handleEditarAeronave(): void {
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR && this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado.');
            this.handleGerirAeronaves();
            return;
        }
        this.rl.question('Digite o código da aeronave a editar: ', codigo => {
            const aeronave = this.app.database.aeronaves.find(a => a.codigo.toLowerCase() === codigo.toLowerCase());
            if (!aeronave) {
                console.log('\n[ERRO] Aeronave não encontrada.');
                this.handleGerirAeronaves();
                return;
            }

            console.log(`Editando aeronave: ${aeronave.modelo}. Deixe em branco para manter o valor atual.`);
            this.rl.question(`Novo modelo (${aeronave.modelo}): `, novoModelo => {
                this.rl.question(`Nova capacidade (${aeronave.capacidade}): `, novaCapacidadeStr => {
                    this.rl.question(`Novo alcance (${aeronave.alcance} km): `, novoAlcanceStr => {
                        try {
                            const updatedData: UpdateAeronaveDTO = {};
                            if (novoModelo) updatedData.modelo = novoModelo;
                            if (novaCapacidadeStr) updatedData.capacidade = parseInt(novaCapacidadeStr);
                            if (novoAlcanceStr) updatedData.alcance = parseInt(novoAlcanceStr);

                            this.app.editarAeronave(codigo, updatedData);
                            console.log('\n[SUCESSO] Aeronave atualizada com sucesso!');
                        } catch (error: any) {
                            console.log(`\n[ERRO] ${error.message}`);
                        } finally {
                            this.handleGerirAeronaves();
                        }
                    });
                });
            });
        });
    }

    private handleExcluirAeronave(): void {
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            console.log('\n[ERRO] Acesso negado. Apenas Administradores podem excluir aeronaves.');
            this.handleGerirAeronaves();
            return;
        }
        this.rl.question('Digite o código da aeronave a excluir: ', codigo => {
            this.rl.question(`Tem a certeza que deseja excluir a aeronave ${codigo}? Esta ação não pode ser desfeita. (s/n): `, confirmacao => {
                if (confirmacao.toLowerCase() === 's') {
                    try {
                        this.app.excluirAeronave(codigo);
                        console.log('\n[SUCESSO] Aeronave excluída com sucesso.');
                    } catch (error: any) {
                        console.log(`\n[ERRO] ${error.message}`);
                    }
                } else {
                    console.log('\nOperação cancelada.');
                }
                this.handleGerirAeronaves();
            });
        });
    }
    
    // --- HANDLERS DE PEÇAS ---
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
        if (this.app.loggedInUser?.nivelPermissao === NivelPermissao.OPERADOR) {
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
                    this.app.adicionarPeca({ nome: nomePeca, tipo, fornecedor, codigoAeronave });
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
                const pecas = this.app.listarPecas(codigoAeronave);
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
            const aeronave = this.app.database.aeronaves.find(a => a.codigo.toLowerCase() === codigoAeronave.trim().toLowerCase());
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
                        this.app.atualizarStatusPeca(aeronave.codigo, peca.nome, novoStatus);
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

    // --- HANDLERS DE ETAPAS ---
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
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado. Apenas Engenheiros podem adicionar etapas.');
            this.handleGerirEtapas(); return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa: ', nomeEtapa => {
        this.rl.question('Prazo (AAAA-MM-DD): ', prazoStr => {
            try {
                const prazo = new Date(prazoStr);
                if (isNaN(prazo.getTime())) throw new Error('Formato de data inválido.');
                this.app.adicionarEtapa({ nome: nomeEtapa, prazo, codigoAeronave });
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
                this.app.iniciarEtapa(codigoAeronave, nomeEtapa);
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
                this.app.finalizarEtapa(codigoAeronave, nomeEtapa);
                console.log(`\n[SUCESSO] Etapa '${nomeEtapa}' finalizada.`);
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            } finally {
                this.handleGerirEtapas();
            }
        });});
    }

    private handleAssociarFuncionario(): void {
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR && this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
            console.log('\n[ERRO] Acesso negado.');
            this.handleGerirEtapas(); return;
        }
        this.rl.question('Código da Aeronave: ', codigoAeronave => {
        this.rl.question('Nome da Etapa: ', nomeEtapa => {
        this.rl.question('ID do Funcionário a ser associado: ', idFuncionario => {
            try {
                this.app.associarFuncionarioAEtapa(codigoAeronave, nomeEtapa, idFuncionario);
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
            try {
                const aeronave = this.app.findAeronaveByCodigo(codigoAeronave);
                if (aeronave.etapas.length === 0) {
                    console.log(`\nNenhuma etapa encontrada para a aeronave '${codigoAeronave}'.`);
                } else {
                    console.log(`\nEtapas da Aeronave '${codigoAeronave}':`);
                    aeronave.etapas.forEach(e => {
                        console.log(`- ${e.nome} (Prazo: ${e.prazo.toLocaleDateString('pt-BR')}, Status: ${e.status}, Funcionários: ${e.funcionarios.length})`);
                    });
                }
            } catch (error: any) {
                console.log(`\n[ERRO] ${error.message}`);
            }
            this.handleGerirEtapas();
        });
    }

    // --- HANDLERS DE TESTES ---
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
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
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
                    this.app.adicionarTeste(codigoAeronave, tipoTeste);
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
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ENGENHEIRO) {
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
                        this.app.registrarResultadoTeste(codigoAeronave, tipoTeste, resultado);
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

    // --- HANDLER DE RELATÓRIO ---
    private handleGerarRelatorio(): void {
        if (this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            console.log('\n[ERRO] Acesso negado. Apenas Administradores podem gerar relatórios.');
            this.showAuthenticatedMenu();
            return;
        }

        console.log('\n--- Gerar Relatório Final de Entrega ---');
        this.rl.question('Código da Aeronave a ser entregue: ', codigoAeronave => {
            this.rl.question('Nome do Cliente: ', cliente => {
                this.rl.question('Data de Entrega (AAAA-MM-DD): ', dataStr => {
                    const dataEntrega = new Date(dataStr);
                    if (isNaN(dataEntrega.getTime())) {
                        console.log('\n[ERRO] Formato de data inválido.');
                        this.showAuthenticatedMenu();
                        return;
                    }

                    try {
                        const aeronave = this.app.findAeronaveByCodigo(codigoAeronave);
                        this.app.gerarRelatorio(aeronave, cliente, dataEntrega);
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
}