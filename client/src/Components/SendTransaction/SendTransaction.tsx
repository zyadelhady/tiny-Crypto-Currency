import { FC, useContext, useState } from 'react';
import { Button } from '../Button/Button';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';

import classes from './SendTransaction.module.scss';
import { Context } from '../../Context';

export interface SendTransactionProps {}

export const SendTransaction: FC<SendTransactionProps> = (props) => {
  const { handleSendTx } = useContext(Context);
  const [receiverAddress, setReceiverAddress] = useState(
    '04a6c6a65d7fde93ebeb90163227fab74d8bd298d7da059845ee4c4bc0aa6346520e39bf9929484b460796aa454eb0db6de5abdfc1f0023d63f36385073063f4c7'
  );
  const [amount, setAmount] = useState(0);

  return (
    <form
      className={classes.Container}
      onSubmit={(e) => {
        e.preventDefault();
        handleSendTx(receiverAddress, amount);
        console.log('pay');
      }}
    >
      <div className={classes.Container_Input}>
        <label>Receiver Address</label>
        <input
          id="receiver"
          type="text"
          defaultValue="040ecb63d6035a9425f859f8f1a8c0a06ef04004eb28085cf167c33dafa02c76cfe96a7bb29d6ab2681f5151cd34eb066d2dd4ff229551e1af6dd74c2f2ac1462c"
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
      </div>
      <div className={classes.Container_Input}>
        <label>Amount</label>
        <input id="amount" type="text" onChange={(e) => setAmount(+e.target.value > 0 ? +e.target.value : 0)} />
      </div>
      <div className={classes.Container_Submit}>
        <Button text={'Pay'}>
          <RiMoneyDollarCircleFill />
        </Button>
      </div>
    </form>
  );
};
