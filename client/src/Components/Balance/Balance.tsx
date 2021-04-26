import React, { FC, useContext } from 'react';
import { Context } from '../../Context';
import classes from './Balance.module.scss';

export interface BalanceProps {}

export const Balance: FC<BalanceProps> = (props) => {
  const { balance } = useContext(Context);
  console.log(balance);
  return (
    <div className={classes.Container}>
      <h3>Balance</h3>
      <p>{balance}</p>
    </div>
  );
};
