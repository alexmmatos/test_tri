# Desafio Técnico - API de Agendamento

## Objetivo
Este é um desafio técnico que consiste em desenvolver uma API REST para gerenciar agendamentos de motoristas. A API deve permitir a criação, listagem e atualização de agendamentos com regras de negócio específicas, e o desafio incentiva a utilização de TDD (Test-Driven Development) com testes unitários já fornecidos.

## Funcionalidades

### 1. Criar Agendamento

A API deve permitir a criação de um agendamento com os seguintes dados:

- **Data e hora do agendamento**
- **Número do contrato**
- **Nome do motorista**
- **CPF do motorista**
- **Placa do caminhão**
  
O agendamento criado terá um status inicial de `pendente`.

#### Regras:
- Não é possível agendar mais de um motorista por hora.
- Motoristas com agendamentos `pendente` ou `atrasado` não podem receber novos agendamentos.
  
### 2. Alterar Status de um Agendamento

A API permite alterar o status de um agendamento para `concluído` ou `cancelado`. 

#### Regras:
- Não é possível alterar o status de um agendamento `concluído` para `cancelado`.
- Não é possível alterar o status de um agendamento `cancelado`.

### 3. Listar Agendamentos

A API fornece uma rota para listar todos os agendamentos e também permite aplicar filtros:

#### Filtros:
- **Data**: Filtrar agendamentos de um dia específico.
- **Status**: Filtrar agendamentos pelo status (`pendente`, `concluído`, `atrasado`, `cancelado`).
- **CPF do motorista**: Filtrar agendamentos de um motorista específico.

### 4. Excluir Agendamentos Antigos

A API fornece uma rota para excluir todos os agendamentos que possuem mais de 3 dias.

#### Regras:
- Agendamentos com mais de 3 dias de idade serão removidos.

### Endpoints

#### Criar Agendamento
- **POST** `/api/agendamentos`

  Exemplo de body:
  ```json
  {
    "dataHora": "2024-09-15T10:00:00Z",
    "numeroContrato": "CT123",
    "motoristaNome": "João",
    "motoristaCpf": "12345678900",
    "placaCaminhao": "ABC-1234"
  }

### Alterar Status de Agendamento
- **PATCH** `/api/agendamentos/:id/status`

	Exemplo de body:
	```json
	{
	  "status": "concluido"
	}
	```

### Listar Agendamentos (com filtros opcionais)
- **GET** `/api/agendamentos`

  Filtros (opcionais) via query params:
	- `data`: Filtrar por data (ISO format, ex: `2024-09-15`)
	- `status`: Filtrar por status (ex: `pendente`, `concluido`)
	- `motoristaCpf`: Filtrar por CPF do motorista (ex: `12345678900`)

	Exemplo:
	```bash
	GET /api/agendamentos?data=2024-09-15&status=pendente&motoristaCpf=12345678900

### Excluir Agendamentos Antigos
- **DELETE** `/api/agendamentos/antigos`

  Exclui todos os agendamentos que possuem mais de 3 dias.
  
	Exemplo de resposta:
	```json
  {
	  "message": "Agendamentos com mais de 3 dias foram removidos"
  }
	```

## Executando o Projeto

### Pré-requisitos
- Node.js v16 ou superior
- Yarn v1 (classic)

### Instalação
1. Clone o repositório:
	```bash
	git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
	```
2. Instale as dependências:
	```bash
	yarn install
	```
3. Inicie o servidor de desenvolvimento:
	```bash
	yarn start
	```
4. Execute os testes:
	```bash
	yarn test
	```
A API estará disponível em http://localhost:3000.

## Executando Testes Unitários

O projeto já contém testes unitários implementados com Jest para validar as regras de negócio. Para executar os testes:
```bash
yarn test
```

Os testes cobrem:

- Criação de agendamentos, com validações das regras.
- Alteração de status dos agendamentos, com restrições.
- Listagem de agendamentos, com aplicação de filtros (data, status, CPF do motorista).
- Exclusão de agendamentos com mais de 3 dias.

## Estrutura do Projeto

```bash
├── src
│   ├── controllers
│   │   └── agendamentoController.ts    # Controladores das rotas
│   ├── services
│   │   └── agendamentoService.ts       # Lógica de negócios e regras
│   ├── models
│   │   └── agendamento.ts              # Modelo do agendamento
│   ├── routes
│   │   └── agendamentoRoutes.ts        # Definição das rotas da API
│   └── app.ts                          # Configuração do app Express
├── tests
│   └── agendamento.test.ts             # Testes unitários
├── package.json
├── tsconfig.json
└── README.md

```

## Tecnologias Utilizadas
- Node.js
- Express.js
- TypeScript
- Jest para testes unitários
- date-fns para manipulação de datas

## Considerações Finais
Este projeto é um desafio técnico projetado para validar as habilidades em Node.js, Express, TypeScript e o uso de TDD. O desafio foi elaborado com o objetivo de avaliar o conhecimento de boas práticas de desenvolvimento, como a criação de testes, refatoração e o uso correto de serviços e controladores.