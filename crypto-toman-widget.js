(function(){

"use strict";

var NOBITEX_API="https://api.nobitex.ir";

var COINS=[
{
id:"BTC",
name:"بیت‌کوین",
market:"BTCIRT",
tv:"LBANK:BTCUSDT.P"
},
{
id:"ETH",
name:"اتریوم",
market:"ETHIRT",
tv:"LBANK:ETHUSDT.P"
},
{
id:"BNB",
name:"بایننس کوین",
market:"BNBIRT",
tv:"LBANK:BNBUSDT.P"
},
{
id:"XRP",
name:"ریپل",
market:"XRPIRT",
tv:"LBANK:XRPUSDT.P"
},
{
id:"SOL",
name:"سولانا",
market:"SOLIRT",
tv:"LBANK:SOLUSDT.P"
},
{
id:"DOGE",
name:"دوج‌کوین",
market:"DOGEIRT",
tv:"LBANK:DOGEUSDT.P"
},
{
id:"ADA",
name:"کاردانو",
market:"ADAIRT",
tv:"LBANK:ADAUSDT.P"
},
{
id:"TRX",
name:"ترون",
market:"TRXIRT",
tv:"LBANK:TRXUSDT.P"
},
{
id:"LINK",
name:"چین‌لینک",
market:"LINKIRT",
tv:"LBANK:LINKUSDT.P"
},
{
id:"TON",
name:"تون‌کوین",
market:"TONIRT",
tv:"LBANK:TONUSDT.P"
},
{
id:"PAXG",
name:"طلای دیجیتال",
market:"PAXGIRT",
tv:"LBANK:PAXGUSDT.P"
},
{
id:"XAUT",
name:"تتر گلد",
market:"XAUTIRT",
tv:"LBANK:XAUTUSDT.P"
}
];


/* تبدیل ریال به تومان */

function toman(number){

if(
number===null ||
number===undefined ||
isNaN(number)
){
return "—";
}

return new Intl.NumberFormat("fa-IR").format(
Math.round(number)
)+" تومان";

}


/* دریافت اطلاعات */

async function getCoinData(coin){

try{

var now=Math.floor(Date.now()/1000);

var from=now-(3*60*60);

var url=
NOBITEX_API+
"/market/udf/history"+
"?symbol="+
encodeURIComponent(coin.market)+
"&resolution=60"+
"&from="+
from+
"&to="+
now;

var response=await fetch(
url,
{
method:"GET",
cache:"no-store"
}
);

if(!response.ok){
throw new Error("HTTP "+response.status);
}

var data=await response.json();

if(
data.s!=="ok" ||
!data.c ||
data.c.length<1
){
throw new Error("No candle data");
}

var current=
Number(
data.c[data.c.length-1]
);

var previous=null;

if(data.c.length>=2){
previous=
Number(
data.c[data.c.length-2]
);
}

var change=0;

if(
previous &&
previous!==0
){
change=
(
(current-previous)/
previous
)*100;
}

return{
price:current/10,
change:change
};

}

catch(error){

console.log(
"Evrenxus API Error:",
coin.id,
error
);

return null;

}

}


/* ساخت سلول */

function createCard(coin){

var card=
document.createElement("div");

card.className=
"Evrenxus-CryptoCard";

card.innerHTML=

'<div class="Evrenxus-CryptoTop">'+
'<span class="Evrenxus-CryptoName">'+
coin.name+
'</span>'+
'<span class="Evrenxus-CryptoSymbol">'+
coin.id+
'</span>'+
'</div>'+

'<div class="Evrenxus-CryptoPrice" id="EvrenxusPrice-'+
coin.id+
'">'+
'در حال دریافت...'+
'</div>'+

'<div class="Evrenxus-CryptoChange" id="EvrenxusChange-'+
coin.id+
'">'+
'—'+
'</div>'+

'<div class="Evrenxus-TimeFrame">'+
'1H'+
'</div>';

card.onclick=function(){
EvrenxusOpenChart(coin);
};

return card;

}


/* بروزرسانی سلول */

function updateCard(coin,data){

var price=
document.getElementById(
"EvrenxusPrice-"+coin.id
);

var change=
document.getElementById(
"EvrenxusChange-"+coin.id
);

if(!price || !change){
return;
}

if(!data){

price.innerHTML=
"خطا در دریافت قیمت";

change.innerHTML="—";

return;

}

price.innerHTML=
toman(data.price);

var value=
Number(data.change);

var arrow="";
var sign="";

var className=
"Evrenxus-Neutral";

if(value>0){

arrow="▲";
sign="+";

className=
"Evrenxus-Up";

}

else if(value<0){

arrow="▼";

className=
"Evrenxus-Down";

}

else{

arrow="●";

}

change.className=
"Evrenxus-CryptoChange "+
className;

change.innerHTML=
arrow+
" "+
sign+
value.toFixed(2)+
"%";

}


/* بروزرسانی همه */

async function updateAll(){

for(
var i=0;
i<COINS.length;
i++
){

var coin=COINS[i];

var data=
await getCoinData(coin);

updateCard(
coin,
data
);

await new Promise(
function(resolve){
setTimeout(
resolve,
150
);
}
);

}

}


/* باز کردن نمودار */

window.EvrenxusOpenChart=function(coin){

var box=
document.getElementById(
"EvrenxusChartBox"
);

var frame=
document.getElementById(
"EvrenxusChartFrame"
);

var title=
document.getElementById(
"EvrenxusChartTitle"
);

var symbol=
encodeURIComponent(
coin.tv
);

var chartURL=
"https://www.tradingview.com/widgetembed/?"+
"symbol="+symbol+
"&interval=60"+
"&hidesidetoolbar=0"+
"&symboledit=1"+
"&saveimage=0"+
"&toolbarbg=f1f3f6"+
"&studies=[]"+
"&theme=light"+
"&style=1"+
"&timezone=Asia%2FTehran"+
"&withdateranges=1"+
"&hideideas=1";

title.innerHTML=
coin.name+
" ("+
coin.id+
") — LBank Futures";

frame.src=chartURL;

box.style.display="block";

setTimeout(
function(){

box.scrollIntoView({
behavior:"smooth",
block:"start"
});

},
100
);

};


/* بستن نمودار */

window.EvrenxusCloseChart=function(){

var box=
document.getElementById(
"EvrenxusChartBox"
);

var frame=
document.getElementById(
"EvrenxusChartFrame"
);

box.style.display="none";

frame.src="";

};


/* ساخت جدول */

var grid=
document.getElementById(
"EvrenxusCryptoGrid"
);

if(grid){

COINS.forEach(
function(coin){

grid.appendChild(
createCard(coin)
);

}
);

updateAll();

setInterval(
updateAll,
60000
);

}

})();
