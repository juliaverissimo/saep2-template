import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';

const app = express();

app.use(express.json());
app.use(estoqueRoutes);

const porta = process.env.PORT || 3000;

app.post('/movimentar_produto', async (req, res) => {
  const { id_produto, tipo, quantidade } = req.body;

  if (id_produto === undefined || id_produto === null || isNaN(Number(id_produto))) {
    return res.status(422).json({ erro: 'O campo id_produto e obrigatorio' });
  }
  if (tipo !== 'ENTRADA') {
    return res.status(422).json({ erro: 'Somente movimentacoes do tipo ENTRADA estao implementadas' });
  }
  if (quantidade === undefined || quantidade === null || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
    return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior que zero' });
  }

  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto, quantidade FROM produto WHERE id_produto = $1',
      [Number(id_produto)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    await conexao.query(
      'INSERT INTO movimentacao (id_produto, tipo, quantidade) VALUES ($1, $2, $3)',
      [Number(id_produto), tipo, Number(quantidade)]
    );

    await conexao.query(
      'UPDATE produto SET quantidade = quantidade + $1 WHERE id_produto = $2',
      [Number(quantidade), Number(id_produto)]
    );

    return res.status(201).json({
      mensagem: 'Entrada registrada com sucesso',
      quantidade_atual: produtos[0].quantidade + Number(quantidade)
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao movimentar produto' });
  }
});

app.get('/listar_movimentacoes', async (req, res) => {
  try {
    const { rows: movimentacoes } = await conexao.query(
      'SELECT m.id_movimentacao, m.id_produto, p.nome, m.tipo, m.quantidade ' +
      'FROM movimentacao m ' +
      'INNER JOIN produto p ON p.id_produto = m.id_produto ' +
      'ORDER BY m.id_movimentacao DESC'
    );

    return res.status(200).json(movimentacoes);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao listar movimentacoes' });
  }
});

export default app;

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});