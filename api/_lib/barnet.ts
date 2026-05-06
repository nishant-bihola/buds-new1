const BARNET_API_KEY = process.env.BARNET_API_KEY;
const BARNET_API_PASS = process.env.BARNET_API_PASS;
const BARNET_API_URL = process.env.BARNET_API_URL;

// Base64 encode for Basic Auth
const authHeader = `Basic ${Buffer.from(`${BARNET_API_KEY}:${BARNET_API_PASS}`).toString('base64')}`;

export async function fetchBarnetProducts() {
  if (!BARNET_API_URL || !BARNET_API_KEY) {
    throw new Error('Barnet API credentials not configured');
  }

  try {
    const url = `${BARNET_API_URL}/api/products`;
    
    console.log(`[Barnet] Fetching products from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Barnet API error (${response.status}): ${text}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Barnet API Error]:', error.message);
    throw error;
  }
}

export function mapBarnetProductToBuds(barnetProduct: any) {
  // Map Barnet fields to Buds fields
  // Using fallbacks for common Barnet field naming variations
  const id = barnetProduct.Sku || barnetProduct.SKU || barnetProduct.ID || barnetProduct.Id || String(Math.random());
  
  return {
    id: String(id),
    name: barnetProduct.Title || barnetProduct.Name || barnetProduct.ProductName || 'Unnamed Product',
    description: barnetProduct.Description || barnetProduct.LongDescription || '',
    price: parseFloat(barnetProduct.Price || barnetProduct.RetailPrice || barnetProduct.MSRP || 0),
    category: barnetProduct.Category || barnetProduct.Department || 'Uncategorized',
    image: barnetProduct.ImageUrl || barnetProduct.ImageURL || barnetProduct.PrimaryImage || '/images/placeholder.png',
    in_stock: (parseInt(barnetProduct.StockLevel || barnetProduct.Quantity || barnetProduct.Inventory || 0)) > 0,
    updated_at: new Date().toISOString(),
    sort_order: 0
  };
}
