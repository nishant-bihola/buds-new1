const BARNET_API_KEY = process.env.BARNET_API_KEY;
const BARNET_API_PASS = process.env.BARNET_API_PASS;
const BARNET_API_URL = process.env.BARNET_API_URL;

// Base64 encode for Basic Auth
const authHeader = `Basic ${Buffer.from(`${BARNET_API_KEY}:${BARNET_API_PASS}`).toString('base64')}`;

export async function fetchBarnetProducts() {
  if (!BARNET_API_URL || !BARNET_API_KEY) {
    throw new Error('Barnet API credentials not configured');
  }

  const endpoints = ['/api/products', '/api/inventory', '/api/v1/products', '/api/v1/inventory'];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const url = `${BARNET_API_URL}${endpoint}`;
      console.log(`[Barnet] Attempting sync from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        // Add a timeout
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data) return data;
      } else if (response.status !== 404) {
        // If it's not a 404, the endpoint might be correct but auth/params are wrong
        const text = await response.text();
        throw new Error(`Endpoint ${endpoint} failed with ${response.status}: ${text}`);
      }
    } catch (error: any) {
      console.error(`[Barnet] Endpoint ${endpoint} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error('All Barnet API endpoints failed or returned no data.');
}

export function mapBarnetProductToBuds(barnetProduct: any) {
  // Map Barnet fields to Buds fields
  // Using fallbacks for common Barnet field naming variations
  const id = String(barnetProduct.Sku || barnetProduct.SKU || barnetProduct.ID || barnetProduct.Id || Math.random().toString(36).substring(7));
  
  // Clean up description (remove HTML if present)
  const description = (barnetProduct.Description || barnetProduct.LongDescription || '')
    .replace(/<[^>]*>?/gm, '') // Simple HTML strip
    .trim();

  return {
    id,
    name: (barnetProduct.Title || barnetProduct.Name || barnetProduct.ProductName || 'Unnamed Product').trim(),
    description,
    price: parseFloat(barnetProduct.Price || barnetProduct.RetailPrice || barnetProduct.MSRP || 0),
    category: barnetProduct.Category || barnetProduct.Department || 'Uncategorized',
    image: barnetProduct.ImageUrl || barnetProduct.ImageURL || barnetProduct.PrimaryImage || '/images/placeholder.png',
    in_stock: (parseInt(barnetProduct.StockLevel || barnetProduct.Quantity || barnetProduct.Inventory || 0)) > 0,
    updated_at: new Date().toISOString(),
    sort_order: 0
  };
}
