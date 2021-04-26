import { Chain } from './blockChain';
import { PeerToPeerServer } from './p2p';
import { TxManager } from './transaction';
import { TxPool } from './transactionPool';
import { Wallet } from './wallet';

export const txManager = new TxManager();
export const txPool = new TxPool();
export const wallet = new Wallet('./pk');
export const blockchain = new Chain();
export const p2pServer = new PeerToPeerServer(3001);
// export const p2pServer = new PeerToPeerServer(3001);
