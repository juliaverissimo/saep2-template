import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';

const app = express();

app.use(express.json());
app.use(estoqueRoutes);

const porta = process.env.PORT || 3000;

app.post('/add_produto', async (req, res) => {
  const { nome, descricao, valor, quantidade } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(422).json({ erro: 'O campo nome e obrigatorio' });
  }
  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    return res.status(422).json({ erro: 'O campo valor deve ser um numero maior ou igual a zero' });
  }
  if (quantidade === undefined || quantidade === null || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior ou igual a zero' });
  }

  try {
    const { rows } = await conexao.query(
      'INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES ($1, $2, $3, $4) RETURNING id_produto',
      [nome, descricao || null, Number(valor), Number(quantidade)]
    );

    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso',
      id_produto: rows[0].id_produto
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
});

app.get('/listar_produtos', async (req, res) => {
  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro FROM produto'
    );

    return res.status(200).json(produtos);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});

app.get('/listar_produto/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(Number(id))) {
    return res.status(422).json({ erro: 'O id informado e invalido' });
  }

  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro FROM produto WHERE id_produto = $1',
      [Number(id)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    return res.status(200).json(produtos[0]);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao consultar produto' });
  }
});

app.put('/atualizar_produto/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, valor, quantidade } = req.body;

  if (isNaN(Number(id))) {
    return res.status(422).json({ erro: 'O id informado e invalido' });
  }
  if (!nome || nome.trim() === '') {
    return res.status(422).json({ erro: 'O campo nome e obrigatorio' });
  }
  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    return res.status(422).json({ erro: 'O campo valor deve ser um numero maior ou igual a zero' });
  }
  if (quantidade === undefined || quantidade === null || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior ou igual a zero' });
  }

  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto FROM produto WHERE id_produto = $1',
      [Number(id)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    await conexao.query(
      'UPDATE produto SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5',
      [nome, descricao || null, Number(valor), Number(quantidade), Number(id)]
    );

    return res.status(200).json({ mensagem: 'Produto atualizado com sucesso' });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

app.delete('/deletar_produto', async (req, res) => {
  const { id_produto } = req.body;

  if (id_produto === undefined || id_produto === null || isNaN(Number(id_produto))) {
    return res.status(422).json({ erro: 'O campo id_produto e obrigatorio' });
  }

  try {
    const { rows: movimentacoes } = await conexao.query(
      'SELECT id_movimentacao FROM movimentacao WHERE id_produto = $1',
      [Number(id_produto)]
    );

    if (movimentacoes.length > 0) {
      return res.status(409).json({ erro: 'O produto possui movimentacoes e nao pode ser removido' });
    }

    const resultado = await conexao.query(
      'DELETE FROM produto WHERE id_produto = $1',
      [Number(id_produto)]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    return res.status(200).json({ mensagem: 'Produto removido com sucesso' });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao remover produto' });
  }
});

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});
