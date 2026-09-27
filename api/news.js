export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const feeds = [
    { url: 'https://www.asriran.com/fa/rss/allnews', source: 'عصر ایران' },
    { url: 'https://donya-e-eqtesad.com/feeds/', source: 'دنیای اقتصاد' },
    { url: 'https://digiato.com/feed', source: 'دیجیاتو' }
  ];

  try {
    let allItems = [];

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);
        const xml = await response.text();
        const items = parseRSS(xml, feed.source);
        allItems = allItems.concat(items);
      } catch (e) {
        console.error(`Error fetching ${feed.source}:`, e);
      }
    }

    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    res.status(200).json({
      success: true,
      count: allItems.length,
      items: allItems.slice(0, 15)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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
    const image = extractImage(content);

    if (title && link) {
      items.push({
        title: cleanText(title),
        link: link.trim(),
        description: cleanText(description).substring(0, 150),
        image: image,
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

function extractImage(content) {
  let match = content.match(/<image[^>]*>[\s\S]*?<url>([^<]*)<\/url>/i);
  if (match) return match[1].trim();
  
  match = content.match(/media:content[^>]*url="([^"]*)"/i);
  if (match) return match[1].trim();
  
  match = content.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image/i);
  if (match) return match[1].trim();
  
  return '';
}

function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}
