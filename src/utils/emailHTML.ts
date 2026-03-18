import { ProductsFinalModel } from "../models/products-model";

export const getAutenticateAccount = (
  userName: string,
  resetLink: string,
  listProducts1: ProductsFinalModel[],
  listProducts2: ProductsFinalModel[],
) => {
  // Função auxiliar para gerar o HTML de cada card de produto
  const renderProductList = (products: ProductsFinalModel[]) => {
    return products
      .map(
        (product) => `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center;">
        <img src="${product.img}" alt="${product.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${product.title}</h4>
          <p style="margin: 0; color: #333; font-weight: bold;">Atual: </p>
          <p style="margin: 0; color: #007bff; font-weight: bold;">R$ ${product.price.toFixed(2)}</p>
            <p style="margin: 0; color: #333; font-weight: bold;">Menor: </p>

          <p style="margin: 0; color:rgb(60, 255, 0); font-weight: bold;">R$ ${product.lowPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Desejado: </p>

          <p style="margin: 0; color:rgb(255, 218, 5); font-weight: bold;">R$ ${product.desiredPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Data menor preço:  </p>

         <p style="margin: 0; color:rgb(255, 255, 255); font-weight: bold;">${new Date(product.timestamp).toLocaleDateString('pt-BR')}</p>

          <a href="${product.url}" style="font-size: 12px; color: #666; text-decoration: underline;">Ver produto</a>
        </div>
      </div>
    `,
      )
      .join("");
  };

  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Produtos</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(90deg, #00dd8f, #007bff); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; color: #333; }
        .product-section { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; }
        .button { display: inline-block; background: linear-gradient(90deg, #00dd8f, #007bff); color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; }
        .footer { background-color: #f4f4f4; color: #666; text-align: center; padding: 15px; font-size: 13px; }
        h3 { color: #007bff; border-left: 4px solid #00dd8f; padding-left: 10px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Amazon Scraper</h1>
        </div>
        <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>Veja os produtos analisados para você:</p>          

            ${
              listProducts1.length > 0
                ? `
              <div class="product-section">
                <h3>Seu preço escolhido</h3>
                ${renderProductList(listProducts1)}
              </div>
            `
                : ""
            }

            ${
              listProducts2.length > 0
                ? `
              <div class="product-section">
                <h3>Menores preços históricos</h3>
                ${renderProductList(listProducts2)}
              </div>
            `
                : ""
            }

            <p style="font-size: 12px; color: #999; margin-top: 30px;">Se você não solicitou este contato, por favor ignore este e-mail.</p>
        </div>
        <div class="footer">
            <p>© 2026 Equipe Amazon Scraper</p>
        </div>
    </div>
</body>
</html>
`;
};
