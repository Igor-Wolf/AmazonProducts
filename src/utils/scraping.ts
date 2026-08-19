import { chromium, Browser, BrowserContext, Page } from "playwright";

export interface ScrapedData {
  title?: string;
  type?: string;
  url?: string;
  img?: string;
  price?: number | string;
  lowPrice?: number | string; // Menor preço histórico registrado
  timestamp?: string;
}

export async function scraping(urlPage: string, previousLowPrice?: number): Promise<ScrapedData | void> {
  const browser: Browser = await chromium.launch({
    headless: true,
    slowMo: 50,
  });

  const context: BrowserContext = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "pt-BR",
    extraHTTPHeaders: {
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en-US;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    },
  });

  const page: Page = await context.newPage();
  let data: ScrapedData = {};

  try {
    let url = urlPage;
    console.log("🚀 Iniciando navegação...");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    try {
      const continuar = page.getByRole("button", {
        name: /continuar comprando/i,
      });

      if (await continuar.isVisible({ timeout: 1000 })) {
        console.log("🟡 Clicando em continuar comprando...");
        await continuar.click();
      }
    } catch {}

    try {
      const titleLocator = page
        .locator("#productTitle, .a-size-large.celwidget")
        .first();
      await titleLocator.waitFor({ state: "attached", timeout: 5000 });

      const rawTitle = await titleLocator.innerText();

      const priceLocator = page
        .locator([
          ".a-price",
          ".slot-price .a-color-price",
          "#price_inside_buybox",
        ].join(", "))
        .first();

      const rawPrice = await priceLocator.textContent().catch(() => "0");

      const rawType = await page
        .locator(
          '[aria-checked="true"] .slot-title, .swatchElement.selected .slot-title',
        )
        .first()
        .innerText({ timeout: 500 })
        .catch(() => "none");

      data = {
        title: rawTitle.trim(),
        type: rawType.trim().replace(/\n/g, ""),
        url: page.url(),
        img: await page
          .locator("#landingImage, #imgBlkFront")
          .first()
          .getAttribute("src")
          .catch(() => ""),
        price: rawPrice || "0",
        timestamp: new Date().toISOString(),
      };

      // Formatação Final do Preço Atual
      if (typeof data.price === "string") {
        const cleanPrice = data.price
          .replace(/[^\d.,]/g, "")
          .replace(/\.(?=\d{3})/g, "")
          .replace(",", ".");

        data.price = parseFloat(cleanPrice) || 0;
      }

      // -----------------------------------------------------------------
      // LÓGICA DO LOWPRICE CORRIGIDA PARA O BANCO ATUAL
      // -----------------------------------------------------------------
      const currentPrice = Number(data.price);
      let oldLowPrice = Number(previousLowPrice);

      // Se o preço atual for válido (> 0) e o histórico estiver zerado/inválido,
      // nós corrigimos o histórico na mesma hora usando o preço atual!
      if ((!oldLowPrice || oldLowPrice === 0) && currentPrice > 0) {
        oldLowPrice = currentPrice;
      }

      if (oldLowPrice === 0 || isNaN(oldLowPrice)) {
        data.lowPrice = currentPrice;
        console.log("🔄 LowPrice inicializado com o preço atual.");
      } else if (currentPrice > 0 && currentPrice < oldLowPrice) {
        data.lowPrice = currentPrice;
        console.log(`🎉 Novo menor preço encontrado! De R$ ${oldLowPrice} para R$ ${currentPrice}`);
      } else {
        data.lowPrice = oldLowPrice;
      }
      // -----------------------------------------------------------------

      if (data.price === 0) {
        console.warn("⚠️ Atenção: O preço veio zerado. Salvando evidências para debug...");
        const timestampDebug = Date.now();
        await page.screenshot({ path: `debug-preco-zero-${timestampDebug}.png`, fullPage: true });
      }

    } catch (err: any) {
      console.error("Erro na extração:", err.message);
      data.title = data.title || "Erro ao carregar";
      data.price = 0;
      data.lowPrice = previousLowPrice || 0; 
      data.url = page.url();
      
      await page.screenshot({ path: `debug-erro-${Date.now()}.png` }).catch(() => {});
    }

    console.log("✅ Dados coletados:", data);
    return data;

  } catch (error) {
    console.error("❌ Erro durante o scraping:", error as Error);
  } finally {
    await browser.close();
    console.log("🔒 Navegador encerrado.");
  }
}