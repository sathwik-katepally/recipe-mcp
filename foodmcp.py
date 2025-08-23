from typing import Any, Dict
import httpx
import re
import json
import os
from mcp.server.fastmcp import FastMCP

# Load constants from JSON file
with open(os.path.join(os.path.dirname(__file__), 'constants.json'), 'r') as f:
    CONSTANTS = json.load(f)

# Initialize FastMCP server
mcp = FastMCP("food-app-mcp")

def extract_price_value(price_str: str) -> float:
    """Extract numeric price value from price string"""
    if not price_str:
        return 0.0
    # Extract numbers from price string (handle Swedish format)
    matches = re.findall(r'\d+[,.]?\d*', str(price_str))
    if matches:
        # Handle Swedish decimal format (comma as decimal separator)
        price_val = matches[0].replace(',', '.')
        try:
            return float(price_val)
        except ValueError:
            return 0.0
    return 0.0

@mcp.tool()
async def get_city_gross_offers() -> Dict[str, Any]:
    """Get actual City Gross weekly offers from their API"""
    
    try:
        async with httpx.AsyncClient() as client:
            city_gross_config = CONSTANTS['stores']['cityGross']
            headers = city_gross_config['api']['headers']
            
            # Build URL with parameters
            base_url = city_gross_config['api']['baseUrl'] + city_gross_config['api']['endpoints']['weeklyOffers']
            params = city_gross_config['api']['defaultParams']
            
            # Build query string
            query_params = '&'.join([f"{k}={v}" for k, v in params.items()])
            url = f"{base_url}?{query_params}"
            response = await client.get(url, headers=headers, timeout=city_gross_config['api']['timeout'] / 1000.0)
            data = response.json()
            
            items = []
            if 'items' in data:
                for product in data['items'][:30]:  # Limit to 30 items
                    # Extract pricing information
                    product_details = product.get('productStoreDetails', {})
                    prices = product_details.get('prices', {})
                    current_price = prices.get('currentPrice', {})
                    active_promotion = prices.get('activePromotion', {})
                    promotion_price = active_promotion.get('priceDetails', {}) if active_promotion else {}
                    
                    # Calculate actual selling price (promotion price if available, otherwise current price)
                    selling_price = promotion_price.get('price', current_price.get('price', 0))
                    original_price = current_price.get('price', 0)
                    
                    item = {
                        "name": product.get('name', 'Unknown'),
                        "price": f"{selling_price} kr" + (f"/{current_price.get('unit', 'st')}" if current_price.get('unit') else ''),
                        "price_value": float(selling_price) if selling_price else 0.0,
                        "original_price": f"{original_price} kr" + (f"/{current_price.get('unit', 'st')}" if current_price.get('unit') else '') if original_price != selling_price else '',
                        "discount": f"Save {original_price - selling_price:.2f} kr" if original_price and selling_price and original_price > selling_price else '',
                        "description": product.get('description', ''),
                        "category": product.get('category', ''),
                        "brand": product.get('brand', ''),
                        "unit": current_price.get('unit', 'st') if current_price else 'st',
                        "availability": "available",
                        "promotion_valid_until": active_promotion.get('to', '') if active_promotion else ''
                    }
                    items.append(item)
            
            return {
                "store_name": city_gross_config['name'],
                "store_id": city_gross_config['id'],
                "items": items,
                "item_count": len(items),
                "source_url": url
            }
            
    except Exception as e:
        city_gross_config = CONSTANTS['stores']['cityGross']
        return {
            "store_name": city_gross_config['name'],
            "store_id": city_gross_config['id'],
            "items": [],
            "item_count": 0,
            "error": str(e),
        }

@mcp.tool()
async def get_willys_offers() -> Dict[str, Any]:
    """Get Willys offers - test their API endpoints"""
    
    try:
        async with httpx.AsyncClient() as client:
            willys_config = CONSTANTS['stores']['willys']
            headers = willys_config['api']['headers']
            
            # Build URL with parameters
            base_url = willys_config['api']['baseUrl'] + willys_config['api']['endpoints']['campaigns']
            params = willys_config['api']['defaultParams']
            
            # Build query string
            query_params = '&'.join([f"{k}={v}" for k, v in params.items()])
            url = f"{base_url}?{query_params}"
            
            items = []
            try:
                response = await client.get(url, headers=headers, timeout=willys_config['api']['timeout'] / 1000.0)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse the results from real Willys API
                    if 'results' in data:
                        results = data['results']
                        for result in results[:30]:  # Limit to 30 items
                            # Extract product information
                            product_name = result.get('name', 'Unknown Product')
                            manufacturer = result.get('manufacturer', '')
                            display_volume = result.get('displayVolume', '')
                            
                            # Get current price
                            current_price_str = result.get('priceNoUnit', '0')
                            current_price = extract_price_value(current_price_str)
                            price_unit = result.get('priceUnit', 'kr/st')
                            
                            # Get promotion info if available
                            promotions = result.get('potentialPromotions', [])
                            promotion_price = current_price
                            discount_info = ""
                            
                            if promotions:
                                promotion = promotions[0]  # Take first promotion
                                if promotion.get('price'):
                                    promotion_price = float(promotion['price'])
                                save_price = promotion.get('savePrice', '')
                                redeem_limit = promotion.get('redeemLimitLabel', '')
                                
                                if save_price and redeem_limit:
                                    discount_info = f"{save_price} • {redeem_limit}"
                                elif save_price:
                                    discount_info = save_price
                                elif redeem_limit:
                                    discount_info = redeem_limit
                            
                            # Build description
                            description_parts = [manufacturer, display_volume]
                            description = ' '.join(filter(None, description_parts))
                            
                            item = {
                                "name": product_name,
                                "price": f"{promotion_price} {price_unit}" if promotion_price else f"{current_price} {price_unit}",
                                "price_value": float(promotion_price) if promotion_price else current_price,
                                "original_price": f"{current_price} {price_unit}" if promotion_price != current_price else "",
                                "discount": discount_info,
                                "description": description,
                                "category": "",
                                "brand": manufacturer,
                                "unit": price_unit.replace('kr/', '') if 'kr/' in price_unit else 'st',
                                "availability": "available"
                            }
                            items.append(item)
                            
                working_url = url
            except Exception:
                working_url = None
            
            return {
                "store_name": willys_config['name'],
                "store_id": willys_config['id'],
                "items": items,
                "item_count": len(items),
                "source_url": working_url or "API endpoint failed",
                "note": "No working API found" if not items else f"Data from real Willys API"
            }
            
    except Exception as e:
        willys_config = CONSTANTS['stores']['willys']
        return {
            "store_name": willys_config['name'],
            "store_id": willys_config['id'],
            "items": [],
            "item_count": 0,
            "error": str(e),
        }

