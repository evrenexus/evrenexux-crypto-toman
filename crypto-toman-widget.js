(function () {
    "use strict";

    var box = document.getElementById("EvrenxusCryptoGrid");
    if (!box) return;

    /* پاک کردن محتوای قبلی */
    box.innerHTML = "";

    /* عنوان */
    var title = document.createElement("div");
    title.className = "EvrenxusMarketTitle";
    title.innerHTML = "بازار ایران";
    box.appendChild(title);

    /* ویجت TGJU */
    var widget = document.createElement("tgju");

    widget.setAttribute("type", "market-data");

    /*
      آیتم‌ها:
      دلار، یورو، تتر، طلای ۱۸، مثقال،
      سکه امامی، نیم‌سکه، ربع‌سکه،
      بیت‌کوین، اتریوم، سولانا، بایننس‌کوین
    */
    widget.setAttribute(
        "items",
        "price_dollar_rl,price_eur,crypto-tether,geram18,mesghal,s_price_emami,s_price_nim,s_price_rob,crypto-bitcoin,crypto-ethereum,crypto-solana,crypto-binancecoin"
    );

    widget.setAttribute(
        "columns",
        "dot,diff"
    );

    widget.setAttribute("token", "webservice");

    box.appendChild(widget);

    /* استایل اختصاصی Evrenxus */
    var style = document.createElement("style");
    style.textContent = `
        #EvrenxusCryptoGrid {
            width: 100%;
            margin: 20px 0;
            direction: rtl;
            font-family: Vazir, Tahoma, Arial, sans-serif;
        }

        .EvrenxusMarketTitle {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: right;
        }

        #EvrenxusCryptoGrid tgju {
            display: block;
            width: 100%;
            min-height: 120px;
        }

        #EvrenxusCryptoGrid iframe {
            max-width: 100% !important;
        }

        @media (max-width: 600px) {
            #EvrenxusCryptoGrid {
                margin: 12px 0;
            }

            .EvrenxusMarketTitle {
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(style);

    /* بارگذاری موتور رسمی TGJU فقط یک بار */
    if (!document.querySelector('script[src="https://api.tgju.org/v1/widget/v2"]')) {
        var script = document.createElement("script");
        script.src = "https://api.tgju.org/v1/widget/v2";
        script.defer = true;
        document.head.appendChild(script);
    }

})();
