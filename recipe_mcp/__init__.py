"""
Recipe MCP - A Model Context Protocol server for fetching grocery offers from Swedish supermarkets.

This package provides tools to fetch current offers from City Gross, Willys, and ICA stores.
"""

__version__ = "0.1.0"
__author__ = "Sathwik Katepally"

from .foodmcp import (
    get_city_gross_offers,
    get_willys_offers,
    get_ica_offers,
    get_all_grocery_offers,
    get_store_offers,
    main
)

__all__ = [
    "get_city_gross_offers",
    "get_willys_offers", 
    "get_ica_offers",
    "get_all_grocery_offers",
    "get_store_offers",
    "main"
]