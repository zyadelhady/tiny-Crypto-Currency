export interface ITransaction {
  id: string;
  sender: string;
  receiver: string;
  txIns: TxIns;
  txOuts: TxOuts;
}

export interface ITxIn {
  txOutId: string;
  txOutIndex: number;
  address: string;
  signature: string;
}

export interface ITxOut {
  address: string;
  amount: number;
}

export interface IUTxOut {
  readonly txOutId: string;
  readonly txOutIndex: number;
  readonly address: string;
  readonly amount: number;
}

export interface IBlock {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  data: Transactions;
  difficulty: number;
  nonce: number;
}

export type Blockchain = IBlock[];
export type Transactions = ITransaction[];
export type TxIns = ITxIn[];
export type TxOuts = ITxOut[];
export type UTxOuts = IUTxOut[];
