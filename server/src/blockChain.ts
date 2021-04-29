import { txManager, txPool, wallet, p2pServer, blockchain } from './instances';
import { getCoinbaseTransaction, Transaction, Transactions, TxIn, TxOut, TxManager } from './transaction';
import { isBlockTypeValid, isAddressValid } from './typeValidation';
import { hexToBinary, sha256 } from './utils';

const BLOCK_GENERATION_INTERVAL: number = 10 * 1000; // 10 seconds
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10; // 10 blocks

export class Block {
  constructor(
    public index: number,
    public hash: string,
    public previousHash: string,
    public timestamp: number,
    public data: Transactions,
    public difficulty: number,
    public nonce: number
  ) {}
}

export type Blockchain = Block[];

export class Chain {
  private blockchain: Blockchain;
  private readonly genesisBlock: Block;
  private readonly genesisBlockStr: string;
  constructor() {
    const genesisTransaction = new Transaction(
      'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3',
      '',
      '',
      [new TxIn('', 0, '', '')],
      [
        new TxOut(
          '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
          50
        ),
      ]
    );
    this.genesisBlock = new Block(
      0,
      'a6297a4caf638d57eec7c424a989fe8c8b31bccb1c29d6370cd637ed3dec845b93dda328',
      '',
      1618729571084,
      [genesisTransaction],
      0,
      0
    );
    this.genesisBlockStr = JSON.stringify(this.genesisBlock);
    this.blockchain = [this.genesisBlock];
    txManager.processTxs([genesisTransaction], 0);
  }

  public get() {
    return this.blockchain;
  }

  public getGenesis() {
    return this.genesisBlock;
  }

  public isGenesisValid(block: Block) {
    return JSON.stringify(block) === this.genesisBlockStr;
  }

  public getLatest() {
    return this.blockchain[this.blockchain.length - 1];
  }

  public set(chain: Blockchain) {
    this.blockchain = chain;
  }

  public length() {
    return this.blockchain.length;
  }

  public push(block: Block) {
    if (!isNewBlockValid(block, this.getLatest())) return false;
    this.blockchain.push(block);
    return true;
  }

  public getDifficulty() {
    const { index, difficulty } = this.getLatest();
    if (index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && index !== 0) {
      return this.getAdjustedDifficulty();
    }
    return difficulty;
  }

  private getAdjustedDifficulty() {
    const { timestamp: prevTimestamp, difficulty: prevDifficulty } = this.blockchain[
      this.length() - DIFFICULTY_ADJUSTMENT_INTERVAL
    ];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = this.getLatest().timestamp - prevTimestamp;

    return timeTaken < timeExpected / 2
      ? prevDifficulty + 1
      : timeTaken > timeExpected * 2 && prevDifficulty - 1 > 0
      ? prevDifficulty - 1
      : prevDifficulty;
  }
}

const calculateHash = (
  index: number,
  previousHash: string,
  timestamp: number,
  data: Transactions,
  difficulty: number,
  nonce: number
) => {
  return sha256(
    index.toString() + previousHash + timestamp.toString() + data + difficulty.toString() + nonce.toString()
  );
};

const calculateHashForBlock = (block: Block) =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

const hashMatchesDifficulty = (hash: string, difficulty: number) => {
  return hexToBinary(hash).startsWith('0'.repeat(difficulty));
};

const findBlock = (index: number, previousHash: string, timestamp: number, data: Transactions, difficulty: number) => {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
    }
    nonce++;
  }
};

const isTimestampValid = (newBlock: Block, previousBlock: Block) => {
  return previousBlock.timestamp - 60000 < newBlock.timestamp && newBlock.timestamp - 60000 < Date.now();
};

export const addBlockToChain = (block: Block) => {
  if (!txManager.processTxs(block.data, block.index) || !blockchain.push(block)) return false;
  txPool.updateTxPool();
  return true;
};

export const generateRawNextBlock = (blockData: Transactions) => {
  const previousBlock = blockchain.getLatest();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = Date.now();
  const difficulty = blockchain.getDifficulty();
  const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
  if (!addBlockToChain(newBlock)) return null;
  p2pServer.broadcastLatest();
  return newBlock;
};

export const generateNextBlock = () => {
  const coinbaseTx = getCoinbaseTransaction(wallet.getPublicKey(), blockchain.getLatest().index + 1);
  return generateRawNextBlock([coinbaseTx, ...txPool.toTxsArray()]);
};

export const generateNextBlockWithTransaction = (receiverAddress: string, amount: number) => {
  if (!isAddressValid(receiverAddress) || typeof amount !== 'number') throw new Error('invalid transaction data');
  const coinbaseTx = getCoinbaseTransaction(wallet.getPublicKey(), blockchain.getLatest().index + 1);
  const tx = wallet.createTx(receiverAddress, amount);
  return generateRawNextBlock([coinbaseTx, tx]);
};

const isNewBlockValid = (newBlock: Block, previousBlock: Block) => {
  return (
    isBlockTypeValid(newBlock) &&
    previousBlock.index + 1 === newBlock.index &&
    previousBlock.hash === newBlock.previousHash &&
    isTimestampValid(newBlock, previousBlock) &&
    hasValidHash(newBlock)
  );
};

const isChainValid = (chain: Blockchain, txManager: TxManager) => {
  if (!blockchain.isGenesisValid(chain[0])) return false;
  for (let i = 1; i < chain.length; i++) {
    if (!isNewBlockValid(chain[i], chain[i - 1]) || !txManager.processTxs(chain[i].data, chain[i].index)) return false;
  }
  return true;
};

const getAccumulatedDifficulty = (chain: Blockchain) =>
  chain.reduce((acc, block) => acc + Math.pow(2, block.difficulty), 0);

const hasValidHash = (block: Block) => calculateHashForBlock(block) === block.hash;

export const replaceChain = (newChain: Blockchain) => {
  const txManagerForValidation = new TxManager();
  if (
    isChainValid(newChain, txManagerForValidation) &&
    getAccumulatedDifficulty(newChain) > getAccumulatedDifficulty(blockchain.get())
  ) {
    blockchain.set(newChain);
    txManager.setToNewUTxOuts(txManagerForValidation.uTxOutstoArray());
    txPool.updateTxPool();
    p2pServer.broadcastLatest();
    console.log('CHAIN REPLACED');
  }
};
