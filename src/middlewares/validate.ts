import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { BadRequest } from "../utils/appError.js";
import fs from "fs";

export default function validate(validator: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validator.parse(req.body);
      next();
    } catch (err) {
      if (req.file) {
        const addedFilename = req.file.filename;
        fs.unlink(`${process.cwd()}/uploads/${addedFilename}`, (err) => {
          console.log(err);
        });
      }

      if (err instanceof ZodError) {
        return next(new BadRequest(err.errors[0].message));
      }
    }
  };
}
