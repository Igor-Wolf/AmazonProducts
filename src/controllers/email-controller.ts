import express, { Request, Response } from "express";
import { allProducstVerifyService } from "../services/email-service";


export const allProducstVerify = async (req: Request, res: Response) => {
  const user = req.headers.authorization;
  const { title } = req.query  
  const response = await allProducstVerifyService(user, title);
  res.status(response.statusCode).json(response.body);
};