import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const conexao = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'senai',
  database: process.env.DB_NAME || 'empresa',
  max: 10
});

export default conexao;
