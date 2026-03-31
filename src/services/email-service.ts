import { ProductsFinalModel } from "../models/products-model";
import { User } from "../models/user-model";
import {
  mylistRepository,
  readUser,
  updateMyListRepository,
} from "../repositories/products-repository";
import { sendEmail2 } from "../utils/emailSender";
import { badRequest, noContent, ok } from "../utils/http-helper";
import { scraping } from "../utils/scraping";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const allProducstVerifyService = async (user: string, title: string) => {
  const database: ProductsFinalModel[] = await mylistRepository(
    user,
    title,
    "desc",
  );
  const userInfo: User = await readUser(user);

  if (database) {
    const ProdutosMenorPrecoHistórico = [];
    const ProdutosPreçoDesejado = [];

    for (const p of database) {
      console.log(`Verificando produto: ${p.title}`);

      // 1.  Flag
      let houveAlerta = false;

      try {
        let producScrap: ProductsFinalModel = await scraping(p.url);

        // Lógica de Preço Diferente
        if (producScrap.price != p.price) {
          p.price = producScrap.price;
          houveAlerta = true; // Caiu no segundo IF
        }
        // Lógica de Preço Menor que o Histórico
        if (producScrap.price < p.lowPrice) {
          p.lowPrice = producScrap.price;
          p.timestamp = producScrap.timestamp;
          ProdutosMenorPrecoHistórico.push({ ...p });

          houveAlerta = true; // Caiu no primeiro IF
        }

        // Lógica de Preço Desejado
        if (producScrap.price <= p.desiredPrice) {
          ProdutosPreçoDesejado.push({ ...p });
        }

        // 2. Flag no final da iteração
        if (houveAlerta) {
          await updateMyListRepository(p.userId, p, p._id);
        }
        await sleep(1000);
      } catch (error) {
        console.error(`Erro ao processar ${p.title}:`, error);
      }
    }
    // Não criou nada novo, apenas executou comandos.

    await sendEmail2(
      userInfo.email,
      "Produtos",
      "www....",
      userInfo.name,
      ProdutosPreçoDesejado,
      ProdutosMenorPrecoHistórico,
    );
    return ok({ message: "Email Enviado" });
  } else {
    return noContent();
  }
};
