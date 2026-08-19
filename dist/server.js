import _ from"express";import X from"cors";import{Router as Q}from"express";import{MongoClient as G,ObjectId as u}from"mongodb";import"dotenv/config";var M=process.env.MONGO_URI;if(!M)throw new Error("MONGO_URI n\xE3o definida no .env");var R=new G(M),b=null,g=async()=>b||(await R.connect(),b=R.db(process.env.DATABASE),console.log("\u{1F50B} Nova conex\xE3o com MongoDB estabelecida"),b),f=async e=>{try{let r=(await g()).collection(process.env.COLLECTION),o={_id:new u(e)},t=await r.findOne(o);if(!t){console.log("\u26A0\uFE0F Usu\xE1rio n\xE3o encontrado");return}return t}catch(s){throw console.error("\u274C Erro ao ler usu\xE1rio:",s),s}};async function h(e,s,r){let o=await f(e),t=r==="asc"?1:-1;if(o)try{let i=(await g()).collection(process.env.COLLECTIONPRODUCTS),c={userId:new u(o._id)};s&&(c.title={$regex:s,$options:"i"});let a=await i.find(c).sort({_id:t}).toArray();if(!a){console.log("\u26A0\uFE0F Usu\xE1rio n\xE3o encontrado");return}return a}catch(n){throw console.error("\u274C Erro ao ler usu\xE1rio:",n),n}}var C=async e=>{let o=await(await g()).collection(process.env.COLLECTIONPRODUCTS).insertOne(e);if(o)return{message:"created",_id:o.insertedId}},x=async(e,s,r)=>{let t=(await g()).collection(process.env.COLLECTIONPRODUCTS),{_id:n,userId:i,...c}=s;try{let a={userId:new u(e),_id:new u(r)};return(await t.updateOne(a,{$set:c})).matchedCount===1?{message:"updated"}:null}catch(a){console.error("Erro no Mongo:",a);return}},L=async(e,s)=>{let o=(await g()).collection(process.env.COLLECTIONPRODUCTS);try{let t={userId:new u(e),_id:new u(s)};return(await o.deleteOne(t)).deletedCount===1?{message:"deleted"}:null}catch(t){console.error("Error ",t);return}};var p=async e=>({statusCode:200,body:e});var y=async()=>({statusCode:204,body:null}),w=async()=>({statusCode:400,body:null});import{chromium as W}from"playwright";async function P(e,s){let r=await W.launch({headless:!0,slowMo:50}),t=await(await r.newContext({userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",viewport:{width:1366,height:768},locale:"pt-BR",extraHTTPHeaders:{"Accept-Language":"pt-BR,pt;q=0.9,en-US;q=0.8,en-US;q=0.7",Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"}})).newPage(),n={};try{let i=e;console.log("\u{1F680} Iniciando navega\xE7\xE3o..."),await t.goto(i,{waitUntil:"domcontentloaded",timeout:6e4});try{let c=t.getByRole("button",{name:/continuar comprando/i});await c.isVisible({timeout:1e3})&&(console.log("\u{1F7E1} Clicando em continuar comprando..."),await c.click())}catch{}try{let c=t.locator("#productTitle, .a-size-large.celwidget").first();await c.waitFor({state:"attached",timeout:5e3});let a=await c.innerText(),B=await t.locator([".a-price",".slot-price .a-color-price","#price_inside_buybox"].join(", ")).first().textContent().catch(()=>"0"),V=await t.locator('[aria-checked="true"] .slot-title, .swatchElement.selected .slot-title').first().innerText({timeout:500}).catch(()=>"none");if(n={title:a.trim(),type:V.trim().replace(/\n/g,""),url:t.url(),img:await t.locator("#landingImage, #imgBlkFront").first().getAttribute("src").catch(()=>""),price:B||"0",timestamp:new Date().toISOString()},typeof n.price=="string"){let v=n.price.replace(/[^\d.,]/g,"").replace(/\.(?=\d{3})/g,"").replace(",",".");n.price=parseFloat(v)||0}let d=Number(n.price),l=Number(s);if((!l||l===0)&&d>0&&(l=d),l===0||isNaN(l)?(n.lowPrice=d,console.log("\u{1F504} LowPrice inicializado com o pre\xE7o atual.")):d>0&&d<l?(n.lowPrice=d,console.log(`\u{1F389} Novo menor pre\xE7o encontrado! De R$ ${l} para R$ ${d}`)):n.lowPrice=l,n.price===0){console.warn("\u26A0\uFE0F Aten\xE7\xE3o: O pre\xE7o veio zerado. Salvando evid\xEAncias para debug...");let v=Date.now();await t.screenshot({path:`debug-preco-zero-${v}.png`,fullPage:!0})}}catch(c){console.error("Erro na extra\xE7\xE3o:",c.message),n.title=n.title||"Erro ao carregar",n.price=0,n.lowPrice=s||0,n.url=t.url(),await t.screenshot({path:`debug-erro-${Date.now()}.png`}).catch(()=>{})}return console.log("\u2705 Dados coletados:",n),n}catch(i){console.error("\u274C Erro durante o scraping:",i)}finally{await r.close(),console.log("\u{1F512} Navegador encerrado.")}}var S=async(e,s,r)=>{let o=await h(e,s,r);return o?p(o):y()},O=async(e,s)=>{let r=await f(s);if(r){let o=await P(e.url);o.userId=r._id,o.desiredPrice=e.price,o.lowPrice=o.price;let t=await C(o);return p(t)}else return y()},E=async(e,s)=>{let r=null;if(e){let o=await x(s,e,e._id);o?r=await p(o):r=await w()}else r=await w();return r},D=async(e,s)=>{let r=null;if(e&&s){let o=await L(e,s);o?r=await p(o):r=await w()}else r=await w();return r};var T=async(e,s)=>{let r=e.headers.authorization,{title:o,order:t}=e.query,n=await S(r,o,t);s.status(n.statusCode).json(n.body)},$=async(e,s)=>{let r=e.body,o=e.headers.authorization,t=await O(r,o);s.status(t.statusCode).json(t.body)},A=async(e,s)=>{let r=e.headers.authorization,o=e.body,t=await E(o,r);s.status(t.statusCode).json(t.body)},I=async(e,s)=>{let r=e.headers.authorization,o=e.params.id,t=await D(r,o);s.status(t.statusCode).json(t.body)};import K from"nodemailer";var U=(e,s,r,o)=>{let t=n=>n.map(i=>`
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center;">
        <img src="${i.img}" alt="${i.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${i.title}</h4>
          <p style="margin: 0; color: #333; font-weight: bold;">Atual: </p>
          <p style="margin: 0; color: #007bff; font-weight: bold;">R$ ${i.price.toFixed(2)}</p>
            <p style="margin: 0; color: #333; font-weight: bold;">Menor: </p>

          <p style="margin: 0; color:rgb(60, 255, 0); font-weight: bold;">R$ ${i.lowPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Desejado: </p>

          <p style="margin: 0; color:rgb(255, 218, 5); font-weight: bold;">R$ ${i.desiredPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Data menor pre\xE7o:  </p>

         <p style="margin: 0; color:rgb(255, 255, 255); font-weight: bold;">${new Date(i.timestamp).toLocaleDateString("pt-BR")}</p>

          <a href="${i.url}" style="font-size: 12px; color: #666; text-decoration: underline;">Ver produto</a>
        </div>
      </div>
    `).join("");return`
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
            <p>Ol\xE1, <strong>${e}</strong>!</p>
            <p>Veja os produtos analisados para voc\xEA:</p>          

            ${r.length>0?`
              <div class="product-section">
                <h3>Seu pre\xE7o escolhido</h3>
                ${t(r)}
              </div>
            `:""}

            ${o.length>0?`
              <div class="product-section">
                <h3>Menores pre\xE7os hist\xF3ricos</h3>
                ${t(o)}
              </div>
            `:""}

            <p style="font-size: 12px; color: #999; margin-top: 30px;">Se voc\xEA n\xE3o solicitou este contato, por favor ignore este e-mail.</p>
        </div>
        <div class="footer">
            <p>\xA9 2026 Equipe Amazon Scraper</p>
        </div>
    </div>
</body>
</html>
`};var Y=K.createTransport({service:"gmail",auth:{user:"programadorigorrb@gmail.com",pass:process.env.EMAIL_PASS},tls:{rejectUnauthorized:!1}}),z=async(e,s,r,o,t,n)=>{try{let i={from:'"Amazon Scrapler" <programadorigorrb@gmail.com>',to:e,subject:s,html:U(o,r,t,n)},c=await Y.sendMail(i);return{message:"E-mail enviado com sucesso:'"}}catch(i){return{message:`Erro ao enviar e-mail: ${i}`}}};var J=e=>new Promise(s=>setTimeout(s,e)),F=async(e,s)=>{let r=await h(e,s,"desc"),o=await f(e);if(r){let t=[],n=[];for(let i of r){console.log(`Verificando produto: ${i.title}`);let c=!1;try{let a=await P(i.url,i.lowPrice);if(!a)continue;a.price!==i.price&&(i.price=a.price,c=!0),a.lowPrice!==void 0&&a.lowPrice!==i.lowPrice&&(i.lowPrice=Number(a.lowPrice),i.timestamp=a.timestamp,t.push({...i}),c=!0),Number(a.price)<=i.desiredPrice&&n.push({...i}),c&&await x(i.userId,i,i._id),await J(1e3)}catch(a){console.error(`Erro ao processar ${i.title}:`,a)}}return await z(o.email,"Produtos","www....",o.name,n,t),p({message:"Email Enviado"})}else return y()};var N=async(e,s)=>{let r=e.headers.authorization,{title:o}=e.query,t=await F(r,o);s.status(t.statusCode).json(t.body)};var m=Q();m.get("/myList",T);m.post("/insertMyList",$);m.patch("/updateMyList",A);m.delete("/deleteMyList/:id",I);m.get("/allProductsEmail",N);var k=m;function Z(){let e=_();return e.use(_.json()),e.use(X({origin:"*",methods:["GET","POST","PATCH","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"]})),e.use("/api",k),e}var j=Z;var ee=j(),q=process.env.PORT;ee.listen(q,()=>{console.log(`Server is running at port ${q}`)});
