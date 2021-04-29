import WebSocket from 'ws';
import { Blockchain, replaceChain, addBlockToChain } from './blockChain';
import { blockchain, p2pServer, txPool } from './instances';
import { Transactions } from './transaction';
import { isBlockTypeValid } from './typeValidation';
import { parseJSON } from './utils';

const enum MessageType {
  QUERY_LATEST_BLOCK,
  QUERY_BLOCKCHAIN,
  RESPONSE_BLOCKCHAIN,
  QUERY_TRANSACTION_POOL,
  RESPONSE_TRANSACTION_POOL,
}

class Message {
  constructor(public type: MessageType, public data: any) {}
}

abstract class IResponse {
  protected readonly ws: WebSocket;
  constructor(ws: WebSocket) {
    this.ws = ws;
  }
  public abstract response(data: any): void;
}

class QueryLatestBlock extends IResponse {
  public response(): void {
    const message = new Message(MessageType.RESPONSE_BLOCKCHAIN, [blockchain.getLatest()]);
    p2pServer.write(this.ws, message);
  }
}

class QueryBlockchain extends IResponse {
  public response(): void {
    const message = new Message(MessageType.RESPONSE_BLOCKCHAIN, blockchain.get());
    p2pServer.write(this.ws, message);
  }
}

class QueryTxPool extends IResponse {
  public response(): void {
    const message = new Message(MessageType.RESPONSE_TRANSACTION_POOL, txPool.toTxsArray());
    p2pServer.write(this.ws, message);
  }
}

class ResponseBlockchain extends IResponse {
  public response(chain: Blockchain): void {
    const latestBlockReceived = chain[chain.length - 1];
    if (chain.length === 0 || !isBlockTypeValid(latestBlockReceived)) return;

    const latestBlockHeld = blockchain.getLatest();

    console.log(chain);

    if (latestBlockReceived.index < latestBlockHeld.index) {
      console.log('Received blockchain is not longer than received blockchain.');
      return;
    }

    if (latestBlockHeld.hash === latestBlockReceived.previousHash && addBlockToChain(latestBlockReceived)) {
      p2pServer.broadcastLatest();
    } else if (chain.length === 1) {
      console.log('We have to query the chain from our peer.');
      p2pServer.broadcast(new Message(MessageType.QUERY_BLOCKCHAIN, null));
    } else {
      console.log('Received blockchain is longer than current blockchain.');
      replaceChain(chain);
    }
  }
}

class ResponseTxPool extends IResponse {
  public response(txPoolArr: Transactions): void {
    if (!txPoolArr) return;
    txPoolArr.forEach((tx) => {
      try {
        txPool.addToTxPool(tx);
        p2pServer.broadcastTransactionPool();
      } catch (error) {
        console.log(error.message);
      }
    });
  }
}

const responseFactory = (ws: WebSocket, type: MessageType): IResponse => {
  switch (type) {
    case MessageType.QUERY_BLOCKCHAIN:
      return new QueryBlockchain(ws);
    case MessageType.QUERY_LATEST_BLOCK:
      return new QueryLatestBlock(ws);
    case MessageType.QUERY_TRANSACTION_POOL:
      return new QueryTxPool(ws);
    case MessageType.RESPONSE_BLOCKCHAIN:
      return new ResponseBlockchain(ws);
    case MessageType.RESPONSE_TRANSACTION_POOL:
      return new ResponseTxPool(ws);
  }
};

export class PeerToPeerServer {
  private readonly sockets: WebSocket[];

  constructor(port: number) {
    this.sockets = [];
    const server = new WebSocket.Server({ port });
    server.on('connection', (ws, _req) => {
      this.initConnection(ws);
    });
  }

  public getSockets() {
    return this.sockets;
  }

  private initConnection(ws: WebSocket) {
    this.sockets.push(ws);
    this.initMessageHandler(ws);
    this.initErrorHandler(ws);
    this.write(ws, new Message(MessageType.QUERY_LATEST_BLOCK, null));
    setTimeout(() => {
      this.broadcast(new Message(MessageType.QUERY_TRANSACTION_POOL, null));
    }, 500);
  }

  private initMessageHandler(ws: WebSocket) {
    ws.on('message', (data: string) => {
      const message = parseJSON<Message>(data);
      if (!message) return;
      const res = responseFactory(ws, message.type);
      res.response(message.data);
    });
  }

  private initErrorHandler(ws: WebSocket) {
    const closeConnection = () => {
      this.sockets.splice(this.sockets.indexOf(ws), 1);
    };
    ws.on('close', closeConnection);
    ws.on('error', closeConnection);
  }

  public write(ws: WebSocket, message: Message) {
    ws.send(JSON.stringify(message));
  }

  public broadcast(message: Message) {
    this.sockets.forEach((socket) => this.write(socket, message));
  }

  public broadcastLatest() {
    this.broadcast(new Message(MessageType.RESPONSE_BLOCKCHAIN, JSON.stringify([blockchain.getLatest()])));
  }

  public broadcastTransactionPool() {
    this.broadcast(new Message(MessageType.RESPONSE_TRANSACTION_POOL, JSON.stringify(txPool.toTxsArray())));
  }

  public connectToPeer(peer: string) {
    const ws = new WebSocket(peer);
    ws.on('open', () => {
      this.initConnection(ws);
    });
    ws.on('error', () => {
      console.error('connection faild');
    });
  }
}
