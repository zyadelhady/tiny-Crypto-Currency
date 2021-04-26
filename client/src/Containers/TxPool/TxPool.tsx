import { FC, useContext } from 'react';
import { TxPoolBlock } from '../../Components/TxPoolBlock/TxPoolBlock';

import { Context } from '../../Context';
import { ITransaction } from '../../types';
import { Blocks } from '../Blocks/Blocks';

export interface TxPoolProps {}

export const TxPool: FC<TxPoolProps> = (props) => {
  const { txPool } = useContext(Context);
  return <Blocks data={txPool} title="Transaction Pool" renderFn={renderTxs} />;
};

const renderTxs = (tx: ITransaction) => {
  return <TxPoolBlock key={tx.id} {...tx} />;
};
