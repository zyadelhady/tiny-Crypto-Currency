import React, { FC, useState } from 'react';
import classes from './Blocks.module.scss';
import { AiOutlineArrowRight } from 'react-icons/ai';

export interface BlocksProps {
  title: string;
  data: any[];
  showLine?: boolean;
  renderFn: (el: any) => JSX.Element;
}

export const Blocks: FC<BlocksProps> = ({ title, data, renderFn, showLine = false }) => {
  const [cursor, setCursor] = useState(0);

  return (
    <>
      <h3 style={{ textAlign: 'center', paddingTop: '3rem', color: '#ffffff', fontSize: '2.5rem' }}>{title}</h3>
      <div className={classes.Container}>
        <button className={classes.Container_Arrow} onClick={() => setCursor((prev) => Math.max(0, prev - 2))}>
          <AiOutlineArrowRight transform="rotate(180)" />
        </button>
        <div className={[classes.Container_Blocks, showLine ? classes.Container_Blocks_After : ''].join(' ')}>
          {data.slice(cursor, cursor + 2).map(renderFn)}
        </div>
        <button
          className={classes.Container_Arrow}
          onClick={() => setCursor((prev) => Math.min(prev + 2, data.length - 2))}
        >
          <AiOutlineArrowRight />
        </button>
      </div>
    </>
  );
};
/////////////////