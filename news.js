(function() {
  const c = document.getElementById('EvrenxusNewsFeed');
  if (!c) return;
  
  c.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">⏳ بارگذاری...</div>';
  
  const feeds = [
    {url: 'https://www.asriran.com/fa/rss/allnews', name: 'عصر ایران'},
    {url: 'https://donya-e-eqtesad.com/feeds/', name: 'دنیای اقتصاد'}
  ];
  
  async function load() {
    let items = [];
    
    for (const feed of feeds) {
      try {
        const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(feed.url));
        const data = await res.json();
        const regex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        let count = 0;
        
        while ((match = regex.exec(data.contents)) && count < 3) {
          const title = (match[1].match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
          const link = (match[1].match(/<link[^>]*>([^<]*)<\/link>/i) || [])[1] || '';
          
          if (title && link) {
            items.push({title, link, source: feed.name});
            count++;
          }
        }
      } catch(e) {}
    }
    
    if (items.length === 0) {
      c.innerHTML = '<div style="padding:20px; text-align:center; color:#c62828;">❌ خطا</div>';
      return;
    }
    
    let html = '<div style="direction:rtl; font-family:Tahoma;">';
    items.forEach(item => {
      html += `<div style="padding:12px; border-bottom:1px solid #eee;">
        <a href="${item.link}" target="_blank" style="color:#1a73e8; font-weight:bold; text-decoration:none; display:block; margin-bottom:5px;">
          ${item.title}
        </a>
        <div style="font-size:11px; color:#999;">${item.source}</div>
      </div>`;
    });
    html += '</div>';
    
    c.innerHTML = html;
  }
  
  load();
})();
