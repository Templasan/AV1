# ✈️ Aerocode - Sistema de Gestão para Produção de Aeronaves

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)

Bem-vindo ao repositório oficial da **Aerocode**, uma empresa especializada no desenvolvimento de software para gestão da produção de aeronaves.  
Este projeto é o nosso **Produto Mínimo Viável (MVP)**: um sistema de **Command-Line Interface (CLI)** robusto, eficiente e de baixo custo, desenvolvido para simular e gerenciar todo o ciclo de produção de uma aeronave.

---

## 🎯 Sobre o Projeto
A Aerocode nasceu para atender às necessidades da indústria aeronáutica brasileira, fornecendo soluções de software para otimizar a complexa cadeia de produção de aeronaves.

Este sistema CLI foi projetado para gerenciar todas as fases da fabricação:  
- Registro de novas aeronaves  
- Controle de peças  
- Acompanhamento das etapas de produção  
- Gestão de equipes  
- Execução de testes  
- Geração de relatórios finais para entrega ao cliente  

Todos os dados são persistidos em arquivos de texto, garantindo que nenhuma informação seja perdida entre sessões.

---

## ✨ Principais Funcionalidades

- **Gestão de Aeronaves**
  - Cadastro de aeronaves com código único, modelo, tipo (Comercial ou Militar), capacidade e alcance.  
  - Exibição detalhada das informações de cada aeronave.

- **Gerenciamento de Peças**
  - Registro de peças com nome, tipo (Nacional ou Importada), fornecedor e status (Em Produção, Em Transporte ou Pronta para Uso).  
  - Atualização do status das peças para acompanhamento de evolução.

- **Controle de Etapas de Produção**
  - Definição de etapas com nome, prazo e status (Pendente, Em Andamento ou Concluída).  
  - Ordem lógica de produção, impedindo conclusão de uma etapa antes da anterior.  
  - Associação de etapas a uma aeronave específica.

- **Administração de Funcionários e Acessos**
  - Cadastro de funcionários (ID, nome, telefone e endereço).  
  - Sistema de autenticação com usuário e senha.  
  - Níveis de permissão (Administrador, Engenheiro, Operador).  
  - Associação de funcionários às etapas de produção.

- **Execução e Registro de Testes**
  - Registro de testes Elétricos, Hidráulicos e Aerodinâmicos.  
  - Resultados possíveis: **Aprovado** ou **Reprovado**.

- **Relatórios e Persistência de Dados**
  - Geração de relatório final detalhado da aeronave pronta para entrega.  
  - Relatórios incluem dados da aeronave, peças, etapas, testes, cliente e data de entrega.  
  - Todos os dados são salvos e carregados de arquivos de texto.

---

## 💻 Tecnologias Utilizadas
- **[TypeScript](https://www.typescriptlang.org/):** Superset do JavaScript com tipagem estática, aumentando a segurança do código.  
- **[Node.js](https://nodejs.org/):** Ambiente de execução para rodar o código compilado e construir aplicações CLI eficientes.  

---

## 🔧 Pré-requisitos
Antes de começar, certifique-se de ter:  
- **Node.js** versão 18.x ou superior  
- **NPM** (vem com o Node.js) ou **Yarn**  

---

## 🚀 Manual de Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/aerocode.git

# 2. Acesse o diretório
cd aerocode

# 3. Instale as dependências
npm install

# 4. Compile o código TypeScript
npm run build

# 5. Execute a aplicação CLI
npm start
