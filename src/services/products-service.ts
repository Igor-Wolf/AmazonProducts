import { ProductsFinalModel } from "../models/products-model";
import { deleteMyListRepository, insertProduct, mylistRepository, readUser, updateMyListRepository } from "../repositories/products-repository";
import { badRequest, noContent, ok } from "../utils/http-helper";
import { scraping } from "../utils/scraping";

export const mylistService = async (user : string ,title:string, order: string) => {
  const database = await mylistRepository(user, title, order) 
  if (database) {

    return ok(database);
  } else {
    return noContent();
  }
};

export const insertMyListService = async (bodyValue : any, user: string) => {
  const database = await readUser(user)   
  if (database) {


    let producScrap : ProductsFinalModel = await scraping(bodyValue.url)

    producScrap.userId = database._id
    producScrap.desiredPrice = bodyValue.price
    producScrap.lowPrice = producScrap.price
    const data =  await insertProduct(producScrap)
    
    return ok(data);
  } else {
    return noContent();
  }
};

export const updateMyListService = async (
  
  bodyValue: ProductsFinalModel,
  user: string
  
) => {
  let response = null;

  if (bodyValue) {
    
    const fullData = await updateMyListRepository(user, bodyValue, bodyValue._id);

    if (fullData) {
      response = await ok(fullData);
    } else {
      response = await badRequest();
    }
  } else {
    response = await badRequest();
  }

  return response;
};

export const deleteMyListService = async (
  
  user: string,
  id : string
  
) => {
  let response = null;
    

  if (user && id) {
    
    const fullData = await deleteMyListRepository(user, id);

    if (fullData) {
      response = await ok(fullData);
    } else {
      response = await badRequest();
    }
  } else {
    response = await badRequest();
  }

  return response;
};