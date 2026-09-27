(function () {
    "use strict";

    var box = document.getElementById("EvrenxusCryptoGrid");
    if (!box) return;

    box.innerHTML = "";

    var widget = document.createElement("tgju");

    widget.setAttribute("type", "market-data");

    /* دلار، یورو، طلا ۱۸، مثقال، سکه امامی، نیم‌سکه، ربع‌سکه، تتر، بیت‌کوین، اتریوم */
    widget.setAttribute(
        "items",
        "398096,398097,535605,398115,398102"
    );

    widget.setAttribute(
        "columns",
        "dot,diff,low,high,time"
    );

    widget.setAttribute("token", "webservice");

    box.appendChild(widget);

    var style = document.createElement("style");
    style.textContent = `
        #EvrenxusCryptoGrid {
            width:100%;
            margin:20px 0;
            direction:rtl;
            font-family:Vazir,Tahoma,Arial,sans-serif;
        }

        #EvrenxusCryptoGrid tgju {
            display:block;
            width:100%;
            min-height:180px;
        }
    `;
    document.head.appendChild(style);

    if (!document.querySelector('script[src="https://api.tgju.org/v1/widget/v2"]')) {
        var script = document.createElement("script");
        script.src = "https://api.tgju.org/v1/widget/v2";
        script.defer = true;
        document.head.appendChild(script);
    }
})();
