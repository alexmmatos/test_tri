# Desafio Técnico - API de Agendamento

## Passos para resolução do problema
1. Criação do ambiente usando docker compose contendo o projeto em node.js, um banco postgresql, uma instancia do redis.
Obs.: A depender da demanda de requisições do projeto o correto seria separar o banco de dados e o redis do projeto. Eu os inclui em uma instancia apenas para que seja mais facil demonstrar a usabilidade do projeto.
2. Criação dos models, serviços e controladores. Nesse passo usamos o typeorm e algumas funções de comparação de sua biblioteca. Tambem foi adicionada uma documentação da API usando swagger, você poderá acessa-la através do link http://localhost:3000/api-docs/ quando rodar o projeto.
3. Ajustes nos testes e criação do mock para que o teste não crie registros desnecessarios em nossa base de dados.


## Para rodar o projeto utilize e testar a API rode o comando:
```bash
docker compose up --build
```

## Para instalar as dependencias do projeto utilize o comando: 
```bash
npm install
```

## Para testar o projeto utilize o comando (caso já tenha instalado as dependencias via npm install): 
```bash
npm run test
```

Obs.: O funcionamento da API encontra-se completamente documentado ao rodar o projeto e acessar http://localhost:3000/api-docs/