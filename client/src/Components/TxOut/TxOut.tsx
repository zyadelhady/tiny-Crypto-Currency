import React, { FC } from 'react';
import { IUTxOut } from '../../types';
import classes from './TxOut.module.scss';

export interface TxOutProps {}

export const TxOut: FC<IUTxOut> = ({ txOutId, txOutIndex, amount }) => {
  return (
    <div className={classes.Container}>
      <p>
        Tx Id: {txOutId.slice(0, 10)}...{txOutId.slice(txOutId.length - 5, txOutId.length)}...
      </p>
      <p>Block index: {txOutIndex}</p>
      <p>Amount: {amount} coins</p>
    </div>
  );
};
