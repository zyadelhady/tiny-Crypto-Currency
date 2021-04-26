import { FC } from 'react';
import { ITransaction } from '../../types';
import classes from './TxPoolBlock.module.scss';

export const TxPoolBlock: FC<ITransaction> = ({ id, sender, receiver, txOuts: [{ amount }] }) => {
  return (
    <div className={classes.Container}>
      <p>
        Tx id:{id.slice(0, 10)}...{id.slice(id.length - 5, id.length)}
      </p>
      <p>
        Sender: {sender.slice(0, 10)}...{sender.slice(sender.length - 5, sender.length)}
      </p>
      <p>
        Receiver: {receiver.slice(0, 10)}...{receiver.slice(receiver.length - 5, receiver.length)}
      </p>
      <p>Amount: {amount}</p>
    </div>
  );
};
