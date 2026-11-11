import { categories, products } from '../data/catalog';

export const imageFor = product => product.images[1] || product.image;
export const departmentPicks = { electronics: 101, fashion: 88, home: 14, beauty: 6, grocery: 27, sports: 137, accessories: 94 };
// The coral flacon is original department artwork, not a photograph of CK One.
// Keep the catalogue product and its detail page intact; this artwork shops Beauty.
export const journeyProducts = categories.map(category => ({
  category,
  product: products.find(p => p.id === departmentPicks[category.id]),
  artwork: category.id === 'beauty' ? {
    image: '/journey/coral-perfume.png',
    alt: 'Coral glass perfume bottle',
    label: 'Explore Beauty',
    to: '/shop?category=beauty',
  } : null,
}));

// The same catalogue objects travel through every scene: x/y %, scale, rotation.
export const chapters = [
  { label: 'Tech & Sound', kicker: 'TECH & SOUND', title: 'Find your', accent: 'rhythm.', word: 'PLAY', tone: '#abd8ff', glow: '#527ff0', product: 101, groups: ['electronics'],
    pose: [[72,43,1.26,-17],[53,72,.57,-24],[110,82,.62,12],[96,-35,.45,15],[115,20,.35,-20],[-20,80,.6,30],[89,24,.48,15]],
    mobile: [[52,47,1.12,-17],[19,74,.5,-24],[120,83,.6,12],[90,-40,.45,15],[115,20,.35,-20],[-30,80,.5,30],[86,26,.4,15]] },
  { label: 'Style & Sport', kicker: 'STYLE & MOVEMENT', title: 'Out of the', accent: 'ordinary.', word: 'MOVE', tone: '#ebc2ae', glow: '#c87858', product: 88, groups: ['fashion','sports','accessories'],
    pose: [[86,22,.43,18],[69,47,1.4,-22],[112,49,.65,-5],[110,68,.4,-8],[107,77,.35,8],[53,74,.62,26],[91,67,.58,-10]],
    mobile: [[87,17,.32,18],[51,45,1.15,-22],[121,48,.65,-5],[118,70,.35,-8],[112,77,.3,8],[18,76,.5,26],[85,74,.45,-10]] },
  { label: 'Home & Living', kicker: 'HOME & LIVING', title: 'Life,', accent: 'well lived.', word: 'LIVE', tone: '#dce2cd', glow: '#9aa77b', product: 14, groups: ['home','beauty','grocery'],
    // The watch stays visible throughout the handoff. The chair approaches
    // its focal position from the nearby right edge, not across the headline.
    pose: [[115,10,.4,30],[109,20,.5,-16],[72,45,1.32,-5],[53,68,.42,-8],[88,72,.44,8],[57,112,.4,35],[88,25,.45,12]],
    mobile: [[120,10,.35,30],[111,19,.45,-16],[54,43,1.15,-5],[18,70,.36,-8],[84,75,.39,8],[18,120,.35,35],[84,24,.37,12]] },
  { label: 'Explore All', kicker: 'SHOP BY CATEGORY', title: 'Find your', accent: 'thing.', word: '', tone: '#eee8df', glow: '#ded1bb', groups: categories.map(c => c.id),
    pose: [[17,40,.40,-5],[39,40,.42,-8],[61,40,.40,0],[83,40,.32,-5],[28,68,.38,4],[50,68,.42,-8],[72,68,.40,5]],
    mobile: [[20,17,.23,-5],[50,17,.24,-8],[80,17,.23,0],[20,49,.20,-5],[50,49,.22,4],[80,49,.24,-8],[50,81,.23,5]] },
];
