import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';

const app = express();

app.use(express.json());
app.use(estoqueRoutes);

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});