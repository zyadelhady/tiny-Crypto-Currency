import React, { FC } from 'react';
import { Balance } from '../../Components/Balance/Balance';
import { SendTransaction } from '../../Components/SendTransaction/SendTransaction';

import classes from './CreateTransactionContainer.module.scss';

export interface CreateTransactionContainerProps {}

export const CreateTransactionContainer: FC<CreateTransactionContainerProps> = (props) => {
  return (
    <div className={classes.Container}>
      <Balance />
      <SendTransaction />
    </div>
  );
};
