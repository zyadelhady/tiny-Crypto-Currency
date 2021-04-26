import { FC } from 'react';
import classes from './Button.module.scss';

export interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = (props) => {
  return (
    <button className={classes.Button} onClick={props.onClick}>
      {props.children}
      <p>{props.text}</p>
    </button>
  );
};
