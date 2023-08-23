import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import log from "../utils/logger";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    log.warn("Validating...");
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      log.info("Validation completed");
      next();
    } catch (e: any) {
      return res.status(400).send(e.errors);
    }
  };

export default validateResource;
