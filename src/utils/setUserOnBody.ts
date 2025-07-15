import { NextFunction, Request, Response } from 'express';

export default async function setUserOnBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
}
