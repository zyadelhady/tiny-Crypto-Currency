import { ErrorRequestHandler } from 'express';
export const globalErrorHandler: ErrorRequestHandler = (err: Error, _req, res, next) => {
  console.log(err);
  res.status(400).json({ message: err.message });
  next();
};
