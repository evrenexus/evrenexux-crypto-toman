(function() {
    'use strict';

    const RSS_FEEDS = [
        { url: 'https://www.asriran.com/fa/rss/allnews', source: 'عصر ایران' },
        { url: 'https://donya-e-eqtesad.com/feeds/', source: 'دنیای اقتصاد' },
        { url: 'https://digiato.com/feed', source: 'دیجیاتو' }
    ];

    const VIEWER_BASE = 'https://evrenexus.github.io/svgevrenexus-viewer/viewer.html?url=';
    const PROXY = 'https://api.allorigins.win/get?url=';

    async function fetchRSS(feedUrl) {
        try {
            const proxyUrl = PROXY + encodeURIComponent(feedUrl);
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('XML Parse Error');
            }
            
            return xmlDoc;
        } catch (error) {
            console.error('Error fetching RSS:', feedUrl, error);
            return null;
        }
    }

    function parseItems(xmlDoc, source) {
        const items = [];
        const entries = xmlDoc.querySelectorAll('item');
        
        entries.forEach(entry => {
            const title = entry.querySelector('title')?.textContent || 'بدون عنوان';
            const link = entry.querySelector('link')?.textContent || '#';
            const description = entry.querySelector('description')?.textContent || '';
            const pubDate = entry.querySelector('pubDate')?.textContent || new Date().toISOString();
            
            // استخراج تصویر
            let image = '';
            const imageTag = entry.querySelector('image') || entry.querySelector('media\\:content') || entry.querySelector('[url]');
            if (imageTag) {
                image = imageTag.getAttribute('url') || imageTag.textContent;
            }
            
            items.push({
                title: cleanText(title),
                link: link.trim(),
                description: truncateText(stripHtml(description), 150),
                image: image,
                source: source,
                pubDate: new Date(pubDate),
                timestamp: new Date(pubDate).getTime()
            });
        });
        
        return items;
    }

    function cleanText(text) {
        return text.trim().replace(/<[^>]*>/g, '');
    }

    function stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `${minutes} دقیقه پیش`;
        if (hours < 24) return `${hours} ساعت پیش`;
        if (days < 7) return `${days} روز پیش`;
        
        return date.toLocaleDateString('fa-IR');
    }

    function createNewsHTML(items) {
        return items.map(item => `
            <div class="news-item">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22%3E%3Crect fill=%22%23ddd%22 width=%22120%22 height=%2280%22/%3E%3C/svg%3E'">` : `<div class="news-image-placeholder">📰</div>`}
                <div class="news-content">
                    <a href="${VIEWER_BASE}${encodeURIComponent(item.link)}" target="_blank" class="news-title">
                        ${item.title}
                    </a>
                    <p class="news-description">${item.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-time">${formatDate(item.pubDate)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function createCSS() {
        return `
            <style>
                #EvrenxusNewsFeed {
                    direction: rtl;
                    font-family: Tahoma, Arial, sans-serif;
                }

                .news-container {
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                }

                .news-item {
                    display: flex;
                    gap: 15px;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    background: white;
                    transition: background 0.3s ease;
                    align-items: flex-start;
                }

                .news-item:hover {
                    background: #f9f9f9;
                }

                .news-image {
                    width: 120px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .news-image-placeholder {
                    width: 120px;
                    height: 80px;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .news-content {
                    flex: 1;
                    min-width: 0;
                }

                .news-title {
                    display: block;
                    font-size: 15px;
                    font-weight: bold;
                    color: #1a73e8;
                    text-decoration: none;
                    line-height: 1.4;
                    margin-bottom: 8px;
                    word-wrap: break-word;
                }

                .news-title:hover {
                    text-decoration: underline;
                    color: #0d47a1;
                }

                .news-description {
                    font-size: 13px;
                    color: #555;
                    line-height: 1.5;
                    margin: 0 0 8px 0;
                    word-wrap: break-word;
                }

                .news-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #999;
                }

                .news-source {
                    background: #f0f0f0;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-weight: bold;
                    color: #666;
                }

                .news-time {
                    color: #999;
                }

                .news-loading {
                    text-align: center;
                    padding: 30px;
                    color: #666;
                }

                .news-error {
                    background: #fee;
                    color: #c33;
                    padding: 15px;
                    border-right: 4px solid #c33;
                    margin: 10px;
                    border-radius: 4px;
                }

                @media (max-width: 600px) {
                    .news-item {
                        gap: 10px;
                        padding: 10px;
                    }

                    .news-image,
                    .news-image-placeholder {
                        width: 80px;
                        height: 60px;
                    }

                    .news-title {
                        font-size: 14px;
                    }

                    .news-description {
                        font-size: 12px;
                    }

                    .news-meta {
                        gap: 10px;
                        font-size: 11px;
                    }
                }
            </style>
        `;
    }

    async function loadNewsFeed() {
        const container = document.getElementById('EvrenxusNewsFeed');
        if (!container) return;

        // افزودن CSS
        document.head.insertAdjacentHTML('beforeend', createCSS());

        // نمایش Loading
        container.innerHTML = '<div class="news-loading">⏳ در حال بارگذاری اخبار...</div>';

        try {
            const allItems = [];

            // دریافت و parse تمام RSS Feeds
            for (const feed of RSS_FEEDS) {
                const xmlDoc = await fetchRSS(feed.url);
                if (xmlDoc) {
                    const items = parseItems(xmlDoc, feed.source);
                    allItems.push(...items);
                }
            }

            if (allItems.length === 0) {
                container.innerHTML = '<div class="news-error">⚠️ هیچ خبری یافت نشد</div>';
                return;
            }

            // مرتب‌سازی بر اساس تاریخ (جدید‌ترین اول)
            allItems.sort((a, b) => b.timestamp - a.timestamp);

            // نمایش 15 خبر اول
            const latestNews = allItems.slice(0, 15);

            // ایجاد و نمایش HTML
            const newsHTML = `
                <div class="news-container">
                    ${createNewsHTML(latestNews)}
                </div>
            `;

            container.innerHTML = newsHTML;

        } catch (error) {
            console.error('Fatal error:', error);
            container.innerHTML = '<div class="news-error">❌ خطا در بارگذاری اخبار</div>';
        }
    }

    // بارگذاری وقتی DOM آماده باشد
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNewsFeed);
    } else {
        loadNewsFeed();
    }

})();
