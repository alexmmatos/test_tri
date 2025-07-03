import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Agendamento } from './models/agendamento';

export const AppDatabase = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'trizzi',
  password: process.env.POSTGRES_PASSWORD || 'trizzi123',
  database: process.env.POSTGRES_DB || 'trizzi_db',
  synchronize: true,
  logging: false,
  entities: [Agendamento],
  migrations: [],
  subscribers: [],
}); 