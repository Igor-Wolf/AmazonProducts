import { chromium, Browser, BrowserContext, Page } from "playwright";

export async function scraping(urlPage: string): Promise<void> {
  // Inicializa o browser com tipagem explícita
  const browser: Browser = await chromium.launch({
    headless: true, // Mude para true em produção
    slowMo: 50, // Atraso de 50ms para podermos ver a ação (opcional)
  });

  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    let url = urlPage;
    console.log("🚀 Iniciando navegação...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    try {
      const continuar = page.getByRole("button", {
        name: /continuar comprando/i,
      });

      if (await continuar.isVisible({ timeout: 1000 })) {
        console.log("🟡 Clicando em continuar comprando...");
        await continuar.click();
      }
    } catch {}
    let data: ScrapedData = {};

    try {
      // 1. Aguarda o elemento mais estável (o título) com um tempo realista
      // Usamos o seletor que cobre tanto o ID padrão quanto a classe celwidget
      const titleLocator = page
        .locator("#productTitle, .a-size-large.celwidget")
        .first();
      await titleLocator.waitFor({ state: "attached", timeout: 3000 });

      // 2. Extração unificada
      // Tentamos capturar o preço de todos os seletores possíveis de uma vez
      const rawTitle = await titleLocator.innerText();

      // Buscamos o preço na ordem de prioridade
      const priceLocator = page
        .locator(
          [
            ".slot-price .a-color-price", // Preço de livros selecionado
            ".a-price-whole", // Preço padrão (parte inteira)
            ".a-size-base.a-color-price", // Preço simples
            "#price_inside_buybox", // Preço no box de compra
          ].join(", "),
        )
        .first();

      // Pegamos o texto bruto (usando textContent que é mais rápido e pega textos ocultos)
      const rawPrice = await priceLocator.textContent().catch(() => "0");

      // Tentamos pegar o tipo (Capa Comum, Kindle, etc)
      const rawType = await page
        .locator(
          '[aria-checked="true"] .slot-title, .swatchElement.selected .slot-title',
        )
        .first()
        .innerText({ timeout: 500 })
        .catch(() => "none");

      data = {
        title: rawTitle.trim(),
        type: rawType.trim().replace(/\n/g, ""), // Limpa quebras de linha
        url: page.url(),
        img: await page
          .locator("#landingImage, #imgBlkFront")
          .first()
          .getAttribute("src")
          .catch(() => ""),
        price: rawPrice || "0",
        timestamp: new Date().toISOString(),
      };

      // 3. Formatação Final (Regex Robusta)
      if (typeof data.price === "string") {
        // Remove tudo que não é número ou vírgula, trata a vírgula e converte
        const cleanPrice = data.price.replace(/[^\d,]/g, "").replace(",", ".");
        data.price = parseFloat(cleanPrice) || 0;
      }
    } catch (err) {
      console.error("Erro na extração:", err.message);
      data.title = data.title || "Erro ao carregar";
      data.price = 0;
      data.url = page.url();
    }

    console.log("✅ Dados coletados:", data);

    // Exemplo de interação (clique) caso houvesse um botão
    // await page.click('text=More information...');
    return data;
  } catch (error) {
    console.error("❌ Erro durante o scraping:", error as Error);
  } finally {
    await browser.close();
    console.log("🔒 Navegador encerrado.");
  }
}
