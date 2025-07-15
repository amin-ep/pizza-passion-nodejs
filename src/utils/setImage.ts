import { NextFunction, Request, Response } from "express";

export default async function setImageOnBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.file) {
    if (!req.body.imageUrl) req.body.imageUrl = req.file.filename;
  }
  next();
}
