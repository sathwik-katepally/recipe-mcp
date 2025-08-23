from typing import Any, Dict
import httpx
import re
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("food-app-mcp")

async def get_api_request(url: str, headers: dict = None) -> dict[str, Any] | None:
    """Make a request to API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers or {}, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

async def get_page_content(url: str, headers: dict = None) -> str | None:
    """Get page content using httpx for simple scraping"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers or {}, timeout=30.0)
            response.raise_for_status()
            return response.text
        except Exception:
            return None

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
async def get_grocery_offers() -> Dict[str, Any]:
    """Fetch all current grocery offers from Swedish stores with structured data"""
    
    all_offers = {
        "stores": [],
        "total_items": 0,
        "last_updated": "2024-08-23"
    }
    
    # City Gross offers
    try:
        city_gross_url = "https://www.citygross.se/api/v1/Loop54/category/2930/products?categoryName=Veckans%20erbjudanden&currentWeekDiscountOnly=true&skip=0&take=50"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.citygross.se/'
        }
        
        data = await get_api_request(city_gross_url, headers)
        city_gross_items = []
        
        if data and 'products' in data:
            for product in data['products'][:30]:  # Limit items
                item = {
                    "name": product.get('name', 'Unknown'),
                    "price": product.get('price', {}).get('formatted', ''),
                    "price_value": extract_price_value(product.get('price', {}).get('formatted', '')),
                    "original_price": product.get('originalPrice', {}).get('formatted', ''),
                    "discount": product.get('discount', ''),
                    "description": product.get('description', ''),
                    "category": product.get('category', ''),
                    "brand": product.get('brand', ''),
                    "unit": product.get('unit', ''),
                    "image_url": product.get('imageUrl', ''),
                    "availability": product.get('availability', 'unknown')
                }
                city_gross_items.append(item)
        
        all_offers["stores"].append({
            "store_name": "City Gross",
            "store_id": "citygross",
            "items": city_gross_items,
            "item_count": len(city_gross_items)
        })
        
    except Exception as e:
        all_offers["stores"].append({
            "store_name": "City Gross",
            "store_id": "citygross", 
            "items": [],
            "item_count": 0,
            "error": str(e)
        })
    
    # Willys offers
    try:
        willys_url = "https://www.willys.se/api/c-api/v1/campaigns?size=50"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.willys.se/'
        }
        
        data = await get_api_request(willys_url, headers)
        willys_items = []
        
        if data and 'results' in data:
            for campaign in data['results'][:25]:  # Limit items
                item = {
                    "name": campaign.get('name', 'Unknown'),
                    "price": campaign.get('price', ''),
                    "price_value": extract_price_value(campaign.get('price', '')),
                    "original_price": campaign.get('originalPrice', ''),
                    "discount": campaign.get('discount', ''),
                    "description": campaign.get('description', ''),
                    "category": campaign.get('category', ''),
                    "brand": campaign.get('brand', ''),
                    "valid_from": campaign.get('validFrom', ''),
                    "valid_to": campaign.get('validTo', ''),
                    "image_url": campaign.get('imageUrl', ''),
                    "availability": campaign.get('availability', 'unknown')
                }
                willys_items.append(item)
        
        all_offers["stores"].append({
            "store_name": "Willys", 
            "store_id": "willys",
            "items": willys_items,
            "item_count": len(willys_items)
        })
        
    except Exception as e:
        all_offers["stores"].append({
            "store_name": "Willys",
            "store_id": "willys",
            "items": [],
            "item_count": 0,
            "error": str(e)
        })
    
    # ICA offers
    try:
        ica_url = "https://www.ica.se/api/recipes/offers"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.ica.se/'
        }
        
        data = await get_api_request(ica_url, headers)
        ica_items = []
        
        if data and 'offers' in data:
            for offer in data['offers'][:25]:  # Limit items
                item = {
                    "name": offer.get('name', 'Unknown'),
                    "price": offer.get('price', ''),
                    "price_value": extract_price_value(offer.get('price', '')),
                    "original_price": offer.get('originalPrice', ''),
                    "discount": offer.get('discount', ''),
                    "description": offer.get('description', ''),
                    "category": offer.get('category', ''),
                    "brand": offer.get('brand', ''),
                    "valid_from": offer.get('validFrom', ''),
                    "valid_to": offer.get('validTo', ''),
                    "image_url": offer.get('imageUrl', ''),
                    "availability": offer.get('availability', 'unknown')
                }
                ica_items.append(item)
        
        all_offers["stores"].append({
            "store_name": "ICA",
            "store_id": "ica", 
            "items": ica_items,
            "item_count": len(ica_items)
        })
        
    except Exception as e:
        all_offers["stores"].append({
            "store_name": "ICA",
            "store_id": "ica",
            "items": [],
            "item_count": 0,
            "error": str(e)
        })
    
    # Calculate total items
    all_offers["total_items"] = sum(store["item_count"] for store in all_offers["stores"])
    
    return all_offers

@mcp.tool()
async def get_store_offers(store_name: str) -> Dict[str, Any]:
    """Get offers from a specific store (citygross, willys, or ica)"""
    all_offers = await get_grocery_offers()
    
    store_name_lower = store_name.lower()
    store_mapping = {
        "city gross": "citygross", 
        "willys": "willys",
        "ica": "ica"
    }
    
    target_store_id = store_mapping.get(store_name_lower)
    if not target_store_id:
        return {
            "error": f"Store '{store_name}' not supported. Available stores: City Gross, Willys, ICA"
        }
    
    for store in all_offers["stores"]:
        if store["store_id"] == target_store_id:
            return store
    
    return {"error": f"No data found for {store_name}"}


if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')