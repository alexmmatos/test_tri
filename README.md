# Desafio Técnico - API de Agendamento

## Passos para resolução do problema
1. Criação do ambiente usando docker compose contendo o projeto em node.js, um banco postgresql, uma instancia do redis.
Obs.: A depender da demanda de requisições do projeto o correto seria separar o banco de dados e o redis do projeto. Eu os inclui em uma instancia apenas para que seja mais facil demonstrar a usabilidade do projeto.
2. Criação dos models, serviços e controladores