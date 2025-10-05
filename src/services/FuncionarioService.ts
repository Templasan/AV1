import { Funcionario } from '../models/Funcionario.js';
import { NivelPermissao } from '../enums/enums.js';
import { randomUUID } from 'node:crypto';

export interface CreateFuncionarioDTO {
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string;
    nivel: NivelPermissao;
}

export class FuncionarioService {
    public create(data: CreateFuncionarioDTO, funcionariosList: Funcionario[]): Funcionario {
        const usuarioJaExiste = funcionariosList.some(f => f.usuario === data.usuario);
        if (usuarioJaExiste) throw new Error('Nome de utilizador já existe. Por favor, escolha outro.');

        const novoFuncionario = new Funcionario(
            randomUUID(),
            data.nome,
            data.telefone,
            data.endereco,
            data.usuario,
            data.senha,
            data.nivel
        );

        funcionariosList.push(novoFuncionario);
        return novoFuncionario;
    }

    public authenticate(usuario: string, senha: string, funcionariosList: Funcionario[]): Funcionario | null {
        const funcionario = funcionariosList.find(f => f.usuario === usuario);
        if (funcionario && funcionario.autenticar(usuario, senha)) return funcionario;
        return null;
    }
}