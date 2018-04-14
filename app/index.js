const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2PServer = require('./p2pserver.js');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

const PORT = process.env.PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(bc, tp);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
})

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) =>  {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
p2pServer.listen();
