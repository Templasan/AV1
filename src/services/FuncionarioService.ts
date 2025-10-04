// src/services/FuncionarioService.ts
import { Funcionario } from '../models/Funcionario.js';
import { NivelPermissao } from '../enums/enums.js';
import { randomUUID } from 'node:crypto';

// Usamos uma interface (DTO - Data Transfer Object) para definir os dados necessários para criar um funcionário.
// Isso torna o código mais limpo e seguro.
export interface CreateFuncionarioDTO {
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string;
    nivel: NivelPermissao;
}

export class FuncionarioService {
    
    /**
     * Cria um novo funcionário e o adiciona à lista.
     * @param data - Os dados do novo funcionário.
     * @param funcionariosList - A lista atual de funcionários para validação.
     * @returns O funcionário recém-criado.
     * @throws Lança um erro se o nome de utilizador já existir.
     */
    public create(data: CreateFuncionarioDTO, funcionariosList: Funcionario[]): Funcionario {
        // 1. Validação da Lógica de Negócio
        const usuarioJaExiste = funcionariosList.some(f => f.usuario === data.usuario);
        if (usuarioJaExiste) {
            throw new Error('Nome de utilizador já existe. Por favor, escolha outro.');
        }

        // 2. Criação da Entidade
        const novoFuncionario = new Funcionario(
            randomUUID(),
            data.nome,
            data.telefone,
            data.endereco,
            data.usuario,
            data.senha,
            data.nivel
        );

        // 3. Adição à base de dados em memória
        funcionariosList.push(novoFuncionario);
        
        return novoFuncionario;
    }

    /**
     * Autentica um utilizador com base no nome de utilizador e senha.
     * @param usuario - O nome de utilizador a ser autenticado.
     * @param senha - A senha a ser verificada.
     * @param funcionariosList - A lista de todos os funcionários cadastrados.
     * @returns O objeto Funcionario se a autenticação for bem-sucedida, caso contrário null.
     */
    public authenticate(usuario: string, senha: string, funcionariosList: Funcionario[]): Funcionario | null {
        const funcionario = funcionariosList.find(f => f.usuario === usuario);

        // A lógica de verificação da senha está encapsulada no próprio modelo 'Funcionario'
        if (funcionario && funcionario.autenticar(usuario, senha)) {
            return funcionario;
        }

        return null;
    }
}