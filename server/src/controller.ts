import { ErrorRequestHandler, RequestHandler } from 'express';
import { generateNextBlock, generateNextBlockWithTransaction, generateRawNextBlock } from './blockChain';
import { blockchain, p2pServer, txManager, txPool, wallet } from './instances';

export const globalErrorHandler: ErrorRequestHandler = (err: Error, _req, res, next) => {
  console.log(err);
  res.status(400).json({ message: err.message });
  next();
};

export const mineBlock: RequestHandler = (_req, res) => {
  res.status(201).json(generateNextBlock());
};

export const mineRawBlock: RequestHandler = (req, res, next) => {
  const { data } = req.body;
  if (!data) return next(new Error('Provide a valid tranasction.'));
  const newBlock = generateRawNextBlock(data);
  return newBlock ? res.status(201).json(newBlock) : next(new Error('Could not generate block'));
};

export const mineTx: RequestHandler = (req, res) => {
  const { address, amount } = req.body;
  res.status(201).json(generateNextBlockWithTransaction(address, amount));
};

export const sendTx: RequestHandler = (req, res, next) => {
  const { address, amount } = req.body;
  if (!address || !amount) return next(new Error('Invalid data'));
  res.status(200).json(wallet.sendTx(address, amount));
};

export const getTxPool: RequestHandler = (_req, res) => {
  res.status(200).json(txPool.toTxsArray());
};

export const getBlocks: RequestHandler = (_req, res) => {
  res.status(200).json(blockchain.get());
};

export const getUTxOuts: RequestHandler = (_req, res) => {
  res.status(200).json(txManager.uTxOutstoArray());
};

export const getMyUTxOuts: RequestHandler = (_req, res) => {
  res.status(200).json(wallet.myUTxOuts());
};

export const getBalance: RequestHandler = (_req, res) => {
  res.status(200).json({ balance: wallet.getBalance() });
};

export const getPeers: RequestHandler = (_req, res) => {
  res.send(p2pServer.getSockets().map((s: any) => `${s._socket.remoteAddress}:${s._socket.remotePort}`));
};

export const addPeer: RequestHandler = (req, res) => {
  p2pServer.connectToPeer(req.body.peer);
  res.status(202).json({ peer: req.body.peer });
};

export const getAddress: RequestHandler = (_req, res) => {
  res.status(200).json(wallet.getPublicKey());
};
