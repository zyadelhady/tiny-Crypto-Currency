import { FC, useContext } from 'react';
import { Block } from '../../Components/Block/Block';
import { Context } from '../../Context';
import { Blocks } from '../Blocks/Blocks';
import { IBlock } from '../../types';

export interface BlockChainProps {}

export const BlockChain: FC<BlockChainProps> = (props) => {
  const { blockchain } = useContext(Context);
  return <Blocks data={blockchain} title="Block chain" renderFn={renderBlocks} showLine={true} />;
};

const renderBlocks = (block: IBlock) => {
  return <Block key={block.hash} {...block} />;
};
