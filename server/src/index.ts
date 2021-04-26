import './instances';
import cors from 'cors';
import express from 'express';
import { join as pathJoin } from 'path';
import {
  addPeer,
  getBalance,
  getBlocks,
  getMyUTxOuts,
  getPeers,
  getTxPool,
  getUTxOuts,
  globalErrorHandler,
  mineBlock,
  mineRawBlock,
  mineTx,
  sendTx,
  getAddress,
} from './controller';

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(pathJoin(__dirname, '..', 'build')));

app.post('/mine/block', mineBlock);
app.post('/mine/block/raw', mineRawBlock);
app.post('/mine/tx', mineTx);
app.post('/sendTx', sendTx);
app.get('/txPool', getTxPool);
app.get('/blocks', getBlocks);
app.get('/uTxOuts', getUTxOuts);
app.get('/myUTxOuts', getMyUTxOuts);
app.get('/balance', getBalance);
app.get('/address', getAddress);
app.route('/peers').get(getPeers).post(addPeer);

app.all('*', (_req, res) => {
  res.sendFile(pathJoin(__dirname, '..', 'build', 'index.html'));
});

app.use(globalErrorHandler);

app.listen(600, () => {
  console.log('SERVER LISTENING http://127.0.0.1:600');
});
