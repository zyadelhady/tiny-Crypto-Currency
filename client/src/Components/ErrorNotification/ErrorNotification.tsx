import React, { FC } from 'react';

import classes from './ErrorNotification.module.scss';

export interface ErrorNotificationProps {
  error: string;
}

export const ErrorNotification: FC<ErrorNotificationProps> = (props) => {
  return <div className={classes.Container}>{props.error}</div>;
};
