(function () {
    var box = document.getElementById("EvrenxusNewsFeed") ||
              document.getElementById("EvrenxusCryptoGrid");

    if (!box) return;

    var feeds = [
        {
            name: "عصر ایران",
            url: "https://www.asriran.com/fa/rss/allnews"
        },
        {
            name: "دنیای اقتصاد",
            url: "https://donya-e-eqtesad.com/feeds/"
        },
        {
            name: "دیجیاتو",
            url: "https://digiato.com/feed"
        }
    ];

    /* تمام لینک‌های خبر از این Viewer عبور می‌کنند */
    var viewer = "https://evrenexus.github.io/svgevrenexus-viewer/viewer.html?url=";

    box.innerHTML =
        '<div style="padding:20px;text-align:center">در حال دریافت آخرین اخبار...</div>';

    function getRSS(feed) {
        var api =
            "https://api.rss2json.com/v1/api.json?rss_url=" +
            encodeURIComponent(feed.url);

        return fetch(api)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.items) return [];

                return data.items.map(function (item) {
                    var image = item.thumbnail || "";

                    if (!image && item.enclosure && item.enclosure.link) {
                        image = item.enclosure.link;
                    }

                    if (!image) {
                        var html = item.description || item.content || "";
                        var m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
                        if (m) image = m[1];
                    }

                    var description =
                        (item.description || item.content || "")
                        .replace(/<[^>]*>/g, "")
                        .replace(/&nbsp;/g, " ")
                        .replace(/&amp;/g, "&")
                        .trim();

                    if (description.length > 150) {
                        description = description.substring(0, 150) + "…";
                    }

                    return {
                        title: item.title || "",
                        description: description,
                        link: item.link || "",
                        image: image,
                        source: feed.name,
                        date: new Date(item.pubDate || item.published || 0)
                    };
                });
            })
            .catch(function () {
                return [];
            });
    }

    Promise.all(feeds.map(getRSS)).then(function (results) {

        var news = [];

        results.forEach(function (items) {
            news = news.concat(items);
        });

        news.sort(function (a, b) {
            return b.date - a.date;
        });

        news = news.slice(0, 15);

        if (!news.length) {
            box.innerHTML =
                '<div style="padding:20px;text-align:center">خبری دریافت نشد.</div>';
            return;
        }

        var html = '<div class="EvrenxusNewsList">';

        news.forEach(function (item) {

            var dateText = "";

            if (!isNaN(item.date.getTime())) {
                dateText = item.date.toLocaleString("fa-IR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                });
            }

            /*
             * مهم:
             * لینک مستقیم منبع هرگز باز نمی‌شود.
             * لینک همیشه به Viewer اختصاصی Evrenxus می‌رود.
             */
            var target =
                viewer + encodeURIComponent(item.link);

            html +=
                '<a href="' + target + '" target="_blank" class="EvrenxusNewsItem">' +

                    '<div class="EvrenxusNewsImage">' +
                        (item.image
                            ? '<img src="' + item.image + '" loading="lazy">'
                            : '') +
                    '</div>' +

                    '<div class="EvrenxusNewsContent">' +

                        '<div class="EvrenxusNewsTitle">' +
                            item.title +
                        '</div>' +

                        '<div class="EvrenxusNewsDesc">' +
                            item.description +
                        '</div>' +

                        '<div class="EvrenxusNewsMeta">' +
                            '<span class="EvrenxusNewsSource">' +
                                item.source +
                            '</span>' +
                            '<span>' +
                                dateText +
                            '</span>' +
                        '</div>' +

                    '</div>' +

                '</a>';
        });

        html += '</div>';

        box.innerHTML = html;
    });

    var style = document.createElement("style");

    style.textContent = `
        .EvrenxusNewsList {
            width:100%;
            display:flex;
            flex-direction:column;
            gap:10px;
        }

        .EvrenxusNewsItem {
            display:flex;
            direction:rtl;
            width:100%;
            box-sizing:border-box;
            padding:10px;
            text-decoration:none !important;
            color:inherit !important;
            border-bottom:1px solid rgba(128,128,128,.18);
            transition:.2s;
        }

        .EvrenxusNewsItem:hover {
            background:rgba(128,128,128,.07);
        }

        .EvrenxusNewsImage {
            width:120px;
            min-width:120px;
            height:78px;
            overflow:hidden;
            border-radius:6px;
            margin-left:12px;
            background:#eee;
        }

        .EvrenxusNewsImage img {
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
        }

        .EvrenxusNewsContent {
            flex:1;
            min-width:0;
        }

        .EvrenxusNewsTitle {
            font-size:16px;
            font-weight:700;
            line-height:1.7;
            margin-bottom:4px;
        }

        .EvrenxusNewsDesc {
            font-size:13px;
            line-height:1.7;
            opacity:.78;
        }

        .EvrenxusNewsMeta {
            display:flex;
            gap:12px;
            font-size:11px;
            opacity:.65;
            margin-top:5px;
        }

        .EvrenxusNewsSource {
            font-weight:700;
        }

        @media(max-width:600px) {
            .EvrenxusNewsImage {
                width:90px;
                min-width:90px;
                height:65px;
            }

            .EvrenxusNewsTitle {
                font-size:14px;
            }

            .EvrenxusNewsDesc {
                font-size:12px;
            }
        }
    `;

    document.head.appendChild(style);

})();
