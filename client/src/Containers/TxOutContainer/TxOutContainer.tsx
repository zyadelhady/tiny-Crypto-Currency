import { FC, useContext } from 'react';
import { TxOut } from '../../Components/TxOut/TxOut';
import { Context } from '../../Context';
import { IUTxOut } from '../../types';
import { Blocks } from '../Blocks/Blocks';

export interface TxOutContainerProps {}

export const TxOutContainer: FC<TxOutContainerProps> = (props) => {
  const { uTxOuts } = useContext(Context);
  return <Blocks title={`My Unspent Transaction out`} data={uTxOuts} renderFn={renderUTxOut} />;
};

const renderUTxOut = (uTxOut: IUTxOut) => {
  return <TxOut key={uTxOut.txOutId + uTxOut.txOutIndex.toString()} {...uTxOut} />;
};
