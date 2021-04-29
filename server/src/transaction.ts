import { ec as EC } from 'elliptic';
import { isAddressValid, isTransactionsTypeValid, isTransactionTypeValid } from './typeValidation';
import { sha256 } from './utils';

const ec = new EC('secp256k1');

const COINBASE_AMOUNT = 50;

export type Transactions = Transaction[];
export type TxIns = TxIn[];
export type TxOuts = TxOut[];
export type UTxOuts = UTxOut[];

export class Transaction {
  constructor(
    public id: string,
    public sender: string,
    public receiver: string,
    public txIns: TxIns,
    public txOuts: TxOuts
  ) {}
}

export class TxIn {
  constructor(public txOutId: string, public txOutIndex: number, public address: string, public signature: string) {}
}

export class TxOut {
  constructor(public address: string, public amount: number) {}
}

export class UTxOut {
  constructor(
    public readonly txOutId: string,
    public readonly txOutIndex: number,
    public readonly address: string,
    public readonly amount: number
  ) {}
}

export class TxManager {
  private readonly uTxOs: Map<string, UTxOuts>;

  constructor() {
    this.uTxOs = new Map();
  }

  public uTxOutstoArray(): UTxOuts {
    return [...this.uTxOs.values()].flatMap((ts) => ts.map((t) => ({ ...t })));
  }

  public getUTxOutsMapForAddress(address: string) {
    const map = new Map<string, UTxOut>();
    this.uTxOs.get(address)?.forEach((uTxO) => map.set(uTxO.txOutId + uTxO.txOutIndex.toString(), uTxO));
    return map;
  }

  public getUTxOutsArrayForAddress(address: string) {
    return this.uTxOs.get(address) ?? [];
  }

  public getUTxOutFromTxIn(txIn: TxIn) {
    const { address, txOutId, txOutIndex } = txIn;
    return this.getUTxOutsMapForAddress(address).get(txOutId + txOutIndex.toString());
  }

  public setUTxOutForAddress(uTxO: UTxOut) {
    const { address } = uTxO;
    if (this.uTxOs.has(address)) {
      this.uTxOs.get(address)!.push(uTxO);
    } else {
      this.uTxOs.set(address, [uTxO]);
    }
  }

  public filterUTxOutsForAddress(txIn: TxIn) {
    const { address, txOutId, txOutIndex } = txIn;
    const newUTxOs = this.getUTxOutsMapForAddress(address);
    newUTxOs.delete(txOutId + txOutIndex.toString());
    this.uTxOs.set(address, [...newUTxOs.values()]);
  }

  public setToNewUTxOuts(uTxOs: UTxOuts) {
    this.uTxOs.clear();
    uTxOs.forEach((uTxO) => this.setUTxOutForAddress(uTxO));
  }

  public processTxs(txs: Transactions, blockIndex: number) {
    if (!isTransactionsTypeValid(txs) || !this.isBlockTransactionsValid(txs, blockIndex)) {
      return false;
    }

    txs.forEach((tx) => {
      tx.txIns.forEach((txIn) => {
        this.filterUTxOutsForAddress(txIn);
      });
      tx.txOuts.forEach((txOut) => {
        this.setUTxOutForAddress(new UTxOut(tx.id, blockIndex, txOut.address, txOut.amount));
      });
    });

    return true;
  }

  public isTxInValid(txIn: TxIn, tx: Transaction) {
    const refUTxOut = this.getUTxOutFromTxIn(txIn);
    return refUTxOut && ec.keyFromPublic(refUTxOut.address, 'hex').verify(tx.id, txIn.signature);
  }

  public getTxInAmount(txIn: TxIn) {
    const { address, txOutId, txOutIndex } = txIn;
    return this.getUTxOutsMapForAddress(address).get(txOutId + txOutIndex.toString())?.amount ?? 0;
  }

  public isTransactionValid(tx: Transaction) {
    const { id, sender, receiver, txIns, txOuts } = tx;
    return (
      isTransactionTypeValid(tx) &&
      getTransactionId(tx) === id &&
      isAddressValid(sender) &&
      isAddressValid(receiver) &&
      txIns.every((txIn) => this.isTxInValid(txIn, tx)) &&
      txIns.reduce((acc, txIn) => acc + this.getTxInAmount(txIn), 0) === txOuts.reduce((acc, tx) => acc + tx.amount, 0)
    );
  }

  public isBlockTransactionsValid(transactions: Transactions, blockIndex: number) {
    const [coinbase, ...txs] = transactions;
    return (
      isCoinbaseTxValid(coinbase, blockIndex) &&
      !hasDuplicates(transactions.flatMap((tx) => tx.txIns)) &&
      txs.every((tx) => this.isTransactionValid(tx))
    );
  }
}

export const getTransactionId = (transaction: Transaction) => {
  const txInContent = transaction.txIns.reduce((acc, tx) => acc + (tx.txOutId + tx.txOutIndex.toString()), '');
  const txOutContent = transaction.txOuts.reduce((acc, tx) => acc + (tx.address + tx.amount.toString()), '');
  return sha256(txInContent + txOutContent);
};

export const getCoinbaseTransaction = (address: string, blockIndex: number) => {
  const txIn = new TxIn('', blockIndex, '', '');
  const txOut = new TxOut(address, COINBASE_AMOUNT);
  const transaction = new Transaction('', '', address, [txIn], [txOut]);
  transaction.id = getTransactionId(transaction);
  return transaction;
};

const hasDuplicates = (txIns: TxIns) => {
  const set = new Set<string>();
  for (const tx of txIns) {
    const key = tx.txOutId + tx.txOutIndex.toString();
    if (set.has(key)) return true;
    set.add(key);
  }
  return false;
};

const isCoinbaseTxValid = (transaction: Transaction, blockIndex: number) => {
  const { id, sender, receiver, txIns, txOuts } = transaction;
  return (
    transaction !== null &&
    txIns.length === 1 &&
    txOuts.length === 1 &&
    getTransactionId(transaction) === id &&
    sender === '' &&
    isAddressValid(receiver) &&
    txIns[0].txOutIndex === blockIndex &&
    txOuts[0].amount === COINBASE_AMOUNT
  );
};
