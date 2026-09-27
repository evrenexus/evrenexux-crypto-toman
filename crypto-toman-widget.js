(function () {
    "use strict";

    var box = document.getElementById("EvrenxusCryptoGrid");
    if (!box) return;

    box.innerHTML = `
        <div class="EvrenxusMarketTitle">بازار ایران</div>

        <tgju
            type="market-data"
            items="MARKET_ITEMS"
            columns="dot,diff,low,high,time"
            token="webservice">
        </tgju>
    `;

    var style = document.createElement("style");

    style.textContent = `
        #EvrenxusCryptoGrid {
            width:100%;
            margin:20px 0;
            direction:rtl;
            font-family:Vazir,Tahoma,Arial,sans-serif;
        }

        .EvrenxusMarketTitle {
            font-size:18px;
            font-weight:bold;
            margin-bottom:12px;
        }

        #EvrenxusCryptoGrid tgju {
            display:block;
            width:100%;
        }
    `;

    document.head.appendChild(style);

    var script = document.createElement("script");
    script.src = "https://api.tgju.org/v1/widget/v2";
    script.defer = true;

    document.body.appendChild(script);

})();
