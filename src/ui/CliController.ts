import inquirer from "inquirer";
import boxen from "boxen";
import chalk from "chalk";

import { AerocodeApp } from "../app.js";
import { TipoAeronave, StatusPeca, TipoTeste, ResultadoTeste, NivelPermissao } from "../enums/enums.js";

export class CliController {
    private app: AerocodeApp;
    private running: boolean = true;

    constructor(app: AerocodeApp) {
        this.app = app;
    }

    public async start(): Promise<void> {
        console.clear();
        console.log(
            boxen(chalk.cyanBright("Bem-vindo ao Aerocode"), { padding: 1, margin: 1, borderColor: "cyan" })
        );

        const hasAdmin = this.app.database.funcionarios.some(f => f.nivelPermissao === NivelPermissao.ADMINISTRADOR);
        if (!hasAdmin) {
            console.log(chalk.yellow("Nenhum administrador encontrado. Por favor, cadastre o primeiro usuário."));
            await this.handleCadastroFuncionario(true);
        }

        while (this.running) {
            if (!this.app.loggedInUser) {
                await this.showLoginMenu();
            } else {
                await this.showMainMenu();
            }
        }
    }

    // ====================== LOGIN ======================
    private async showLoginMenu(): Promise<void> {
        const { option } = await inquirer.prompt([{
            type: "list",
            name: "option",
            message: "Menu de Acesso",
            choices: [
                { name: "Fazer Login", value: "login" },
                { name: "Sair", value: "exit" },
            ]
        }]);

        if (option === 'login') {
            const { usuario, senha } = await inquirer.prompt([
                { type: "input", name: "usuario", message: "Usuário:" },
                { type: "password", name: "senha", message: "Senha:", mask: "*" },
            ]);

            const success = this.app.login(usuario, senha);
            if (success) {
                console.log(chalk.green(`✅ Login bem-sucedido! Bem-vindo, ${usuario}`));
            } else {
                console.log(chalk.red("❌ Usuário ou senha inválidos."));
            }
        } else if (option === 'exit') {
            this.app.saveAndExit();
            this.running = false;
        }
    }

    // ====================== MENU PRINCIPAL ======================
    private async showMainMenu(): Promise<void> {
        const { option } = await inquirer.prompt([
            {
                type: "list",
                name: "option",
                message: "Menu Principal",
                choices: [
                    { name: "👷  Gerenciar Funcionários", value: "funcionarios" },
                    { name: "🛩️   Gerenciar Aeronaves", value: "aeronaves" },
                    { name: "🧩  Gerenciar Peças", value: "pecas" },
                    { name: "📋  Gerenciar Etapas", value: "etapas" },
                    { name: "🧪  Gerenciar Testes", value: "testes" },
                    { name: "📑  Gerar Relatório", value: "relatorios" },
                    new inquirer.Separator(),
                    { name: "🔒  Logout", value: "logout" },
                    { name: "💾  Salvar e sair", value: "exit" },
                ],
            },
        ]);

        switch (option) {
            case "funcionarios": await this.menuFuncionarios(); break;
            case "aeronaves": await this.menuAeronaves(); break;
            case "pecas": await this.menuPecas(); break;
            case "etapas": await this.menuEtapas(); break;
            case "testes": await this.menuTestes(); break;
            case "relatorios": await this.menuRelatorios(); break;
            case "logout":
                this.app.logout();
                console.log(chalk.yellow("Você saiu da sessão."));
                break;
            case "exit":
                this.app.saveAndExit();
                this.running = false;
                break;
        }
    }

