import { txManager } from './instances';
import { Transaction, Transactions, TxIn } from './transaction';

export class TxPool {
  private readonly pool: Map<string, Transactions>;

  constructor() {
    this.pool = new Map();
  }

  public getTxsForAddress(address: string) {
    return this.pool.get(address) ?? [];
  }

  public getTxInsSetForAddress(address: string) {
    const set = new Set<string>();
    this.getTxsForAddress(address)
      .flatMap((tx) => tx.txIns)
      .forEach((txIn) => {
        set.add(txIn.txOutId + txIn.txOutIndex.toString());
      });
    return set;
  }

  public filterTxsFromTxIn(txIn: TxIn) {
    const { address } = txIn;
    const newTxs = this.getTxsForAddress(address).filter(() => !!txManager.getUTxOutFromTxIn(txIn));
    this.pool.set(address, newTxs);
  }

  public toTxsArray() {
    return [...this.pool.values()].flatMap((ts) =>
      ts.map((t) => new Transaction(t.id, t.sender, t.receiver, t.amount, [...t.txIns], [...t.txOuts]))
    );
  }

  public toTxInsArray() {
    return [...this.pool.values()].flatMap((txs) => txs.flatMap((tx) => tx.txIns));
  }

  public addToTxPool(tx: Transaction) {
    if (!txManager.isTransactionValid(tx) || !this.isTxValidForPool(tx)) {
      throw new Error('Trying to add invalid transaction to pool');
    }
    const { sender } = tx;
    if (this.pool.has(sender)) {
      this.pool.get(sender)!.push(tx);
    } else {
      this.pool.set(sender, [tx]);
    }
  }

  public updateTxPool() {
    this.toTxInsArray().forEach((txIn) => {
      this.filterTxsFromTxIn(txIn);
    });
  }

  private isTxValidForPool(tx: Transaction) {
    const myTxInsSet = this.getTxInsSetForAddress(tx.sender);
    return tx.txIns.every((txIn) => !myTxInsSet.has(txIn.txOutId + txIn.txOutIndex.toString()));
  }
}
