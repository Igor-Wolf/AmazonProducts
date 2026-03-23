import z from"express";import G from"cors";import{Router as V}from"express";import{MongoClient as k,ObjectId as d}from"mongodb";import"dotenv/config";var P=process.env.MONGO_URI;if(!P)throw new Error("MONGO_URI n\xE3o definida no .env");var h=new k(P),y=null,u=async()=>y||(await h.connect(),y=h.db(process.env.DATABASE),console.log("\u{1F50B} Nova conex\xE3o com MongoDB estabelecida"),y),m=async e=>{try{let o=(await u()).collection(process.env.COLLECTION),t={_id:new d(e)},s=await o.findOne(t);if(!s){console.log("\u26A0\uFE0F Usu\xE1rio n\xE3o encontrado");return}return s}catch(r){throw console.error("\u274C Erro ao ler usu\xE1rio:",r),r}};async function w(e,r,o){let t=await m(e),s=o==="asc"?1:-1;if(t)try{let n=(await u()).collection(process.env.COLLECTIONPRODUCTS),c={userId:new d(t._id)};r&&(c.title={$regex:r,$options:"i"});let a=await n.find(c).sort({_id:s}).toArray();if(!a){console.log("\u26A0\uFE0F Usu\xE1rio n\xE3o encontrado");return}return a}catch(i){throw console.error("\u274C Erro ao ler usu\xE1rio:",i),i}}var v=async e=>{let t=await(await u()).collection(process.env.COLLECTIONPRODUCTS).insertOne(e);if(t)return{message:"created",_id:t.insertedId}},b=async(e,r,o)=>{let s=(await u()).collection(process.env.COLLECTIONPRODUCTS),{_id:i,userId:n,...c}=r;try{let a={userId:new d(e),_id:new d(o)};return(await s.updateOne(a,{$set:c})).matchedCount===1?{message:"updated"}:null}catch(a){console.error("Erro no Mongo:",a);return}},M=async(e,r)=>{let t=(await u()).collection(process.env.COLLECTIONPRODUCTS);try{let s={userId:new d(e),_id:new d(r)};return(await t.deleteOne(s)).deletedCount===1?{message:"deleted"}:null}catch(s){console.error("Error ",s);return}};var l=async e=>({statusCode:200,body:e});var g=async()=>({statusCode:204,body:null}),f=async()=>({statusCode:400,body:null});import{chromium as H}from"playwright";async function x(e){let r=await H.launch({headless:!0,slowMo:50}),t=await(await r.newContext()).newPage();try{let s=e;console.log("\u{1F680} Iniciando navega\xE7\xE3o..."),await t.goto(s,{waitUntil:"domcontentloaded"});try{let n=t.getByRole("button",{name:/continuar comprando/i});await n.isVisible({timeout:1e3})&&(console.log("\u{1F7E1} Clicando em continuar comprando..."),await n.click())}catch{}let i={title:await t.locator(".a-size-large.celwidget").innerText(),type:await t.locator('[aria-checked="true"] .slot-title span[aria-label]').innerText(),url:t.url(),img:await t.locator("#landingImage").getAttribute("src"),price:await t.locator(".a-size-base.a-color-price").innerText(),timestamp:new Date().toISOString()};return i.price=parseFloat(i.price.replace(/[^\d,]/g,"").replace(",",".")),console.log("\u2705 Dados coletados:",i),i}catch(s){console.error("\u274C Erro durante o scraping:",s)}finally{await r.close(),console.log("\u{1F512} Navegador encerrado.")}}var R=async(e,r,o)=>{let t=await w(e,r,o);return t?l(t):g()},C=async(e,r)=>{let o=await m(r);if(o){let t=await x(e.url);t.userId=o._id,t.desiredPrice=e.price,t.lowPrice=t.price;let s=await v(t);return l(s)}else return g()},L=async(e,r)=>{let o=null;if(e){let t=await b(r,e,e._id);t?o=await l(t):o=await f()}else o=await f();return o},O=async(e,r)=>{let o=null;if(e&&r){let t=await M(e,r);t?o=await l(t):o=await f()}else o=await f();return o};var S=async(e,r)=>{let o=e.headers.authorization,{title:t,order:s}=e.query,i=await R(o,t,s);r.status(i.statusCode).json(i.body)},E=async(e,r)=>{let o=e.body,t=e.headers.authorization,s=await C(o,t);r.status(s.statusCode).json(s.body)},D=async(e,r)=>{let o=e.headers.authorization,t=e.body,s=await L(t,o);r.status(s.statusCode).json(s.body)},T=async(e,r)=>{let o=e.headers.authorization,t=e.params.id,s=await O(o,t);r.status(s.statusCode).json(s.body)};import N from"nodemailer";var $=(e,r,o,t)=>{let s=i=>i.map(n=>`
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center;">
        <img src="${n.img}" alt="${n.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; color: #333;">${n.title}</h4>
          <p style="margin: 0; color: #333; font-weight: bold;">Atual: </p>
          <p style="margin: 0; color: #007bff; font-weight: bold;">R$ ${n.price.toFixed(2)}</p>
            <p style="margin: 0; color: #333; font-weight: bold;">Menor: </p>

          <p style="margin: 0; color:rgb(60, 255, 0); font-weight: bold;">R$ ${n.lowPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Desejado: </p>

          <p style="margin: 0; color:rgb(255, 218, 5); font-weight: bold;">R$ ${n.desiredPrice.toFixed(2)}</p>
                    <p style="margin: 0; color: #333; font-weight: bold;">Data menor pre\xE7o:  </p>

         <p style="margin: 0; color:rgb(255, 255, 255); font-weight: bold;">${new Date(n.timestamp).toLocaleDateString("pt-BR")}</p>

          <a href="${n.url}" style="font-size: 12px; color: #666; text-decoration: underline;">Ver produto</a>
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

            ${o.length>0?`
              <div class="product-section">
                <h3>Seu pre\xE7o escolhido</h3>
                ${s(o)}
              </div>
            `:""}

            ${t.length>0?`
              <div class="product-section">
                <h3>Menores pre\xE7os hist\xF3ricos</h3>
                ${s(t)}
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
`};var q=N.createTransport({service:"gmail",auth:{user:"programadorigorrb@gmail.com",pass:process.env.EMAIL_PASS},tls:{rejectUnauthorized:!1}}),A=async(e,r,o,t,s,i)=>{try{let n={from:'"Amazon Scrapler" <programadorigorrb@gmail.com>',to:e,subject:r,html:$(t,o,s,i)},c=await q.sendMail(n);return{message:"E-mail enviado com sucesso:'"}}catch(n){return{message:`Erro ao enviar e-mail: ${n}`}}};var B=e=>new Promise(r=>setTimeout(r,e)),I=async(e,r)=>{let o=await w(e,r,"desc"),t=await m(e);if(o){let s=[],i=[];for(let n of o){console.log(`Verificando produto: ${n.title}`);let c=!1;try{let a=await x(n.url);a.price!=n.price&&(n.price=a.price,c=!0),a.price<n.lowPrice&&(n.lowPrice=a.price,n.timestamp=a.timestamp,s.push({...n}),c=!0),a.price<=n.desiredPrice&&i.push({...n}),c&&await b(n.userId,n,n._id),await B(1e3)}catch(a){console.error(`Erro ao processar ${n.title}:`,a)}}return await A(t.email,"Produtos","www....",t.name,i,s),l({message:"Email Enviado"})}else return g()};var U=async(e,r)=>{let o=e.headers.authorization,{title:t}=e.query,s=await I(o,t);r.status(s.statusCode).json(s.body)};var p=V();p.get("/myList",S);p.post("/insertMyList",E);p.patch("/updateMyList",D);p.delete("/deleteMyList/:id",T);p.get("/allProductsEmail",U);var F=p;function Y(){let e=z();return e.use(z.json()),e.use(G({origin:"*",methods:["GET","POST","PATCH","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"]})),e.use("/api",F),e}var j=Y;var J=j(),_=process.env.PORT;J.listen(_,()=>{console.log(`Server is running at port ${_}`)});