    // ====================== FUNCIONÁRIOS ======================
    private async handleCadastroFuncionario(isFirstAdmin: boolean): Promise<void> {
        if (!isFirstAdmin && this.app.loggedInUser?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
            console.log(chalk.red("❌ Apenas administradores podem cadastrar novos funcionários."));
            return;
        }

        const title = isFirstAdmin ? "Cadastro do Primeiro Administrador" : "Cadastrar Novo Funcionário";
        console.log(chalk.cyan(`\n--- ${title} ---`));

        const { nome, telefone, endereco, usuario, senha, nivel } = await inquirer.prompt([
            { type: "input", name: "nome", message: "Nome:" },
            { type: "input", name: "telefone", message: "Telefone:" },
            { type: "input", name: "endereco", message: "Endereço:" },
            { type: "input", name: "usuario", message: "Usuário:" },
            { type: "password", name: "senha", message: "Senha:", mask: "*" },
            {
                type: "list",
                name: "nivel",
                message: "Nível de Permissão:",
                choices: Object.values(NivelPermissao),
                when: !isFirstAdmin
            },
        ]);

        const nivelFinal = isFirstAdmin ? NivelPermissao.ADMINISTRADOR : nivel;
        this.app.criarFuncionario({ nome, telefone, endereco, usuario, senha, nivel: nivelFinal });
        console.log(chalk.green("✅ Funcionário cadastrado!"));
    }

