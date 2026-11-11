import json, urllib.request, pathlib, concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]
def fetch(url,path):
 path.parent.mkdir(parents=True,exist_ok=True)
 if path.exists() and path.stat().st_size>0:return True
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
   path.write_bytes(urllib.request.urlopen(req,timeout=45).read());return True
  except Exception: pass
 return False
data=json.loads((root/'src/data/source.json').read_text(encoding='utf-8'))
groups={'electronics':['smartphones','laptops','tablets','mobile-accessories'],'fashion':['mens-shirts','womens-dresses','tops','mens-shoes','womens-shoes'],'home':['furniture','home-decoration','kitchen-accessories'],'beauty':['beauty','fragrances','skin-care'],'grocery':['groceries'],'sports':['sports-accessories'],'accessories':['mens-watches','womens-watches','womens-bags','sunglasses','womens-jewellery']}
products=[];jobs=[]
for group,subs in groups.items():
 chosen=[]
 for sub in subs: chosen.extend([p for p in data if p['category']==sub and p['id']!=102][:12 if group=='grocery' else 8 if group=='sports' else 4])
 for p in chosen:
  price=round(p['price']*65/10)*10-1;discount=round(p['discountPercentage']);original=round(price/(1-discount/100))
  urls=[p['thumbnail']]+p['images'][:2];images=[]
  for i,url in enumerate(dict.fromkeys(urls)):
   path=f'/products/{p["id"]}-{i}.webp';images.append(path);jobs.append((url,root/'public'/path.lstrip('/')))
  products.append(dict(id=p['id'],title=p['title'],brand=p.get('brand','Everyday Essentials'),category=group,subcategory=p['category'],price=price,originalPrice=original,discount=discount,rating=p['rating'],ratingCount=len(p.get('reviews',[])),image=images[0],images=images,description=p['description'],tags=p['tags'],sku=p['sku'],colors=['Original'],sizes=['S','M','L','XL'] if p['category'] in ['mens-shirts','womens-dresses','tops'] else ['6','7','8','9','10'] if 'shoes' in p['category'] else [],attributes={'Warranty':p.get('warrantyInformation',''),'Material / style':p['category'].replace('-',' ').title()},featured=p['id']%3==0,reviews=[{'name':r['reviewerName'],'rating':r['rating'],'comment':r['comment']} for r in p.get('reviews',[])]))
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 results=list(pool.map(lambda j:fetch(*j),jobs))
print('Product assets',len(jobs),'downloaded',sum(results))
cats=[]
names={'electronics':'Electronics','fashion':'Fashion','home':'Home & Living','beauty':'Beauty','grocery':'Grocery','sports':'Sports','accessories':'Accessories'}
for i,(group,subs) in enumerate(groups.items()):
 cats.append(dict(id=group,name=names[group],subtitle=['Upgrade your everyday','Your next favourite look','Make room for beautiful','A little everyday glow','Fresh picks. Great prices.','Find your next move','The finishing touches'][i],image=next(p['image'] for p in products if p['category']==group),color=['#e5eef4','#fae6e1','#ebe7df','#f9e1e6','#e9eedb','#e4e9f0','#f3e4cf'][i]))
(root/'src/data/catalog.js').write_text('export const categories = '+json.dumps(cats)+';\nexport const products = '+json.dumps(products)+';\n',encoding='utf-8')
editorial={'fashion':'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85&fit=crop','home':'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=85&fit=crop','electronics':'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=85&fit=crop'}
for name,url in editorial.items(): print(name,fetch(url,root/'public/editorial'/f'{name}.jpg'))
(root/'ASSET-SOURCES.md').write_text('# Asset sources\n\nProduct descriptions, reviews and photos: https://dummyjson.com/products (demonstration catalogue). INR prices are illustrative conversions, not live merchant prices. Ratings use source data.\n\nEditorial photography: Unsplash\n'+ '\n'.join(editorial.values()),encoding='utf-8')
print('Products:',len(products))
