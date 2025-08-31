# Recipe MCP

A Model Context Protocol (MCP) server for fetching grocery offers from Swedish supermarkets.

## Installation

1. Download the latest `.whl` file from [Releases](https://github.com/sathwik-katepally/recipe-mcp/releases)
2. Install with pip:

```bash
pip install recipe_mcp-0.1.2-py3-none-any.whl
```

## Claude Desktop Setup

Add to your Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "recipe-mcp": {
      "command": "recipe-mcp"
    }
  }
}
```

## Usage

Run the MCP server:

```bash
recipe-mcp
```

The server provides tools to get grocery offers from City Gross, Willys, and ICA stores.