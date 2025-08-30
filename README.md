# Recipe MCP

A Model Context Protocol (MCP) server for fetching grocery offers from Swedish supermarkets.

## Features

- Get current offers from City Gross, Willys, and ICA stores
- Real-time pricing and discount information
- Support for individual store queries or all stores at once

## Tools

- `get_city_gross_offers()` - Fetch weekly offers from City Gross
- `get_willys_offers()` - Fetch offers from Willys
- `get_ica_offers()` - Fetch offers from ICA Sundbyberg store
- `get_all_grocery_offers()` - Get offers from all supported stores
- `get_store_offers(store_name)` - Get offers from a specific store

## Usage

Run the MCP server:

```bash
python main.py
```

The server uses stdio transport and integrates with MCP-compatible clients.