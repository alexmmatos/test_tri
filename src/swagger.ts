import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Agendamento',
      version: '1.0.0',
      description: 'Documentação da API de Agendamento',
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
}); 