module.exports=[94779,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(50944),e=a.i(71133),f=a.i(7963),g=a.i(41146),h=a.i(52562),i=a.i(55486),j=a.i(71094),k=a.i(78394),l=a.i(86708),m=a.i(78542),n=a.i(64267),o=a.i(80447),p=a.i(87751),q=a.i(92965),r=a.i(71985),s=a.i(63145),t=a.i(54098),u=a.i(18056),v=a.i(64831);let w=(0,v.default)("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);var x=a.i(5091),y=a.i(74215);let z=(0,v.default)("moon",[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]),A=(0,v.default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),B=(0,v.default)("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);a.i(45470);let C=null;function D({preferenceId:a,onError:d}){let e=(0,c.useRef)(null),f=(0,c.useRef)(null);return((0,c.useEffect)(()=>{if(!a)return;let b=!1,c=null;return(C||(C=new Promise((a,b)=>{if(window.MercadoPago)return void a(window.MercadoPago);let c=document.createElement("script");c.src="https://sdk.mercadopago.com/js/v2",c.onload=()=>a(window.MercadoPago),c.onerror=b,document.head.appendChild(c)}))).then(g=>{if(b||!e.current)return;let h=new g(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,{locale:"es-MX"}).bricks();e.current&&(e.current.innerHTML=""),h.create("wallet","mp-wallet-container",{initialization:{preferenceId:a},callbacks:{onError:a=>{console.error("MP Wallet error",a),!b&&d&&d(a)}}}).then(a=>{b?a.unmount():(c=a,f.current=a)})}).catch(a=>{console.error("Failed to load MP SDK",a),!b&&d&&d(a)}),()=>{b=!0,c&&c.unmount()}},[a]),a)?(0,b.jsx)("div",{children:(0,b.jsx)("div",{id:"mp-wallet-container",ref:e,style:{minHeight:60}})}):null}let E=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,F=[{id:"short",label:"1–6 km",fee:50,icon:(0,b.jsx)(t.MapPin,{size:16})},{id:"long",label:"6–10 km",fee:80,icon:(0,b.jsx)(u.Truck,{size:16})},{id:"night",label:"Nocturno (>8 pm)",fee:100,icon:(0,b.jsx)(z,{size:16})}],G=function(){let a=[];for(let b=9;b<=18;b++)for(let c=0;c<60;c+=30){if(18===b&&c>0)continue;let d=String(c).padStart(2,"0"),e=b,f="AM";b>=12&&(f="PM",b>12&&(e=b-12));let g=`${e}:${d} ${f}`;a.push({value:g,label:g})}return a}(),H=`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-preference`;function I({product:a,onClose:d,quantity:e=1}){c.default.useEffect(()=>(document.body.style.overflow="hidden",()=>{document.body.style.overflow=""}),[]);let[f,g]=(0,c.useState)("pickup"),[h,i]=(0,c.useState)("short"),[j,k]=(0,c.useState)(""),[l,m]=(0,c.useState)(""),[n,o]=(0,c.useState)(""),[p,q]=(0,c.useState)(!1),[r,s]=(0,c.useState)(""),[v,w]=(0,c.useState)(null),[x,z]=(0,c.useState)(null),C=!1!==a.delivery_enabled,J=F.find(a=>a.id===h),K=J?.fee||50;async function L(b){q(!0),s(""),z(b);try{let c=await fetch(H,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${E}`,apikey:E},body:JSON.stringify({payment_type:b,product_id:a.id,product_name:a.name,product_price:a.price,quantity:e,delivery_zone:"delivery"===f?h:null,delivery_fee:"delivery"===f?K:0,delivery_type:f,customer_name:j.trim(),customer_phone:l.trim()})});if(!c.ok){let a=await c.json().catch(()=>({}));throw Error(a.error||`Error ${c.status}`)}let{preference_id:d}=await c.json();w(d)}catch(a){s(a.message||"No se pudo iniciar el pago. Intenta de nuevo.")}finally{q(!1)}}let M=a.price*e,N=M+("delivery"===f?K:0),O=j.trim().length>=2&&l.trim().length>=8&&("delivery"===f?!!h:!!n);return(0,b.jsx)("div",{className:"modal-overlay",onClick:d,children:(0,b.jsxs)("div",{className:"modal-box co-modal",style:{paddingBottom:"env(safe-area-inset-bottom)"},onClick:a=>a.stopPropagation(),children:[(0,b.jsxs)("div",{className:"co-header",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"co-header-label",children:a.name}),(0,b.jsx)("h3",{className:"co-header-title",children:"Finalizar compra"})]}),(0,b.jsx)("button",{className:"co-close","aria-label":"Cerrar modal de pago",onClick:d,children:(0,b.jsx)(y.X,{size:20})})]}),v?(0,b.jsxs)("div",{className:"co-body animate-fade-in",children:[(0,b.jsxs)("div",{className:"co-recap",children:[(0,b.jsx)("p",{className:"co-recap-name",children:a.name}),(0,b.jsx)("p",{className:"co-recap-sub",children:"deposit"===x?`🔒 Anticipo de env\xedo \xb7 $${K} MXN`:`💳 Pago total \xb7 $${N.toLocaleString("es-MX")} MXN`})]}),(0,b.jsx)("p",{style:{fontSize:"0.85rem",color:"var(--text-muted)",marginBottom:12,lineHeight:1.5},children:"deposit"===x?`El producto ($${a.price.toLocaleString("es-MX")} MXN) se paga en efectivo al recibirlo. Sin excepciones.`:"Al recibir el producto no necesitas efectivo. ✅"}),(0,b.jsx)(D,{preferenceId:v,onError:a=>s("Error al cargar el botón de pago. "+(a?.message||""))}),r&&(0,b.jsxs)("div",{className:"co-error",style:{marginTop:12},children:["⚠️ ",r]}),(0,b.jsx)("button",{type:"button",className:"co-back-link",onClick:()=>{w(null),s(""),z(null)},children:"← Volver a opciones de pago"})]}):(0,b.jsxs)("div",{className:"co-body animate-fade-in",children:[(0,b.jsx)("div",{className:"co-section-title",children:"1. ¿A quién le entregamos?"}),(0,b.jsx)("div",{className:"input-group",children:(0,b.jsx)("input",{id:"co-name",className:"input",required:!0,placeholder:"Nombre completo (Ej: Juan García)",value:j,onChange:a=>k(a.target.value)})}),(0,b.jsx)("div",{className:"input-group",children:(0,b.jsx)("input",{id:"co-phone",className:"input",required:!0,type:"tel",placeholder:"WhatsApp / Teléfono (Ej: 998 123 4567)",value:l,onChange:a=>m(a.target.value)})}),C&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"co-section-title",style:{marginTop:12},children:"2. ¿Cómo lo quieres recibir?"}),(0,b.jsxs)("div",{className:"co-delivery-opts",children:[(0,b.jsxs)("button",{type:"button",id:"co-opt-pickup",className:`co-delivery-opt ${"pickup"===f?"co-delivery-opt-active":""}`,onClick:()=>g("pickup"),children:[(0,b.jsx)(t.MapPin,{size:20}),(0,b.jsx)("span",{children:"Recolección"}),(0,b.jsx)("small",{children:"Región 96, Cancún"})]}),(0,b.jsxs)("button",{type:"button",id:"co-opt-delivery",className:`co-delivery-opt ${"delivery"===f?"co-delivery-opt-active":""}`,onClick:()=>g("delivery"),children:[(0,b.jsx)(u.Truck,{size:20}),(0,b.jsx)("span",{children:"Envío a domicilio"}),(0,b.jsx)("small",{children:"Desde $50 MXN"})]})]})]}),!C&&(0,b.jsx)("div",{className:"co-info-box",style:{marginTop:12},children:(0,b.jsxs)("p",{children:["📍 Este producto solo está disponible para ",(0,b.jsx)("strong",{children:"recolección en tienda"})," (Región 96, Cancún)."]})}),"delivery"===f?(0,b.jsxs)("div",{className:"co-zones animate-fade-in",children:[(0,b.jsx)("div",{className:"co-section-title",children:"Selecciona tu zona de envío"}),F.map(a=>(0,b.jsxs)("button",{type:"button",id:`co-zone-${a.id}`,className:`co-zone-opt ${h===a.id?"co-zone-opt-active":""}`,onClick:()=>i(a.id),children:[(0,b.jsx)("span",{className:"co-zone-icon",children:a.icon}),(0,b.jsx)("span",{className:"co-zone-label",children:a.label}),(0,b.jsxs)("span",{className:"co-zone-fee",children:["+ $",a.fee," MXN"]})]},a.id))]}):(0,b.jsxs)("div",{className:"animate-fade-in",children:[(0,b.jsx)("div",{className:"co-section-title",style:{marginTop:8},children:"¿A qué hora pasas a recoger?"}),(0,b.jsx)("div",{className:"co-select-wrapper",children:(0,b.jsxs)("select",{id:"co-pickup-time-select",className:"co-select",value:n,onChange:a=>o(a.target.value),"aria-label":"Selecciona un horario de recogida",children:[(0,b.jsx)("option",{value:"",children:"-- Elige un horario (9 AM - 6 PM) --"}),G.map(a=>(0,b.jsx)("option",{value:a.value,children:a.label},a.value))]})})]}),(0,b.jsxs)("div",{className:`co-payment-section ${O?"ready":"locked"}`,children:[(0,b.jsx)("div",{className:"co-section-title",style:{marginTop:12},children:"3. ¿Cómo prefieres pagar?"}),!O&&(0,b.jsx)("div",{className:"co-locked-msg",children:"Completa tus datos y opciones de entrega arriba para ver los métodos de pago."}),O&&r&&(0,b.jsxs)("div",{className:"co-error",children:["⚠️ ",r]}),O&&"pickup"===f&&(0,b.jsxs)("div",{className:"animate-fade-in",children:[(0,b.jsxs)("div",{className:"co-info-box",style:{marginBottom:12},children:[(0,b.jsxs)("p",{children:["📍 ",(0,b.jsx)("strong",{children:"Dirección:"})," Región 96, Cancún"]}),(0,b.jsxs)("p",{style:{marginTop:6},children:["📞 Te enviaremos nuestra ubicación exacta y teléfono por ",(0,b.jsx)("strong",{children:"WhatsApp"})," al confirmar tu pedido."]})]}),(0,b.jsxs)("button",{id:"co-pickup-confirm-btn",className:"btn btn-teal",style:{width:"100%",padding:"14px 20px",fontSize:"1rem"},disabled:!n,onClick:()=>{let b=encodeURIComponent(`🛒 \xa1Hola Bazarito! Quiero apartar el producto:
"${a.name}"${e>1?` x${e}`:""} ($${M.toLocaleString("es-MX")} MXN)

👤 Nombre: ${j.trim()}
📱 Tel\xe9fono: ${l.trim()}
⏰ Hora de recogida: ${n}

\xbfMe puedes confirmar la direcci\xf3n exacta? \xa1Gracias!`);window.open(`https://wa.me/529543388332?text=${b}`,"_blank"),d()},children:["✅ Pagar en efectivo al recoger ($",M.toLocaleString("es-MX")," MXN)"]})]}),O&&"delivery"===f&&(0,b.jsxs)("div",{className:"animate-fade-in",children:[(0,b.jsxs)("div",{className:"co-pay-card",children:[(0,b.jsxs)("div",{className:"co-pay-card-header",children:[(0,b.jsx)(A,{size:20,className:"co-pay-icon-green"}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("p",{className:"co-pay-card-title",children:["Reserva tu envío — $",K," MXN"]}),(0,b.jsx)("p",{className:"co-pay-card-sub",children:"Paga ahora solo el costo de envío por Mercado Pago"})]})]}),(0,b.jsxs)("div",{className:"co-pay-terms",children:["✅ ",(0,b.jsx)("strong",{children:"Paga el resto en efectivo"})," directo a tu repartidor al recibir tu pedido ($",M.toLocaleString("es-MX")," MXN)."]}),(0,b.jsx)("button",{id:"co-pay-deposit-btn",className:"btn btn-teal",style:{width:"100%",marginTop:10},disabled:p,onClick:()=>L("deposit"),children:p&&"deposit"===x?"Preparando pago...":`🔒 Pagar anticipo de env\xedo \xb7 $${K} MXN`})]}),(0,b.jsxs)("div",{className:"co-pay-card co-pay-card-alt",style:{marginTop:12},children:[(0,b.jsxs)("div",{className:"co-pay-card-header",children:[(0,b.jsx)(B,{size:20,className:"co-pay-icon-blue"}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("p",{className:"co-pay-card-title",children:["Pago total — $",N.toLocaleString("es-MX")," MXN"]}),(0,b.jsx)("p",{className:"co-pay-card-sub",children:"Producto + envío, todo por Mercado Pago"})]})]}),(0,b.jsx)("button",{id:"co-pay-full-btn",className:"btn btn-blue",style:{width:"100%",marginTop:10},disabled:p,onClick:()=>L("full"),children:p&&"full"===x?"Preparando pago...":`💳 Pagar todo ahora \xb7 $${N.toLocaleString("es-MX")} MXN`})]})]})]})]}),(0,b.jsx)("style",{children:`
          .co-modal {
            width: 100%; max-width: 440px;
            max-height: 92vh; overflow-y: auto;
          }
          .co-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 20px 20px 0;
          }
          .co-header-label {
            font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.07em; color: var(--teal); margin-bottom: 2px;
          }
          .co-header-title {
            font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
            color: var(--text-primary); line-height: 1.2;
          }
          .co-close {
            width: 34px; height: 34px; flex-shrink: 0;
            background: var(--bg-muted); border: none; border-radius: var(--radius-full);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer;
            transition: all var(--dur-fast);
          }
          .co-close:hover { background: var(--border); }
          .co-body {
            padding: 16px 20px 24px;
            display: flex; flex-direction: column; gap: 14px;
          }
          .co-section-title {
            font-size: 0.8rem; font-weight: 800;
            color: var(--text-primary);
          }
          .co-payment-section {
            transition: all 0.3s ease;
          }
          .co-payment-section.locked {
            opacity: 0.5; pointer-events: none;
          }
          .co-locked-msg {
            background: var(--bg-muted); border: 1.5px dashed var(--border);
            padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem;
            color: var(--text-muted); text-align: center; margin-top: 8px;
          }
          
          /* Delivery options */
          .co-delivery-opts {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          }
          .co-delivery-opt {
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            padding: 14px 10px;
            border: 2px solid var(--border); border-radius: var(--radius-md);
            background: var(--bg-card); cursor: pointer;
            transition: all var(--dur-fast); text-align: center;
            color: var(--text-secondary); font-weight: 600; font-size: 0.9rem;
          }
          .co-delivery-opt small {
            font-size: 0.72rem; font-weight: 400; color: var(--text-muted);
          }
          .co-delivery-opt:hover { border-color: var(--teal); background: #E8F4F3; }
          .co-delivery-opt-active {
            border-color: var(--teal) !important;
            background: #E8F4F3 !important; color: var(--teal-dark) !important;
          }
          /* Zone selector */
          .co-zones { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
          .co-zone-opt {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 14px;
            border: 2px solid var(--border); border-radius: var(--radius-md);
            background: var(--bg-card); cursor: pointer;
            transition: all var(--dur-fast); text-align: left;
            font-size: 0.88rem; font-weight: 600; color: var(--text-secondary);
          }
          .co-zone-opt:hover { border-color: var(--teal); }
          .co-zone-opt-active { border-color: var(--teal) !important; background: #E8F4F3 !important; color: var(--teal-dark) !important; }
          .co-zone-icon { color: var(--teal); display: flex; }
          .co-zone-label { flex: 1; }
          .co-zone-fee { font-family: var(--font-display); font-weight: 800; color: var(--teal-dark); }
          /* Pickup time dropdown */
          .co-select-wrapper {
            position: relative;
            width: 100%;
            margin-top: 8px;
          }
          .co-select {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: var(--radius-md);
            cursor: pointer;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .co-select:focus {
            border-color: var(--teal);
            box-shadow: 0 0 0 3px rgba(26, 122, 109, 0.15);
          }
          .co-select-wrapper::after {
            content: '';
            position: absolute;
            right: 16px;
            top: 50%;
            width: 8px;
            height: 8px;
            border-right: 2px solid var(--text-secondary);
            border-bottom: 2px solid var(--text-secondary);
            pointer-events: none;
            transform: translateY(-70%) rotate(45deg);
            transition: border-color 0.2s ease;
          }
          .co-select-wrapper:focus-within::after {
            border-color: var(--teal);
          }
          /* Recap bar */
          .co-recap {
            padding: 12px 14px; background: var(--bg-muted);
            border-radius: var(--radius-md); border: 1.5px solid var(--border);
          }
          .co-recap-name { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
          .co-recap-sub  { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
          /* Payment cards */
          .co-pay-card {
            padding: 16px; border: 2px solid var(--border);
            border-radius: var(--radius-md); background: var(--bg-card);
            display: flex; flex-direction: column; gap: 10px;
          }
          .co-pay-card-alt { border-color: #BBDEFB; background: #F0F8FF; }
          .co-pay-card-header { display: flex; align-items: flex-start; gap: 10px; }
          .co-pay-card-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
          .co-pay-card-sub   { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
          .co-pay-icon-green { color: #2E7D32; flex-shrink: 0; margin-top: 2px; }
          .co-pay-icon-blue  { color: #1565C0; flex-shrink: 0; margin-top: 2px; }
          .co-pay-terms {
            font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;
            background: var(--bg-muted); padding: 10px 12px; border-radius: var(--radius-sm);
          }
          .co-pay-breakdown {
            display: grid; grid-template-columns: 1fr auto;
            gap: 4px 12px; font-size: 0.82rem; color: var(--text-secondary);
            padding: 8px 12px; background: var(--bg-muted); border-radius: var(--radius-sm);
          }
          .co-pay-total-label { font-weight: 700; color: var(--text-primary); padding-top: 4px; border-top: 1px solid var(--border); }
          .co-pay-total-val   { font-family: var(--font-display); font-weight: 800; color: var(--teal-dark); padding-top: 4px; border-top: 1px solid var(--border); }
          /* Info box */
          .co-info-box {
            font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;
            padding: 14px; background: var(--bg-muted);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          /* Error */
          .co-error {
            background: #FFEBEE; border: 1.5px solid #EF9A9A;
            border-radius: var(--radius-md); padding: 10px 14px;
            font-size: 0.85rem; color: #C62828; font-weight: 600;
          }
          /* Blue button (for full payment) */
          .btn-blue {
            background: #1565C0; color: white; display: flex; align-items: center;
            justify-content: center; gap: 8px; padding: 14px 20px;
            border-radius: var(--radius-md); font-weight: 700; font-size: 0.95rem;
            border: none; cursor: pointer; transition: all var(--dur-fast);
          }
          .btn-blue:hover:not(:disabled) { background: #0D47A1; transform: translateY(-1px); }
          .btn-blue:disabled { opacity: 0.6; cursor: not-allowed; }
          /* Back link */
          .co-back-link {
            background: none; border: none; color: var(--text-muted);
            font-size: 0.82rem; font-weight: 600; cursor: pointer;
            text-align: center; padding: 4px; margin-top: 12px;
            transition: color var(--dur-fast);
            display: block; width: 100%;
          }
          .co-back-link:hover { color: var(--teal); }
        `})]})})}let J={hogar:{bg:"#FFF3E0",icon:i.Home},gadgets:{bg:"#E8F5E9",icon:j.Plug},mascotas:{bg:"#FCE4EC",icon:k.PawPrint},bienestar:{bg:"#EDE7F6",icon:l.Sparkles},ofertas:{bg:"#FFF8E1",icon:m.Flame},muebles:{bg:"#E3F2FD",icon:n.Armchair},electronica:{bg:"#F3E5F5",icon:o.Smartphone},personal:{bg:"#FFF0F5",icon:p.Shirt}};function K({images:a,placeholder:d}){let[h,i]=(0,c.useState)(0),[j,k]=(0,c.useState)(!1),l=a.length>1;return((0,c.useEffect)(()=>{k(!1)},[h,a]),0===a.length||j)?(0,b.jsx)("div",{className:"plp-gallery-empty",style:{background:d.bg,color:"rgba(0,0,0,0.2)"},children:c.default.createElement(d.icon,{size:64,strokeWidth:1.5})}):(0,b.jsxs)("div",{className:"plp-gallery",children:[(0,b.jsx)(e.default,{src:a[h],alt:`Foto ${h+1}`,className:"plp-gallery-img",fill:!0,sizes:"(max-width: 768px) 100vw, 500px",quality:90,priority:0===h,style:{objectFit:"cover"},onError:()=>k(!0)},h),l&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{type:"button",className:"plp-arrow plp-left",onClick:b=>{b.stopPropagation(),b.preventDefault(),i(b=>(b-1+a.length)%a.length)},"aria-label":"Foto anterior",children:(0,b.jsx)(f.ChevronLeft,{size:24})}),(0,b.jsx)("button",{type:"button",className:"plp-arrow plp-right",onClick:b=>{b.stopPropagation(),b.preventDefault(),i(b=>(b+1)%a.length)},"aria-label":"Siguiente foto",children:(0,b.jsx)(g.ChevronRight,{size:24})}),(0,b.jsx)("div",{className:"plp-dots",children:a.map((a,c)=>(0,b.jsx)("button",{type:"button",className:`plp-dot ${c===h?"plp-dot-active":""}`,onClick:a=>{a.stopPropagation(),a.preventDefault(),i(c)},"aria-label":`Ver foto ${c+1}`},c))})]})]})}a.s(["default",0,function({product:a}){(0,d.useRouter)();let[e,f]=(0,c.useState)(!1),[g,i]=(0,c.useState)(!1),[j,k]=(0,c.useState)(1);async function l(){let b=`${window.location.origin}/p/${a.slug||a.id}`;if(navigator.share)try{await navigator.share({title:`${a?.name} | Bazarito Canc\xfan`,url:b});return}catch(a){if("AbortError"===a.name)return;console.error("Error sharing:",a)}let c=!1;if(navigator.clipboard&&navigator.clipboard.writeText)try{await navigator.clipboard.writeText(b),c=!0}catch(a){console.warn("navigator.clipboard failed, trying textarea fallback:",a)}if(!c)try{let a=document.createElement("textarea");a.value=b,a.style.position="fixed",a.style.top="0",a.style.left="0",a.style.opacity="0",document.body.appendChild(a),a.focus(),a.select(),c=document.execCommand("copy"),document.body.removeChild(a)}catch(a){console.error("Fallback copy failed:",a)}c&&(i(!0),setTimeout(()=>i(!1),2e3))}(0,c.useEffect)(()=>{let b=document.getElementById("product-jsonld");b&&b.remove();let c=document.createElement("script");return c.id="product-jsonld",c.type="application/ld+json",c.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:a.name,description:a.description||"Producto disponible en Bazarito Cancún con entrega local.",image:a.images?.length?a.images:a.image?[a.image]:[],sku:a.id,brand:{"@type":"Brand",name:"Bazarito Cancún"},offers:{"@type":"Offer",url:`https://bazaritocancun.com/p/${a.slug||a.id}`,priceCurrency:"MXN",price:a.price,priceValidUntil:new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split("T")[0],availability:"sold"===a.status||"out_of_stock"===a.status?"https://schema.org/OutOfStock":"https://schema.org/InStock",seller:{"@type":"Organization",name:"Bazarito Cancún"},shippingDetails:{"@type":"OfferShippingDetails",shippingRate:{"@type":"MonetaryAmount",value:50,currency:"MXN"},deliveryTime:{"@type":"ShippingDeliveryTime",handlingTime:{"@type":"QuantitativeValue",minValue:0,maxValue:1,unitCode:"DAY"},transitTime:{"@type":"QuantitativeValue",minValue:1,maxValue:1,unitCode:"DAY"}}}}}),document.head.appendChild(c),()=>{let a=document.getElementById("product-jsonld");a&&a.remove()}},[a]);let m=(0,x.filterValidImages)(a.images?.length?a.images:a.image?[a.image]:[]),n=J[a.category]||{bg:"#FFF8D6",icon:q.Package},o="sold"!==a.status&&"out_of_stock"!==a.status,p=!1!==a.delivery_enabled;return(0,b.jsx)("div",{children:(0,b.jsxs)("div",{className:"plp-container",children:[(0,b.jsxs)("div",{className:"plp-content",children:[(0,b.jsx)("div",{className:"plp-image-section",children:(0,b.jsx)(K,{images:m,placeholder:n})}),(0,b.jsxs)("div",{className:"plp-info-section",children:[(0,b.jsx)("h1",{className:"plp-title",children:a.name}),(0,b.jsxs)("div",{className:"plp-price",children:["$",Number(a.price).toLocaleString("es-MX")," ",(0,b.jsx)("span",{className:"plp-currency",children:"MXN"})]}),o&&"archived"!==a.status&&(0,b.jsx)("div",{className:"plp-urgency",children:"⚡ ¡Últimas piezas disponibles!"}),o&&"one_off"!==a.type&&(0,b.jsxs)("div",{className:"plp-qty-row",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"plp-qty-label",children:"Cantidad"}),null!=a.stock&&a.stock<=5&&(0,b.jsxs)("p",{className:"plp-qty-stock",children:["⚡ Solo ",a.stock," disponibles"]})]}),(0,b.jsxs)("div",{className:"plp-qty-controls",children:[(0,b.jsx)("button",{className:"plp-qty-btn",onClick:()=>k(a=>Math.max(1,a-1)),disabled:j<=1,"aria-label":"Quitar una pieza",children:"−"}),(0,b.jsx)("span",{className:"plp-qty-val",children:j}),(0,b.jsx)("button",{className:"plp-qty-btn",onClick:()=>k(b=>Math.min(a.stock??99,b+1)),disabled:null!=a.stock&&j>=a.stock,"aria-label":"Añadir una pieza",children:"+"})]})]}),(0,b.jsx)("p",{className:"plp-desc",children:a.description||"Producto disponible con entrega rápida en Cancún. Contáctanos para más información."}),(0,b.jsxs)("div",{className:"plp-action",children:[o?(0,b.jsxs)("button",{className:"btn btn-primary plp-buy-btn",onClick:()=>f(!0),children:[(0,b.jsx)(s.ShoppingBag,{size:20}),j>1?`Lo quiero \xd7${j}`:"Lo quiero ahora"]}):(0,b.jsx)("button",{className:"btn plp-buy-btn",disabled:!0,style:{background:"var(--bg-muted)",color:"var(--text-secondary)"},children:"Producto agotado"}),(0,b.jsxs)("button",{className:"plp-share-btn",onClick:l,"aria-label":"Compartir producto",children:[g?(0,b.jsx)(h.Check,{size:18}):(0,b.jsx)(r.Share2,{size:18}),g?"¡Enlace copiado!":"Compartir"]})]}),(0,b.jsxs)("div",{className:"plp-delivery",children:[(0,b.jsxs)("div",{className:"plp-ditem",children:[(0,b.jsx)(t.MapPin,{size:16,className:"plp-dicon"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"plp-dlabel",children:"Recolección gratis"}),(0,b.jsx)("p",{className:"plp-dval",children:"Región 96, Cancún · Producto listo en 15–30 min"})]})]}),p&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("div",{className:"plp-ditem",children:[(0,b.jsx)(u.Truck,{size:16,className:"plp-dicon"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"plp-dlabel",children:"Entrega a domicilio"}),(0,b.jsx)("p",{className:"plp-dval",children:"$50 (1–6 km) · $80 (6–10 km)"})]})]}),(0,b.jsxs)("div",{className:"plp-ditem",children:[(0,b.jsx)(w,{size:16,className:"plp-dicon"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"plp-dlabel",children:"Horario nocturno"}),(0,b.jsx)("p",{className:"plp-dval",children:"Después de 8 PM $100"})]})]})]})]}),(0,b.jsxs)("div",{className:"plp-pay",children:[(0,b.jsx)("p",{className:"plp-pay-title",children:"Métodos de pago"}),(0,b.jsxs)("div",{className:"plp-pay-methods",children:[(0,b.jsx)("span",{className:"plp-pay-method",children:"💳 Mercado Pago"}),p&&(0,b.jsxs)("span",{className:"plp-pay-method",children:["💵 Efectivo al recibir ",(0,b.jsx)("span",{className:"plp-pay-note",children:"(envío $80 · depósito $50)"})]}),(0,b.jsxs)("span",{className:"plp-pay-method",children:["🏪 Efectivo en recolección ",(0,b.jsx)("span",{className:"plp-pay-note",children:"(listo en 15–30 min)"})]})]})]}),(0,b.jsxs)("div",{className:"plp-trust-badges",children:[(0,b.jsx)("span",{className:"trust-badge",children:"🛡️ Compra segura"}),(0,b.jsx)("span",{className:"trust-badge",children:"🤝 Paga al recibir"}),(0,b.jsx)("span",{className:"trust-badge",children:"✅ Entrega express"})]})]})]}),e&&(0,b.jsx)(I,{product:a,quantity:j,onClose:()=>f(!1)}),(0,b.jsx)("style",{children:`
          .plp-container {
            min-height: calc(100vh - 64px);
            background: var(--bg);
            padding-top: 2.5rem;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .plp-content {
            max-width: 500px;
            margin: 0 auto;
            background: var(--bg-card);
            border: 1.5px solid var(--border);
            min-height: calc(100vh - 64px);
          }
          .plp-image-section {
            width: 100%;
            aspect-ratio: 1/1;
            background: var(--bg-muted);
          }
          .plp-gallery { position: relative; width: 100%; height: 100%; }
          .plp-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .plp-gallery-empty {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center; font-size: 5rem;
          }
          
          .plp-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            z-index: 5;
          }
          .plp-arrow:hover { background: white; transform: translateY(-50%) scale(1.1); }
          .plp-left { left: 15px; } .plp-right { right: 15px; }
          .plp-dots {
            position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 8px;
            z-index: 5;
          }
          .plp-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(255,255,255,0.5); border: none; cursor: pointer;
            transition: all 0.2s ease;
          }
          .plp-dot-active { background: white; transform: scale(1.2); }

          .plp-info-section { padding: 1.5rem; display: flex; flex-direction: column; gap: 12px; }
          .plp-title {
            font-family: var(--font-display);
            font-size: 1.75rem; font-weight: 800;
            margin: 0; line-height: 1.2;
            color: var(--text-primary);
          }
          .plp-price {
            font-size: 1.5rem; font-weight: 900;
            color: var(--orange);
            display: flex; align-items: baseline; gap: 4px;
          }
          .plp-currency {
            font-size: 0.8rem; font-weight: 600;
            color: var(--text-secondary);
          }
          .plp-urgency {
            display: inline-block;
            background: rgba(232, 75, 9, 0.1);
            color: var(--orange);
            font-size: 0.85rem; font-weight: 700;
            padding: 6px 12px;
            border-radius: var(--radius-full);
            border: 1px solid rgba(232, 75, 9, 0.2);
          }
          /* Quantity selector */
          .plp-qty-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 14px;
            background: var(--bg-muted);
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
          }
          .plp-qty-label {
            font-size: 0.78rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); margin: 0;
          }
          .plp-qty-stock {
            font-size: 0.72rem; font-weight: 700;
            color: var(--orange); margin: 4px 0 0;
          }
          .plp-qty-controls {
            display: flex; align-items: center; gap: 0;
            border: 2px solid var(--border); border-radius: var(--radius-full);
            overflow: hidden; background: var(--bg-card);
          }
          .plp-qty-btn {
            width: 38px; height: 38px;
            background: var(--bg-card); border: none;
            font-size: 1.3rem; font-weight: 700;
            color: var(--text-primary);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: background 150ms ease;
          }
          .plp-qty-btn:hover:not(:disabled) { background: var(--yellow); }
          .plp-qty-btn:disabled { color: var(--text-muted); cursor: not-allowed; }
          .plp-qty-val {
            min-width: 38px; text-align: center;
            font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
            color: var(--text-primary);
            border-left: 1.5px solid var(--border);
            border-right: 1.5px solid var(--border);
            padding: 0 4px; line-height: 38px;
          }
          .plp-desc {
            font-size: 1rem; color: var(--text-secondary);
            line-height: 1.6; margin: 0; white-space: pre-wrap;
          }
          
          .plp-action { display: flex; flex-direction: column; gap: 10px; }
          .plp-buy-btn {
            width: 100%; padding: 1.1rem;
            font-size: 1.05rem;
            display: flex; justify-content: center; align-items: center; gap: 10px;
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 15px rgba(255, 208, 0, 0.3);
          }
          .plp-share-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            background: none; border: 1.5px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 0.75rem;
            font-size: 0.9rem; font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: var(--font-display);
          }
          .plp-share-btn:hover {
            border-color: var(--teal);
            color: var(--teal);
            background: rgba(26,122,109,0.05);
          }
          .plp-delivery {
            display: flex; flex-direction: column; gap: 10px;
            padding: 14px; background: var(--bg-card);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          .plp-ditem { display: flex; align-items: flex-start; gap: 10px; }
          .plp-dicon { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
          .plp-dlabel { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); margin: 0; }
          .plp-dval   { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

          /* Payment methods */
          .plp-pay {
            padding: 14px; background: var(--bg-muted);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          .plp-pay-title {
            font-size: 0.72rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); margin: 0 0 8px 0;
          }
          .plp-pay-methods { display: flex; flex-direction: column; gap: 6px; }
          .plp-pay-method { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
          .plp-pay-note { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }
          
          .plp-trust-badges {
            display: flex; justify-content: center; gap: 12px; margin-top: 4px;
          }
          .trust-badge {
            font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;
          }
          
          .plp-error {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: calc(100vh - 64px); gap: 1rem;
            color: var(--text-primary);
          }

          @media (min-width: 768px) {
            .plp-content {
              max-width: 900px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin: 2rem auto;
              border-radius: var(--radius-lg);
              overflow: hidden;
              box-shadow: var(--shadow-md, 0 4px 24px rgba(26,18,8,0.10));
              min-height: auto;
            }
            .plp-image-section { aspect-ratio: unset; min-height: 400px; }
          }
        `})]})})}],94779)}];

//# sourceMappingURL=app_p_%5Bslug%5D_ClientPage_jsx_1mk8glz._.js.map