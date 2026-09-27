(function () {
    "use strict";

    var box = document.getElementById("EvrenxusCryptoGrid");
    if (!box) return;

    var feeds = [
        {
            name: "دنیای اقتصاد",
            url: "https://donya-e-eqtesad.com/rss"
        },
        {
            name: "عصر ایران",
            url: "https://www.asriran.com/fa/rss/allnews"
        },
        {
            name: "دیجیاتو",
            url: "https://digiato.com/feed"
        }
    ];

    var allNews = [];

    box.innerHTML =
        '<div class="EvrenxusNewsLoading">در حال دریافت آخرین اخبار...</div>';

    var style = document.createElement("style");
    style.textContent = `
        #EvrenxusCryptoGrid {
            direction: rtl;
            width: 100%;
            margin: 20px 0;
            font-family: Vazir, Tahoma, Arial, sans-serif;
        }

        .EvrenxusNewsList {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .EvrenxusNewsItem {
            display: flex;
            gap: 14px;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
            text-decoration: none;
            color: inherit;
        }

        .EvrenxusNewsImage {
            width: 125px;
            height: 82px;
            flex: 0 0 125px;
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
            margin-bottom: 5px;
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

        @media (max-width: 600px) {
            .EvrenxusNewsImage {
                width: 95px;
                height: 68px;
                flex-basis: 95px;
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

    function cleanText(text) {
        var div = document.createElement("div");
        div.innerHTML = text || "";
        return (div.textContent || div.innerText || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getImage(item) {
        var media =
            item.querySelector("media\\:content, content") ||
            item.querySelector("enclosure");

        if (media && media.getAttribute("url")) {
            return media.getAttribute("url");
        }

        var html =
            item.querySelector("description")?.textContent ||
            item.querySelector("content\\:encoded")?.textContent ||
            "";

        var match = html.match(/<img[^>]+src=["']([^"']+)["']/i);

        return match ? match[1] : "";
    }

    function getDate(item) {
        var d =
            item.querySelector("pubDate") ||
            item.querySelector("published") ||
            item.querySelector("updated");

        return d ? new Date(d.textContent.trim()) : new Date(0);
    }

    function parseFeed(xml, source) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "text/xml");

        var items = Array.from(doc.querySelectorAll("item, entry"));

        items.slice(0, 10).forEach(function (item) {
            var titleNode = item.querySelector("title");
            var linkNode = item.querySelector("link");

            var title = titleNode ? cleanText(titleNode.textContent) : "";

            var link = "";

            if (linkNode) {
                link =
                    linkNode.getAttribute("href") ||
                    linkNode.textContent.trim();
            }

            var descNode =
                item.querySelector("description") ||
                item.querySelector("summary") ||
                item.querySelector("content\\:encoded");

            var description = descNode
                ? cleanText(descNode.textContent)
                : "";

            if (description.length > 150) {
                description = description.substring(0, 150).trim() + "…";
            }

            allNews.push({
                title: title,
                link: link,
                description: description,
                image: getImage(item),
                date: getDate(item),
                source: source
            });
        });
    }

    function render() {
        allNews.sort(function (a, b) {
            return b.date - a.date;
        });

        allNews = allNews.slice(0, 15);

        var html = '<div class="EvrenxusNewsList">';

        allNews.forEach(function (news) {
            var dateText = news.date.getTime()
                ? news.date.toLocaleString("fa-IR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                  })
                : "";

            html += `
                <a class="EvrenxusNewsItem"
                   href="${news.link}"
                   target="_blank"
                   rel="noopener noreferrer">

                    ${
                        news.image
                            ? `<img class="EvrenxusNewsImage"
                                    src="${news.image}"
                                    loading="lazy"
                                    onerror="this.style.display='none'">`
                            : `<div class="EvrenxusNewsImage"></div>`
                    }

                    <div class="EvrenxusNewsContent">
                        <div class="EvrenxusNewsTitle">
                            ${news.title}
                        </div>

                        <div class="EvrenxusNewsDesc">
                            ${news.description}
                        </div>

                        <div class="EvrenxusNewsMeta">
                            <span class="EvrenxusNewsSource">
                                ${news.source}
                            </span>
                            ${dateText}
                        </div>
                    </div>
                </a>
            `;
        });

        html += "</div>";

        box.innerHTML = allNews.length
            ? html
            : '<div>خبری دریافت نشد.</div>';
    }

    var requests = feeds.map(function (feed) {
        return fetch(
            "https://api.allorigins.win/raw?url=" +
                encodeURIComponent(feed.url)
        )
            .then(function (response) {
                if (!response.ok) throw new Error("RSS error");
                return response.text();
            })
            .then(function (xml) {
                parseFeed(xml, feed.name);
            })
            .catch(function () {});
    });

    Promise.all(requests).then(render);
})();
