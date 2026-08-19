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

      let houveAlerta = false;

      try {
        // CORREÇÃO 1: Passamos o `p.lowPrice` atual do banco para o scraping
        let producScrap = await scraping(p.url, p.lowPrice);

        if (!producScrap) continue; // Segurança caso o scraping falhe

        // Verifica se o preço atual mudou em relação ao banco
        if (producScrap.price !== p.price) {
          p.price = producScrap.price;
          houveAlerta = true;
        }

        // CORREÇÃO 2: Aproveitamos o lowPrice já tratado e calculado pela função scraping!
        if (producScrap.lowPrice !== undefined && producScrap.lowPrice !== p.lowPrice) {
          p.lowPrice = Number(producScrap.lowPrice);
          p.timestamp = producScrap.timestamp;
          ProdutosMenorPrecoHistórico.push({ ...p });
          houveAlerta = true;
        }

        // Lógica de Preço Desejado
        if (Number(producScrap.price) <= p.desiredPrice) {
          ProdutosPreçoDesejado.push({ ...p });
        }

        // Se houve qualquer alteração (preço ou lowPrice), atualiza no banco
        if (houveAlerta) {
          await updateMyListRepository(p.userId, p, p._id);
        }
        
        await sleep(1000);
      } catch (error) {
        console.error(`Erro ao processar ${p.title}:`, error);
      }
    }

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