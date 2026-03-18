import express, { Request, Response } from "express";
import { deleteMyListService, insertMyListService, mylistService, updateMyListService } from "../services/products-service";


export const myList = async (req: Request, res: Response) => {
  const user = req.headers.authorization;
  const { title, order } = req.query
  const response = await mylistService(user, title , order);
  res.status(response.statusCode).json(response.body);
};

export const insertMyList = async (req: Request, res: Response) => {
  const bodyValue = req.body
  const user = req.headers.authorization;
  const response = await insertMyListService(bodyValue , user);
  res.status(response.statusCode).json(response.body);
 
};

export const updateMyList = async (req: Request, res: Response) => {
  const user = req.headers.authorization;
  const bodyValue = req.body;
  const response = await updateMyListService(bodyValue, user);
  res.status(response.statusCode).json(response.body);
  
};
export const deleteMyList = async (req: Request, res: Response) => {
  const user = req.headers.authorization;
  const id = req.params.id
  const response = await deleteMyListService(user, id);
  res.status(response.statusCode).json(response.body);
  
};