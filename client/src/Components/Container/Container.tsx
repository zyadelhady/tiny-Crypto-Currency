import React, { FC } from 'react';
import classes from './Container.module.scss';

export interface ContainerProps {}

export const Container: FC<ContainerProps> = (props) => {
  return <div className={classes.container}>{props.children}</div>;
};
