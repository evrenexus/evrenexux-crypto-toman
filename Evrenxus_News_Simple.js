(function() {
    'use strict';

    const VIEWER_BASE = 'https://evrenexus.github.io/svgevrenexus-viewer/viewer.html?url=';
    const PROXIES = [
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    let currentProxy = 0;

    function createCSS() {
        return `<style>
#EvrenxusNewsFeed { direction: rtl; font-family: Tahoma, Arial, sans-serif; margin: 20px 0; }
.news-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 10px; }
.news-item { display: flex; gap: 12px; padding: 12px; border: 1px solid #e1e1e1; background: #fff; transition: 0.2s; text-decoration: none; color: inherit; cursor: pointer; }
.news-item:hover { background: #f5f5f5; border-color: #1a73e8; }
.news-image { width: 110px; height: 75px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.news-image-placeholder { width: 110px; height: 75px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 24px; border-radius: 3px; flex-shrink: 0; color: white; }
.news-content { flex: 1; min-width: 0; }
.news-title { font-size: 13px; font-weight: bold; color: #1a73e8; line-height: 1.5; margin: 0 0 5px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-desc { font-size: 11px; color: #666; line-height: 1.6; margin: 0 0 6px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-meta { display: flex; gap: 8px; font-size: 10px; }
.news-source { background: #e8f0fe; color: #1a73e8; padding: 2px 6px; border-radius: 2px; font-weight: bold; }
.news-time { color: #999; }
.news-header { text-align: center; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 4px; margin-bottom: 10px; }
.news-header h2 { margin: 0; font-size: 18px; }
.news-loading { text-align: center; padding: 30px; color: #666; }
.news-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; text-align: center; margin: 10px 0; font-size: 12px; }
@media (max-width: 600px) { .news-grid { grid-template-columns: 1fr; } .news-image, .news-image-placeholder { width: 90px; height: 65px; } .news-title { font-size: 12px; } }
        </style>`;
    }

    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (mins < 1) return 'الآن';
            if (mins < 60) return `${mins}د`;
            if (hours < 24) return `${hours}س`;
            if (days < 7) return `${days}ر`;
            return date.toLocaleDateString('fa-IR');
        } catch {
            return '';
        }
    }

    function parseRSS(xml, source) {
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
            const content = match[1];
            
            const title = extractTag(content, 'title');
            const link = extractTag(content, 'link');
            const description = extractTag(content, 'description');
            const pubDate = extractTag(content, 'pubDate');

            if (title && link) {
                items.push({
                    title: cleanText(title),
                    link: link.trim(),
                    description: cleanText(description).substring(0, 150),
                    source: source,
                    pubDate: pubDate || new Date().toISOString()
                });
            }
        }

        return items;
    }

    function extractTag(content, tag) {
        const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
        const match = content.match(regex);
        return match ? match[1] : '';
    }

    function cleanText(text) {
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .trim();
    }

    function createCard(item) {
        return `
            <a href="${VIEWER_BASE}${encodeURIComponent(item.link)}" target="_blank" class="news-item">
                <div class="news-image-placeholder">📰</div>
                <div class="news-content">
                    <div class="news-title">${item.title}</div>
                    <div class="news-desc">${item.description}</div>
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-time">${formatDate(item.pubDate)}</span>
                    </div>
                </div>
            </a>
        `;
    }

    async function fetchWithProxy(url, proxyIndex = 0) {
        if (proxyIndex >= PROXIES.length) {
            throw new Error('All proxies failed');
        }

        try {
            const proxyUrl = PROXIES[proxyIndex] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            const data = await response.json();
            return data.contents || data;
        } catch (e) {
            return fetchWithProxy(url, proxyIndex + 1);
        }
    }

    async function load() {
        const container = document.getElementById('EvrenxusNewsFeed');
        if (!container) return;

        document.head.insertAdjacentHTML('beforeend', createCSS());
        container.innerHTML = '<div class="news-loading">⏳ در حال بارگذاری اخبار...</div>';

        try {
            const feeds = [
                { url: 'https://www.asriran.com/fa/rss/allnews', source: 'عصر ایران' },
                { url: 'https://donya-e-eqtesad.com/feeds/', source: 'دنیای اقتصاد' },
                { url: 'https://digiato.com/feed', source: 'دیجیاتو' }
            ];

            let allItems = [];

            for (const feed of feeds) {
                try {
                    const xml = await fetchWithProxy(feed.url);
                    const items = parseRSS(xml, feed.source);
                    allItems = allItems.concat(items);
                } catch (e) {
                    console.error(`Error fetching ${feed.source}:`, e);
                }
            }

            if (allItems.length === 0) {
                container.innerHTML = '<div class="news-error">⚠️ خطا در دریافت اخبار</div>';
                return;
            }

            allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            const html = `
                <div class="news-header">
                    <h2>📰 آخرین اخبار</h2>
                </div>
                <div class="news-grid">
                    ${allItems.slice(0, 12).map(createCard).join('')}
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="news-error">❌ خطا: ${error.message}</div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
