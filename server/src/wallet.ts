import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ec as EC } from 'elliptic';
import { getTransactionId, Transaction, TxIn, TxOut, UTxOuts } from './transaction';
import { p2pServer, txManager, txPool } from './instances';
import { toHexString } from './utils';

const ec = new EC('secp256k1');

const generatePrivateKey = () => {
  return ec.genKeyPair().getPrivate().toString(16);
};

export class Wallet {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(privateKeyPath: string) {
    if (existsSync(privateKeyPath)) {
      this.privateKey = readFileSync(privateKeyPath, 'utf-8');
    } else {
      this.privateKey = generatePrivateKey();
      writeFileSync(privateKeyPath, this.privateKey);
    }
    this.publicKey = ec.keyFromPrivate(this.privateKey, 'hex').getPublic().encode('hex', false);
  }

  public getPublicKey() {
    return this.publicKey;
  }

  public myUTxOuts() {
    return txManager.getUTxOutsArrayForAddress(this.publicKey);
  }

  public getBalance() {
    return this.myUTxOuts().reduce((sum, uTxO) => sum + uTxO.amount, 0);
  }

  private createTxOuts(receiverAddress: string, amount: number, leftOverAmount: number) {
    const txOut = new TxOut(receiverAddress, amount);
    return leftOverAmount === 0 ? [txOut] : [txOut, new TxOut(this.publicKey, leftOverAmount)];
  }

  private findTxOutsForAmount(amount: number) {
    let neededAmount = 0;
    const neededUTxOuts: UTxOuts = [];
    for (const myUTxO of this.filterTxPool()) {
      neededUTxOuts.push(myUTxO);
      neededAmount += myUTxO.amount;
      if (neededAmount >= amount) {
        return { neededUTxOuts, leftOverAmount: neededAmount - amount };
      }
    }
    throw new Error('Balance not enough');
  }

  private filterTxPool() {
    const myTxInsPool = txPool.getTxInsSetForAddress(this.publicKey);
    return this.myUTxOuts().filter((uTxO) => !myTxInsPool.has(uTxO.txOutId + uTxO.txOutIndex.toString()));
  }

  public signTxIn(txId: string, txIn: TxIn) {
    const refUTxOut = txManager.getUTxOutFromTxIn(txIn);
    if (!refUTxOut) throw new Error('Could not find referenced txOut.');
    if (this.publicKey !== refUTxOut.address) throw new Error();
    const key = ec.keyFromPrivate(this.privateKey, 'hex');
    const signature = toHexString(key.sign(txId).toDER());
    return signature;
  }

  public createTx(receiverAddress: string, amount: number) {
    const { neededUTxOuts, leftOverAmount } = this.findTxOutsForAmount(amount);
    const unsignedTxIns = neededUTxOuts.map(
      (uTxOut) => new TxIn(uTxOut.txOutId, uTxOut.txOutIndex, this.publicKey, '')
    );
    const tx = new Transaction(
      '',
      this.publicKey,
      receiverAddress,
      amount,
      unsignedTxIns,
      this.createTxOuts(receiverAddress, amount, leftOverAmount)
    );
    tx.id = getTransactionId(tx);

    tx.txIns.forEach((txIn) => {
      txIn.signature = this.signTxIn(tx.id, txIn);
    });

    return tx;
  }

  public sendTx(address: string, amount: number) {
    if (address === this.publicKey) throw new Error("you can't send coins to your self");

    const tx = this.createTx(address, amount);
    txPool.addToTxPool(tx);
    p2pServer.broadcastTransactionPool();
    return tx;
  }
}
