# Recipe MCP

A Model Context Protocol (MCP) server for fetching grocery offers from Swedish supermarkets.

## Features

- Get current offers from City Gross, Willys, and ICA stores
- Real-time pricing and discount information
- Support for individual store queries or all stores at once

## Installation

### From PyPI (once published)

```bash
pip install recipe-mcp
```

### From Source

```bash
git clone https://github.com/sathwik-katepally/recipe-mcp.git
cd recipe-mcp
pip install -e .
```

## Tools

- `get_city_gross_offers()` - Fetch weekly offers from City Gross
- `get_willys_offers()` - Fetch offers from Willys
- `get_ica_offers()` - Fetch offers from ICA Sundbyberg store
- `get_all_grocery_offers()` - Get offers from all supported stores
- `get_store_offers(store_name)` - Get offers from a specific store

## Usage

### As a Command Line Tool

```bash
recipe-mcp
```

### As a Python Module

```bash
python -m recipe_mcp.foodmcp
```

### Programmatic Usage

```python
from recipe_mcp import get_all_grocery_offers

# Get offers from all stores
offers = await get_all_grocery_offers()
print(offers)
```

The server uses stdio transport and integrates with MCP-compatible clients.

## Development

### Requirements

- Python 3.8+
- httpx
- mcp

### Running Tests

```bash
npm install
npm test
```

## Publishing

This package is automatically published to PyPI when a new release is created on GitHub. The workflow will:

1. Build the package
2. Publish to PyPI using GitHub Actions
3. Create a release with the new version

### Creating a Release

1. Update the version in `pyproject.toml`
2. Create a git tag:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
3. Create a release on GitHub, which will trigger the publish workflow

## License

MIT