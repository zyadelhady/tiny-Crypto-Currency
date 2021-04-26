import React, { FC } from 'react';
import { IBlock } from '../../types';
import classes from './Block.module.scss';

export const Block: FC<IBlock> = ({ data, hash, previousHash, index, timestamp, difficulty, nonce }) => {
  return (
    <div className={classes.Container}>
      <div className={classes.Container_Index}>
        <p>Index: {index}</p>
      </div>
      <div className={classes.Container_Hash}>
        <p>
          Hash: {hash.slice(0, 10)}...{hash.slice(hash.length - 5, hash.length)}
        </p>
      </div>
      <div className={classes.Container_PrevHash}>
        <p>
          Previous Hash: {previousHash.slice(0, 10)}...
          {previousHash.slice(previousHash.length - 5, previousHash.length)}
        </p>
      </div>
      <div className={classes.Container_Date}>
        <p>Date: {new Date(timestamp).toLocaleString()}</p>
      </div>
      <p>Number of Txs: {data.length}</p>
      <div className={classes.Container_Difficulty}>
        <p>Difficulty: {difficulty}</p>
      </div>
      <div className={classes.Container_Nonce}>
        <p>Nonce: {nonce}</p>
      </div>
    </div>
  );
};
