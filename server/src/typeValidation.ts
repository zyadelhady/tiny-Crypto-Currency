import { Block } from './blockChain';
import { TxIn, TxOut, Transaction, Transactions } from './transaction';

export const isBlockTypeValid = (block: Block) => {
  return (
    typeof block.index === 'number' &&
    typeof block.hash === 'string' &&
    typeof block.previousHash === 'string' &&
    typeof block.timestamp === 'number' &&
    Array.isArray(block.data)
  );
};

const isTxInTypeValid = (txIn: TxIn) => {
  const { signature, txOutId, txOutIndex, address } = txIn;
  return (
    typeof signature === 'string' &&
    typeof txOutId === 'string' &&
    typeof txOutIndex === 'number' &&
    typeof address === 'string'
  );
};

const isTxOutTypeValid = (txOut: TxOut) => {
  const { address, amount } = txOut;
  return typeof address === 'string' && typeof amount === 'number' && isAddressValid(address);
};

export const isTransactionTypeValid = (transaction: Transaction) => {
  const { id, sender, receiver, txIns, txOuts } = transaction;
  return (
    typeof id === 'string' &&
    typeof sender === 'string' &&
    typeof receiver === 'string' &&
    Array.isArray(txIns) &&
    Array.isArray(txOuts) &&
    txIns.every((tx) => isTxInTypeValid(tx)) &&
    txOuts.every((tx) => isTxOutTypeValid(tx))
  );
};

export const isTransactionsTypeValid = (transactions: Transactions) => {
  return transactions.every((tx) => isTransactionTypeValid(tx));
};

export const isAddressValid = (address: string) => {
  return address.startsWith('04') && address.length === 130 && address.match('^[a-fA-F0-9]+$');
};
