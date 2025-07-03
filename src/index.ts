import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source';
import agendamentoRoutes from './routes/agendamentoRoutes';

const app = express();

app.use(express.json());
app.use('/api', agendamentoRoutes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao inicializar o banco de dados:', err);
  });
