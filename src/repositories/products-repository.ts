import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import "dotenv/config"; // Abrevia o dotenv.config()
import { User } from "../models/user-model";
import { ProductsModel } from "../models/name-model";
import { ProductsFinalModel } from "../models/products-model";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI não definida no .env");
}

const client = new MongoClient(uri);
let cachedDb: Db | null = null;

const connectDatabase = async (): Promise<Db> => {
  // Se já estiver conectado, retorna o DB
  if (cachedDb) return cachedDb;

  await client.connect();
  cachedDb = client.db(process.env.DATABASE);
  console.log("🔋 Nova conexão com MongoDB estabelecida");
  return cachedDb;
};

// -------------------------------------------------------- READ

export const readUser = async (id: string) => {
  try {
    const db = await connectDatabase();
    const collection: Collection = db.collection(process.env.COLLECTION);

    const filter = { _id: new ObjectId(id) };
    const result = await collection.findOne(filter);

    if (!result) {
      console.log("⚠️ Usuário não encontrado");
      return;
    }

    return result;
  } catch (error) {
    console.error("❌ Erro ao ler usuário:", error);
    throw error;
  }
};

export async function mylistRepository(
  user: string,
  title: string,
  order: string
): Promise<void> {
  const res: User = await readUser(user);

  const sort = order === "asc" ? 1 : -1;

  if (res) {
    try {
      const db = await connectDatabase();
      const collection: Collection = db.collection(
        process.env.COLLECTIONPRODUCTS,
      );

      const filter: any = { userId: new ObjectId(res._id) };
      if (title) {
        filter.title = {
          $regex: title, // contém
          $options: "i", // case-insensitive (opcional)
        };
      }
      const result = await collection.find(filter).sort({ _id: sort }).toArray();

      if (!result) {
        console.log("⚠️ Usuário não encontrado");
        return;
      }

      return result;
    } catch (error) {
      console.error("❌ Erro ao ler usuário:", error);
      throw error;
    }
  }
  return;
}

// -------------------------------------------------------- INSERT

export const insertProduct = async (value: ProductsModel) => {
  const db = await connectDatabase();
  const collection: Collection = db.collection(process.env.COLLECTIONPRODUCTS);

  const result = await collection.insertOne(value);

  if (result) {
    return {
      message: "created",
      _id: result.insertedId,
    };
  }
  return;
};

// -------------------------------------------------------- UPDATE

export const updateMyListRepository = async (
  user: string,
  bodyValue: ProductsFinalModel,
  id: string,
) => {
  const db = await connectDatabase();
  const collection: Collection = db.collection(
    process.env.COLLECTIONPRODUCTS as string,
  );

  const { _id, userId, ...updateData } = bodyValue as any;

  try {
    const filter = {
      userId: new ObjectId(user),
      _id: new ObjectId(id),
    };

    const result = await collection.updateOne(filter, { $set: updateData });

    if (result.matchedCount === 1) {
      return { message: "updated" };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro no Mongo:", error);
    return;
  }
};

// -------------------------------------------------------- DELETE

export const deleteMyListRepository = async (user: string, _id: string) => {
  
  const db = await connectDatabase(); 
  
  const collection = db.collection(process.env.COLLECTIONPRODUCTS as string);
    
  try {
    const filter = {
     
      userId: new ObjectId(user), 
      _id: new ObjectId(_id),
    };

    const result = await collection.deleteOne(filter);

    if (result.deletedCount === 1) {
      return { message: "deleted" };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error ", error);
    return;
  }
};