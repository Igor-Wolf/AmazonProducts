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

    // Extração de dados com tipagem
    const data: ScrapedData = {
      title: await page.locator(".a-size-large.celwidget").innerText(),
      type: await page
        .locator('[aria-checked="true"] .slot-title span[aria-label]')
        .innerText(),
      url: page.url(),
      img: await page.locator("#landingImage").getAttribute("src"),
      price: await page.locator(".a-size-base.a-color-price").innerText(),
      timestamp: new Date().toISOString(),
    };
    data.price = parseFloat(
      data.price.replace(/[^\d,]/g, "").replace(",", "."),
    );

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
