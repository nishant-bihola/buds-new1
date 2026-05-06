const BARNET_API_KEY = process.env.BARNET_API_KEY;
const BARNET_API_PASS = process.env.BARNET_API_PASS;
const BARNET_API_URL = process.env.BARNET_API_URL;

function getAuthHeader() {
  return `Basic ${Buffer.from(`${BARNET_API_KEY}:${BARNET_API_PASS}`).toString('base64')}`;
}

export async function fetchBarnetProducts(storeId = 1) {
  if (!BARNET_API_URL || !BARNET_API_KEY || !BARNET_API_PASS) {
    throw new Error('Barnet API credentials not configured in environment variables');
  }

  const authHeader = getAuthHeader();

  // Primary endpoint per Barnet API docs: GET /swagger/products?store_id=1
  const url = `${BARNET_API_URL}/swagger/products?store_id=${storeId}&on_hand=true&is_active=true&page_size=200`;
  console.log(`[Barnet] Fetching products from: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Barnet API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  // Barnet returns { items: [...], paginator: {...} }
  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(data)) {
    return data;
  }
  throw new Error(`Unexpected Barnet response shape. Keys: ${Object.keys(data).join(', ')}`);
}

export function mapBarnetProductToBuds(p: any) {
  // Barnet SellingProduct schema fields (from API docs)
  const id = String(p.productId || p.ProductId || p.id || Math.random().toString(36).slice(2, 9));

  const rawDescription = p.description || p.Description || '';
  const description = rawDescription.replace(/<[^>]*>?/gm, '').trim();

  // Barnet images: p.images is array of objects, thumbs: { "320": url }
  let image = '/images/preroll.png';
  if (p.thumbs?.['320']) image = p.thumbs['320'];
  else if (p.thumbs?.['140']) image = p.thumbs['140'];
  else if (Array.isArray(p.images) && p.images[0]) {
    image = typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url || image;
  }

  // Price: Barnet products have variations with price fields
  let price = 0;
  if (Array.isArray(p.variations) && p.variations.length > 0) {
    const v = p.variations[0];
    price = parseFloat(v.price || v.Price || v.retail_price || 0);
  }

  // Stock: onsale=1 or check variations
  const inStock = p.onsale === 1 || p.onsale === true || (Array.isArray(p.variations) && p.variations.some((v: any) => (v.on_hand || v.onHand || 0) > 0));

  return {
    id,
    name: (p.productName || p.ProductName || p.name || 'Unnamed Product').trim(),
    description,
    price,
    category: p.category || p.Category || 'Cannabis',
    brand: p.brandname || p.BrandName || '',
    image,
    thc: p.thc_percent || p.thcPercent || null,
    cbd: p.cbd_percent || p.cbdPercent || null,
    species: p.species || '',
    in_stock: inStock,
    barnet_id: id,
    updated_at: new Date().toISOString(),
    sort_order: 0,
  };
}
