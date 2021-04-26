import { FC, useContext } from 'react';
import { Button } from '../Button/Button';
import classes from './Mine.module.scss';
import { GiMiner } from 'react-icons/gi';
import { Context } from '../../Context';

export interface MineProps {}

export const Mine: FC<MineProps> = (props) => {
  const { handleMineBlock } = useContext(Context);

  const mine = async () => {
    handleMineBlock();
  };

  return (
    <div className={classes.Container}>
      <Button text={'mine Block'} onClick={mine}>
        <GiMiner />
      </Button>
      <h3>Every time you mine a block you get a 50 coin reward !</h3>
    </div>
  );
};