@mcp.tool()
async def get_ica_offers() -> Dict[str, Any]:
    """Get ICA offers from Sundbyberg store using the real API endpoint"""
    
    try:
        async with httpx.AsyncClient() as client:
            ica_config = CONSTANTS['stores']['ica']
            headers = ica_config['api']['headers']
            
            # Use the real ICA API endpoint for Sundbyberg store
            url = ica_config['api']['baseUrl'] + ica_config['api']['endpoints']['assortment']
            params = ica_config['api']['defaultParams']
            
            items = []
            
            try:
                response = await client.post(url, headers=headers, params=params, json={}, timeout=ica_config['api']['timeout'] / 1000.0)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse the real ICA API response structure
                    products = []
                    if 'data' in data:
                        # Look for products in the data structure
                        if 'products' in data['data']:
                            products = data['data']['products']
                        elif 'items' in data['data']:
                            products = data['data']['items']
                        elif 'offers' in data['data']:
                            products = data['data']['offers']
                        elif isinstance(data['data'], list):
                            products = data['data']
                    elif 'products' in data:
                        products = data['products']
                    elif 'items' in data:
                        products = data['items']
                    elif isinstance(data, list):
                        products = data
                    
                    for product in products[:30]:  # Limit to 30 items
                        if isinstance(product, dict):
                            # Extract product information from ICA API structure
                            name = product.get('name', product.get('title', product.get('productName', 'ICA Product')))
                            
                            # Handle ICA pricing structure
                            price_info = product.get('price', {})
                            current_price = price_info.get('current', product.get('currentPrice', ''))
                            original_price = price_info.get('original', product.get('originalPrice', ''))
                            unit = price_info.get('unit', product.get('unit', 'st'))
                            
                            # Handle discounts/offers
                            offer_info = product.get('offer', {})
                            discount_text = offer_info.get('text', product.get('discount', ''))
                            
                            # Extract numeric price values
                            current_price_val = extract_price_value(str(current_price))
                            original_price_val = extract_price_value(str(original_price))
                            
                            item = {
                                "name": name,
                                "price": f"{current_price} kr/{unit}" if current_price else "",
                                "price_value": current_price_val,
                                "original_price": f"{original_price} kr/{unit}" if original_price and original_price != current_price else "",
                                "discount": discount_text or (f"Save {original_price_val - current_price_val:.2f} kr" if original_price_val > current_price_val > 0 else ""),
                                "description": product.get('description', product.get('brand', '')),
                                "category": product.get('category', 'ICA'),
                                "brand": product.get('brand', product.get('manufacturer', 'ICA')),
                                "unit": unit,
                                "availability": "available"
                            }
                            items.append(item)
                
                working_url = f"{url}?accountNumber={params['accountNumber']}&channel={params['channel']}"
            except Exception as e:
                working_url = None
            
            return {
                "store_name": ica_config['name'],
                "store_id": ica_config['id'],
                "items": items,
                "item_count": len(items),
                "source_url": working_url or "Real ICA API endpoint failed",
                "note": f"Data from real ICA API for {ica_config['storeInfo']['location']} store" if items else "No offers found from real ICA API"
            }
            
    except Exception as e:
        ica_config = CONSTANTS['stores']['ica']
        return {
            "store_name": ica_config['name'],
            "store_id": ica_config['id'],
            "items": [],
            "item_count": 0,
            "error": str(e),
        }

@mcp.tool()
async def get_all_grocery_offers() -> Dict[str, Any]:
    """Get all current grocery offers from all stores"""
    
    # Get offers from all stores
    city_gross_data = await get_city_gross_offers()
    willys_data = await get_willys_offers()
    ica_data = await get_ica_offers()
    
    all_offers = {
        "stores": [city_gross_data, willys_data, ica_data],
        "total_items": (
            city_gross_data["item_count"] + 
            willys_data["item_count"] + 
            ica_data["item_count"]
        ),
        "data_source": "real_apis"
    }
    
    return all_offers

@mcp.tool()
async def get_store_offers(store_name: str) -> Dict[str, Any]:
    """Get offers from a specific store"""
    store_name_lower = store_name.lower()
    
    if "city gross" in store_name_lower or "citygross" in store_name_lower:
        return await get_city_gross_offers()
    elif "willys" in store_name_lower:
        return await get_willys_offers()
    elif "ica" in store_name_lower:
        return await get_ica_offers()
    else:
        return {
            "error": f"Store '{store_name}' not supported. Available stores: City Gross, Willys, ICA"
        }


if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')