# CSV Product Import Guide

## Overview
The CSV import feature allows you to bulk-upload products to your inventory with images and automatic data mapping.

## CSV Format

Your CSV file should have the following columns (case-insensitive):
- **name** (required) - Product name
- **price** (required) - Product price (number)
- **category** - One of: Dried Flower, Edible, Vape, Pre-Roll, Beverage, Accessories
- **brand** - Brand name (optional)
- **strain** - One of: Indica, Sativa, Hybrid (optional)
- **thc** - THC percentage (e.g., "24%") (optional)
- **cbd** - CBD percentage (e.g., "15%") (optional)
- **weight** - Product weight (e.g., "3.5g") (optional)
- **description** - Product description (optional)
- **image** - Image URL or leave blank to upload during import (optional)
- **in_stock** - true/false (defaults to true)
- **quantity** - Stock quantity (number)

## Example CSV

```csv
name,price,category,brand,strain,thc,cbd,weight,description,image,in_stock,quantity
Island Pink Kush,34.99,Dried Flower,Bud N' Buddies,Indica,24%,,3.5g,Heavy-hitting indica with floral notes.,https://example.com/image1.jpg,true,10
Blue Dream,29.99,Dried Flower,Bud N' Buddies,Sativa,19%,,3.5g,Legendary sativa-dominant hybrid.,https://example.com/image2.jpg,true,8
Berry Blast Gummies,15.99,Edible,Bud N' Buddies,Hybrid,10mg,,10pk,10mg THC gummies infused with berry.,https://example.com/image3.jpg,true,25
```

## How to Import

1. Go to **Admin Dashboard** → **Inventory** tab
2. Click **Import CSV** button
3. Select your CSV file
4. Review the preview:
   - Each product is shown with a checkbox
   - You can upload images for any product without one
   - Deselect products you don't want to import
5. Click **Import** to create all selected products

## Uploading Images During Import

- If your CSV has an **image** column with URLs, those images will be used
- If the image column is empty, you can click the image area to upload a file
- Supported formats: JPG, PNG, GIF, WebP
- Max file size: 2MB (enforced client-side)
- Images are converted to base64 and stored in the database

## Tips

- **Column names are case-insensitive** - "Name", "NAME", "name" all work
- **Missing columns** - If a column isn't in your CSV, that field will be empty
- **Extra columns** - Extra columns in your CSV are ignored
- **Price validation** - Prices must be valid numbers
- **Selective import** - Use checkboxes to import only the products you want
- **Batch operations** - You can import 50+ products at once

## Troubleshooting

**"Import failed" error**
- Check that your CSV is properly formatted
- Ensure all required fields (name, price) are present
- Try importing a smaller batch first

**Images not showing**
- Verify image URLs are accessible
- If using local files, you must upload during the import preview
- File size should be under 2MB

**Products created but missing data**
- Some fields may be empty if not provided in CSV
- You can edit products individually to fill in missing details

## Sample File

A sample CSV file is included: `SAMPLE_PRODUCTS.csv`

You can use it as a template for your own imports.