    private async menuFuncionarios(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: "list",
            name: "action",
            message: "Funcionários",
            choices: [
                { name: "Cadastrar Funcionário", value: "create" },
                { name: "Listar Funcionários", value: "list" },
                { name: "Buscar Funcionário por ID", value: "find" },
                { name: "Voltar", value: "back" },
            ],
        }]);

        switch (action) {
            case "create": await this.handleCadastroFuncionario(false); break;
            case "list":
                console.log(chalk.cyan("\n📋 Lista de Funcionários:"));
                this.app.listarFuncionarios().forEach(f =>
                    console.log(`- ${f.id}: ${f.nome} (${f.nivelPermissao})`)
                );
                break;
            case "find": {
                const { id } = await inquirer.prompt([{ type: "input", name: "id", message: "Digite o ID do funcionário:" }]);
                const funcionario = this.app.findFuncionarioById(id);
                if (funcionario) {
                    console.log(chalk.cyan("\n✅ Funcionário Encontrado:"));
                    console.log(`   ID: ${funcionario.id}`);
                    console.log(`   Nome: ${funcionario.nome}`);
                    console.log(`   Usuário: ${funcionario.usuario}`);
                    console.log(`   Nível: ${funcionario.nivelPermissao}`);
                } else {
                    console.log(chalk.red("❌ Funcionário não encontrado."));
                }
                break;
            }
            case "back": return;
        }
    }

    // ====================== AERONAVES ======================
    private async menuAeronaves(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: "list",
            name: "action",
            message: "Aeronaves",
            choices: [
                { name: "Cadastrar Aeronave", value: "create" },
                { name: "Editar Aeronave", value: "edit" },
                { name: "Excluir Aeronave", value: "delete" },
                { name: "Listar Aeronaves", value: "list" },
                { name: "Buscar Aeronave por Código", value: "find" },
                { name: "Voltar", value: "back" },
            ],
        }]);

        switch (action) {
            case "create": {
                const { codigo, modelo, tipo, capacidade, alcance } = await inquirer.prompt([
                    { type: "input", name: "codigo", message: "Código:" },
                    { type: "input", name: "modelo", message: "Modelo:" },
                    { type: "list", name: "tipo", message: "Tipo:", choices: Object.values(TipoAeronave) },
                    { type: "number", name: "capacidade", message: "Capacidade:" },
                    { type: "number", name: "alcance", message: "Alcance (km):" },
                ]);
                this.app.cadastrarAeronave({ codigo, modelo, tipo, capacidade, alcance });
                console.log(chalk.green("✅ Aeronave cadastrada!"));
                break;
            }
            case "edit": {
                const { codigo, novoModelo } = await inquirer.prompt([
                    { type: "input", name: "codigo", message: "Código da Aeronave:" },
                    { type: "input", name: "novoModelo", message: "Novo Modelo:" },
                ]);
                this.app.editarAeronave(codigo, { modelo: novoModelo });
                console.log(chalk.green("✏️ Aeronave atualizada."));
                break;
            }
            case "delete": {
                const { codigo } = await inquirer.prompt([{ type: "input", name: "codigo", message: "Código:" }]);
                this.app.excluirAeronave(codigo);
                console.log(chalk.red("🗑️ Aeronave excluída."));
                break;
            }
            case "list":
                console.log(chalk.cyan("\n🛩️ Lista de Aeronaves:"));
                this.app.listarAeronaves().forEach(a =>
                    console.log(`- ${a.codigo}: ${a.modelo} (${a.tipo})`)
                );
                break;
            case "find": {
                const { codigo } = await inquirer.prompt([{ type: "input", name: "codigo", message: "Digite o código da aeronave:" }]);
                const aeronave = this.app.findAeronaveByCodigo(codigo);
                if (aeronave) {
                    console.log(chalk.cyan("\n✅ Aeronave Encontrada:"));
                    console.log(`   Código: ${aeronave.codigo}`);
                    console.log(`   Modelo: ${aeronave.modelo}`);
                    console.log(`   Tipo: ${aeronave.tipo}`);
                    console.log(`   Capacidade: ${aeronave.capacidade}`);
                    console.log(`   Alcance: ${aeronave.alcance} km`);
                } else {
                    console.log(chalk.red("❌ Aeronave não encontrada."));
                }
                break;
            }
            case "back": return;
        }
    }

    // ====================== PEÇAS ======================
    private async menuPecas(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: "list",
            name: "action",
            message: "Peças",
            choices: [
                { name: "Adicionar Peça", value: "create" },
                { name: "Atualizar Status de Peça", value: "update" },
                { name: "Listar Peças", value: "list" },
                { name: "Voltar", value: "back" },
            ],
        }]);

        switch (action) {
            case "create": {
                const { codigoAeronave, nome, tipo, fornecedor } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nome", message: "Nome da Peça:" },
                    { type: "input", name: "tipo", message: "Tipo:" },
                    { type: "input", name: "fornecedor", message: "Fornecedor:" },
                ]);
                this.app.adicionarPeca({ codigoAeronave, nome, tipo, fornecedor });
                console.log(chalk.green("⚙️ Peça adicionada!"));
                break;
            }
            case "update": {
                const { codigoAeronave, nomePeca, status } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nomePeca", message: "Nome da Peça:" },
                    { type: "list", name: "status", message: "Status da Peça:", choices: Object.values(StatusPeca) },
                ]);
                this.app.atualizarStatusPeca(codigoAeronave, nomePeca, status as StatusPeca);
                console.log(chalk.green("✅ Status atualizado!"));
                break;
            }
            case "list": {
                const { codigoAeronave } = await inquirer.prompt([{ type: "input", name: "codigoAeronave", message: "Código da Aeronave:" }]);
                const pecas = this.app.listarPecas(codigoAeronave);
                console.log(chalk.cyan(`\n⚙️ Peças da Aeronave ${codigoAeronave}:`));
                pecas.forEach(p => console.log(`- ${p.nome}: ${p.tipo} [${p.status}]`));
                break;
            }
            case "back": return;
        }
    }

    // ====================== ETAPAS ======================
    private async menuEtapas(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: "list",
            name: "action",
            message: "Etapas",
            choices: [
                { name: "Adicionar Etapa", value: "create" },
                { name: "Iniciar Etapa", value: "start" },
                { name: "Finalizar Etapa", value: "finish" },
                { name: "Associar Funcionário", value: "associate" },
                { name: "Listar Etapas", value: "list" },
                { name: "Voltar", value: "back" },
            ],
        }]);

        switch (action) {
            case "create": {
                const { codigoAeronave, nome, prazo } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nome", message: "Nome da Etapa:" },
                    { type: "input", name: "prazo", message: "Prazo (YYYY-MM-DD):" },
                ]);
                this.app.adicionarEtapa({ codigoAeronave, nome, prazo: new Date(prazo) });
                console.log(chalk.green("📋 Etapa adicionada!"));
                break;
            }
            case "start": {
                const { codigoAeronave, nomeEtapa } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nomeEtapa", message: "Nome da Etapa:" },
                ]);
                this.app.iniciarEtapa(codigoAeronave, nomeEtapa);
                console.log(chalk.green("▶️ Etapa iniciada!"));
                break;
            }
            case "finish": {
                const { codigoAeronave, nomeEtapa } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nomeEtapa", message: "Nome da Etapa:" },
                ]);
                this.app.finalizarEtapa(codigoAeronave, nomeEtapa);
                console.log(chalk.green("✔️ Etapa finalizada!"));
                break;
            }
            case "associate": {
                const { codigoAeronave, nomeEtapa, idFuncionario } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "input", name: "nomeEtapa", message: "Nome da Etapa:" },
                    { type: "input", name: "idFuncionario", message: "ID do Funcionário:" },
                ]);
                this.app.associarFuncionarioAEtapa(codigoAeronave, nomeEtapa, idFuncionario);
                console.log(chalk.green("👤 Funcionário associado!"));
                break;
            }
            case "list": {
                const { codigoAeronave } = await inquirer.prompt([{ type: "input", name: "codigoAeronave", message: "Código da Aeronave:" }]);
                const etapas = this.app.listarEtapas(codigoAeronave);
                console.log(chalk.cyan(`\n📋 Etapas da Aeronave ${codigoAeronave}:`));
                etapas.forEach(e =>
                    console.log(`- ${e.nome}: ${e.status} [Funcionários: ${e.funcionarios.map(f => f.nome).join(", ")}]`)
                );
                break;
            }
            case "back": return;
        }
    }

    // ====================== TESTES ======================
    private async menuTestes(): Promise<void> {
        const { action } = await inquirer.prompt([{
            type: "list",
            name: "action",
            message: "Testes",
            choices: [
                { name: "Adicionar Teste", value: "create" },
                { name: "Registrar Resultado de Teste", value: "result" },
                { name: "Listar Testes", value: "list" },
                { name: "Excluir Teste", value: "delete" },
                { name: "Voltar", value: "back" },
            ],
        }]);

        switch (action) {
            case "create": {
                const { codigoAeronave, tipoTeste } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "list", name: "tipoTeste", message: "Tipo de Teste:", choices: Object.values(TipoTeste) },
                ]);
                this.app.adicionarTeste(codigoAeronave, tipoTeste as TipoTeste);
                console.log(chalk.green("🧪 Teste adicionado!"));
                break;
            }
            case "result": {
                const { codigoAeronave, tipoTeste, resultado } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "list", name: "tipoTeste", message: "Tipo de Teste:", choices: Object.values(TipoTeste) },
                    { type: "list", name: "resultado", message: "Resultado do Teste:", choices: Object.values(ResultadoTeste) },
                ]);
                this.app.registrarResultadoTeste(codigoAeronave, tipoTeste as TipoTeste, resultado as ResultadoTeste);
                console.log(chalk.green("✅ Resultado registrado!"));
                break;
            }
            case "list": {
                const { codigoAeronave } = await inquirer.prompt([{ type: "input", name: "codigoAeronave", message: "Código da Aeronave:" }]);
                const testes = this.app.listarTestes(codigoAeronave);
                console.log(chalk.cyan(`\n🧪 Testes da Aeronave ${codigoAeronave}:`));
                testes.forEach(t =>
                    console.log(`- ${t.tipo} [Resultado: ${t.resultado ?? "Pendente"}]`)
                );
                break;
            }
            case "delete": {
                const { codigoAeronave, tipoTeste } = await inquirer.prompt([
                    { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
                    { type: "list", name: "tipoTeste", message: "Tipo de Teste a excluir:", choices: Object.values(TipoTeste) },
                ]);
                this.app.excluirTeste(codigoAeronave, tipoTeste as TipoTeste);
                console.log(chalk.red("🗑️ Teste excluído!"));
                break;
            }
            case "back": return;
        }
    }

    // ====================== RELATÓRIOS ======================
    private async menuRelatorios(): Promise<void> {
        const { codigoAeronave, cliente, dataEntrega } = await inquirer.prompt([
            { type: "input", name: "codigoAeronave", message: "Código da Aeronave:" },
            { type: "input", name: "cliente", message: "Cliente:" },
            { type: "input", name: "dataEntrega", message: "Data de Entrega (YYYY-MM-DD):" },
        ]);

        const aeronave = this.app.findAeronaveByCodigo(codigoAeronave);
        if (!aeronave) {
            console.log(chalk.red("❌ Aeronave não encontrada."));
            return;
        }

        try {
            this.app.gerarRelatorio(aeronave, cliente, new Date(dataEntrega));
            console.log(chalk.green("📑 Relatório gerado!"));
        } catch (error: any) {
            console.log(chalk.red(`❌ Não foi possível gerar o relatório: ${error.message}`));
        }
    }

    // ====================== FECHAR CLI ======================
    public close(): void {
        this.running = false;
    }
}