import { Request } from "express";
import multer from "multer";
import AppError from "./appError.js";
import { v4 as uuid } from "uuid";

const multerStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (err: AppError | Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split("/")[1];
    const fileOriginalName = file.originalname.split(".")[0];
    cb(null, `${fileOriginalName}-${uuid()}.${ext}`);
  },
});

const uploadFile = multer({
  storage: multerStorage,
});

export const uploadImageUrl = uploadFile.single("imageUrl");
