(function () {
    "use strict";

    var box = document.getElementById("EvrenxusCryptoGrid");
    if (!box) return;

    box.innerHTML =
        '<tgju type="market-data" items="398096,398097,535605,398115,398102" columns="dot,diff,low,high,time" token="webservice"></tgju>';

    if (!document.querySelector('script[src="https://api.tgju.org/v1/widget/v2"]')) {
        var s = document.createElement("script");
        s.src = "https://api.tgju.org/v1/widget/v2";
        s.defer = true;
        document.body.appendChild(s);
    }
})();
