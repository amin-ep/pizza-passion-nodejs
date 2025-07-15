/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from "express";
import { Model as MongooseModel } from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import { NotFound } from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";

type Filter = { user?: string; artist?: string };

export default class Factory<T extends Document> {
  constructor(protected Model: MongooseModel<T>) {}

  getAllDocuments = catchAsync(async (req: Request, res: Response) => {
    const filter: Filter = {};
    // @ts-ignore
    const features = new ApiFeatures(this.Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    const totalDocs = await this.Model.countDocuments();
    const totalPages = Math.ceil(totalDocs / 10);

    res.status(200).json({
      status: "success",
      result: docs.length,
      totalPages: totalPages,
      data: {
        docs,
      },
    });
  });

  createDocument = catchAsync(async (req: Request, res: Response) => {
    const newDoc = await this.Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        document: newDoc,
      },
    });
  });

  getDocumentById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const document = await this.Model.findById(req.params.id);

      if (!document) return next(new NotFound(`Invalid id: ${req.params.id}`));

      res.status(200).json({
        status: "success",
        data: {
          document,
        },
      });
    }
  );

  updateDocumentById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const updatedDoc = await this.Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

      if (!updatedDoc) {
        return next(new NotFound(`Invalid Id: ${req.params.id}`));
      }

      res.status(200).json({
        status: "success",
        data: {
          document: updatedDoc,
        },
      });
    }
  );

  deleteDocumentById = catchAsync(async (req: Request, res: Response) => {
    await this.Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}
