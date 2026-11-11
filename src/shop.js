export const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
export function totals(items, coupon='') { const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0); const mrp=items.reduce((s,i)=>s+i.originalPrice*i.qty,0); const discount=coupon==='SENSE25'?Math.min(200,Math.round(subtotal*.25)):0;const shipping=subtotal===0||subtotal>=999?0:49;return {subtotal,mrp,discount,shipping,total:subtotal-discount+shipping}; }
const aliases={mens:'men',womens:'women',clothes:'fashion',clothing:'fashion',makeup:'beauty',groceries:'grocery',tech:'electronics',smartphones:'phone',smartphone:'phone',phones:'phone',earbuds:'earphone',airpods:'earphone',skincare:'skin care'};
export function normalizeSearch(value){return value.toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).map(w=>aliases[w]||w.replace(/(shirts|laptops|tablets|shoes|bags|watches|fragrances|headphones|earphones|dresses|perfumes|balls)$/,(m)=>m==='dresses'?'dress':m==='watches'?'watch':m.slice(0,-1))).join(' ');}
export function matchesQuery(p,query){const hay=normalizeSearch([p.title,p.brand,p.category,p.subcategory,...(p.tags||[])].join(' ')).split(' ');return normalizeSearch(query).split(' ').filter(Boolean).every(w=>hay.some(h=>w==='men'||w==='women'?h===w:h.includes(w)));}
export function selectProducts(products,{category='all',query='',brands=[],maxPrice=Infinity,minRating=0,minDiscount=0,sort='recommended'}={}) {let result=products.filter(p=>(category==='all'||p.category===category)&&matchesQuery(p,query)&&(!brands.length||brands.includes(p.brand))&&p.price<=maxPrice&&p.rating>=minRating&&p.discount>=minDiscount);return [...result].sort(sort==='low'?(a,b)=>a.price-b.price:sort==='high'?(a,b)=>b.price-a.price:sort==='rating'?(a,b)=>b.rating-a.rating:sort==='discount'?(a,b)=>b.discount-a.discount:(a,b)=>Number(b.featured)-Number(a.featured));}
// Support replies link to actions available in the browser demo.
const supportTopics = [
  [/\b(forgot|reset|recover)\b.*\bpassword\b/i, 'Password recovery is unavailable for local demo accounts. If you can still sign in, you can change your password using your current one.', '/login', 'Open login'],
  [/\bpassword\b/i, 'Open Password in your account. Enter your current demo password and confirm the new one.', '/account?section=security', 'Change password'],
  [/\b(address(es)?|pincode|pin code)\b/i, 'Manage your saved addresses and choose a default. Checkout starts with that address.', '/account?section=addresses', 'Manage addresses'],
  [/\b(payments?|charged|upi|cards?)\b/i, 'Checkout saves a preview without charging you. You can choose a preferred payment method in your account.', '/account?section=payments', 'Payment preferences'],
  [/\b(returns?|refunds?|cancel(lation)?|exchange)\b/i, 'ShopSense saves order previews only. There is no shipment to return or payment to refund.', '/help', 'Read shopping FAQs'],
  [/\b(orders?|tracking|track|delivery|shipping|shipment)\b/i, 'Find saved checkout previews under Orders. This demo does not ship products or provide tracking numbers.', '/account?section=orders', 'View orders'],
  [/\b(coupons?|offers?|discount)\b/i, 'Apply SENSE25 in your bag for 25% off, up to ₹200.', '/bag', 'Open bag'],
  [/\b(wishlist|favourites)\b/i, 'Tap the heart on a product to save it. Your wishlist stays in this browser.', '/wishlist', 'Open wishlist'],
  [/\b(profile|account|login|sign in)\b/i, 'Open your account to manage your profile, addresses, and login settings.', '/account', 'Open account'],
  [/\b(bag|cart|checkout)\b/i, 'Review your items and quantities in the bag, then continue to the address and order preview.', '/bag', 'Review bag']
];

export function assistantReply(products,text,mode='shop'){
 const q=text.toLowerCase();
 const topic=supportTopics.find(([pattern])=>pattern.test(q));
 if(topic && (mode==='help' || !/\b(under|below|recommend|find me)\b/.test(q))){
   const [,text,to,label]=topic;
   return {who:'bot',text,action:{to,label}};
 }
 if(mode==='help'||/^(help|shopping help|support)[!.? ]*$/.test(q.trim()))return {who:'bot',text:'I can help with orders, checkout, offers, or account settings. Which one do you need?',help:true};
 const budget=q.match(/(?:under|below|budget(?: of)?|less than|up to)\s*(?:₹|rs\.?\s*|inr\s*)?([\d,]+(?:\.\d+)?)\s*(k|thousand)?\b/);
 const maxPrice=budget?Number(budget[1].replaceAll(',',''))*(budget[2]?1000:1):1000000;
 const query=(budget?q.replace(budget[0],''):q).replace(/\b(show|me|some|find|recommend|recommendations|please|i|want|need|a|an|the|best|good|picks|products|for|buy|looking|im|can|you|suggest)\b/g,' ').trim();
 const words=normalizeSearch(query).split(' ');const category=['electronics','fashion','home','beauty','grocery','sports','accessories'].find(c=>words.includes(c))||'all';
 const picks=selectProducts(products,{category,query,maxPrice,sort:'rating'}).slice(0,3);
 return {who:'bot',picks,text:picks.length?'Here are matching catalogue picks'+(budget?' within '+money(maxPrice):'')+'. Open a product for its details and reviews.':'I couldn’t find a match for that combination. Try a broader product name or a higher budget—for example “laptops under 80000”, “perfume” or “grocery”.'};
}
