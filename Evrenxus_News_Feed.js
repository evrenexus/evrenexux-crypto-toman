(function () {
    "use strict";

    var box = document.getElementById("EvrenxusNewsFeed") ||
              document.getElementById("EvrenxusCryptoGrid");

    if (!box) return;

    var feeds = [
        {
            name: "دنیای اقتصاد",
            url: "https://donya-e-eqtesad.com/fa/feeds/?p=all"
        },
        {
            name: "عصر ایران",
            url: "https://www.asriran.com/fa/rss/allnews"
        },
        {
            name: "دیجیاتو",
            url: "https://digiato.com/feed/"
        }
    ];

    var news = [];

    box.innerHTML =
        '<div class="EvrenxusNewsLoading">در حال دریافت اخبار...</div>';

    var style = document.createElement("style");

    style.textContent = `
        #EvrenxusNewsFeed,
        #EvrenxusCryptoGrid {
            direction: rtl;
            width: 100%;
            margin: 0;
            font-family: Vazir, Tahoma, Arial, sans-serif;
        }

        .EvrenxusNewsList {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .EvrenxusNewsItem {
            display: flex;
            gap: 14px;
            padding: 13px 0;
            border-bottom: 1px solid #e5e5e5;
            text-decoration: none !important;
            color: inherit !important;
        }

        .EvrenxusNewsImage {
            width: 125px;
            height: 82px;
            min-width: 125px;
            object-fit: cover;
            border-radius: 6px;
            background: #eee;
        }

        .EvrenxusNewsContent {
            flex: 1;
            min-width: 0;
        }

        .EvrenxusNewsTitle {
            font-size: 16px;
            font-weight: bold;
            line-height: 1.8;
            margin-bottom: 4px;
        }

        .EvrenxusNewsDesc {
            font-size: 13px;
            line-height: 1.8;
            color: #666;
        }

        .EvrenxusNewsMeta {
            margin-top: 6px;
            font-size: 11px;
            color: #999;
        }

        .EvrenxusNewsSource {
            font-weight: bold;
            margin-left: 8px;
        }

        .EvrenxusNewsLoading {
            text-align: center;
            padding: 25px;
            color: #888;
        }

        @media (max-width: 600px) {
            .EvrenxusNewsItem {
                gap: 10px;
            }

            .EvrenxusNewsImage {
                width: 95px;
                min-width: 95px;
                height: 68px;
            }

            .EvrenxusNewsTitle {
                font-size: 14px;
            }

            .EvrenxusNewsDesc {
                font-size: 12px;
            }
        }
    `;

    document.head.appendChild(style);

    function clean(text) {
        var div = document.createElement("div");
        div.innerHTML = text || "";

        return (div.textContent || div.innerText || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getDate(item) {
        var value =
            item.pubDate ||
            item.published ||
            item.pubdate ||
            item.date;

        var d = value ? new Date(value) : new Date(0);

        return isNaN(d.getTime()) ? new Date(0) : d;
    }

    function shortText(text) {
        text = clean(text);

        return text.length > 150
            ? text.substring(0, 150).trim() + "…"
            : text;
    }

    function getImage(item) {
        if (item.thumbnail) return item.thumbnail;

        if (item.enclosure && item.enclosure.link) {
            return item.enclosure.link;
        }

        var html =
            item.description ||
            item.content ||
            "";

        var match = html.match(
            /<img[^>]+src=["']([^"']+)["']/i
        );

        return match ? match[1] : "";
    }

    function getFeed(feed) {

        var api =
            "https://api.rss2json.com/v1/api.json?rss_url=" +
            encodeURIComponent(feed.url);

        return fetch(api)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Feed error");
                }

                return response.json();
            })
            .then(function (data) {

                if (!data.items) return;

                data.items.slice(0, 10).forEach(function (item) {

                    if (!item.link) return;

                    news.push({
                        title: clean(item.title),
                        description: shortText(
                            item.description ||
                            item.content ||
                            ""
                        ),
                        image: getImage(item),
                        link: item.link,
                        source: feed.name,
                        date: getDate(item)
                    });
                });
            })
            .catch(function () {});
    }

    function render() {

        news.sort(function (a, b) {
            return b.date.getTime() - a.date.getTime();
        });

        news = news.slice(0, 15);

        if (!news.length) {
            box.innerHTML =
                '<div class="EvrenxusNewsLoading">خبری دریافت نشد.</div>';
            return;
        }

        var html = '<div class="EvrenxusNewsList">';

        news.forEach(function (item) {

            var dateText = item.date.getTime()
                ? item.date.toLocaleString("fa-IR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "";

            html += `
                <a
                    class="EvrenxusNewsItem"
                    href="${item.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    ${
                        item.image
                        ? `<img
                            class="EvrenxusNewsImage"
                            src="${item.image}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                           >`
                        : `<div class="EvrenxusNewsImage"></div>`
                    }

                    <div class="EvrenxusNewsContent">

                        <div class="EvrenxusNewsTitle">
                            ${item.title}
                        </div>

                        <div class="EvrenxusNewsDesc">
                            ${item.description}
                        </div>

                        <div class="EvrenxusNewsMeta">
                            <span class="EvrenxusNewsSource">
                                ${item.source}
                            </span>
                            ${dateText}
                        </div>

                    </div>

                </a>
            `;
        });

        html += "</div>";

        box.innerHTML = html;
    }

    Promise.all(
        feeds.map(function (feed) {
            return getFeed(feed);
        })
    ).then(render);

})();
