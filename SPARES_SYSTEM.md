# 🔧 Truck Spares Inventory System

## Overview
Complete inventory management system for your second-hand truck spares business, integrated with the MH Towing dashboard.

## Features

### Inventory Management
- Add, edit, view, and delete spare parts
- Photo upload for each item
- Detailed part information (name, number, category, vehicle compatibility)
- Condition tracking (Excellent, Good, Fair, Poor)
- Stock level monitoring with low stock alerts
- Location/shelf tracking
- Cost and selling price management
- Profit margin calculation

### Categories
- 🔩 Engine Parts
- ⚙️ Transmission
- 🛞 Suspension
- 🛑 Brakes
- ⚡ Electrical
- 🚛 Body Parts
- 🪑 Interior
- 🔘 Wheels & Tires
- 📦 Other

### Search & Filtering
- Search by part name, number, vehicle, or description
- Filter by category
- Filter by stock level (In Stock, Low Stock, Out of Stock)
- Real-time filtering

### Sales Tracking
- Quick sell function with quantity selection
- Automatic stock deduction
- Sales total calculation
- Stock status updates

### Dashboard Statistics
- Total items in inventory
- Items in stock
- Low stock alerts
- Total inventory value

## How to Use

### Access the System
1. Go to Admin Dashboard: https://mh-towing-job-cards.onrender.com/admin.html
2. Click the **🔧 Spares** button
3. Or directly visit: https://mh-towing-job-cards.onrender.com/spares.html

### Add New Item
1. Click **➕ Add Item** button
2. Fill in the form:
   - Part Name (required)
   - Part Number (optional)
   - Category (required)
   - Vehicle Make/Model (optional)
   - Condition (required)
   - Quantity (required)
   - Cost Price (optional)
   - Selling Price (required)
   - Location/Shelf (optional)
   - Description (optional)
   - Photo (optional)
3. Click **Save Item**

### Edit Item
1. Find the item in the inventory
2. Click the **✏️** (edit) button
3. Update the information
4. Click **Save Item**

### View Item Details
1. Click on any item card
2. Or click the **👁️** (view) button
3. See complete details including:
   - Full specifications
   - Stock status
   - Pricing and profit margin
   - Creation and update dates

### Sell Item
1. Click the **💰** (sell) button on an item
2. Enter quantity to sell
3. System automatically:
   - Deducts from stock
   - Shows total sale amount
   - Updates stock status

### Delete Item
1. Click the **🗑️** (delete) button
2. Confirm deletion
3. Item is permanently removed

### Search & Filter
- Use search box to find items by name, number, vehicle, or description
- Select category from dropdown to filter by type
- Select stock level to see only in-stock, low-stock, or out-of-stock items
- Filters work together for precise results

## Stock Status Indicators

### In Stock (Green)
- 3 or more units available
- Ready for sale

### Low Stock (Yellow)
- 1-2 units remaining
- Consider restocking

### Out of Stock (Red)
- 0 units available
- Cannot be sold until restocked

## API Endpoints

### Get All Spares
```
GET /api/spares
```
Returns array of all spare parts.

### Get Single Spare
```
GET /api/spares/:id
```
Returns details of specific spare part.

### Add New Spare
```
POST /api/spares
```
Creates new spare part entry.

### Update Spare
```
PUT /api/spares/:id
```
Updates existing spare part.

### Delete Spare
```
DELETE /api/spares/:id
```
Removes spare part from inventory.

### Get Statistics
```
GET /api/spares/stats
```
Returns inventory statistics (total items, in stock, low stock, total value).

## Data Storage
- Spares data stored in: `./data/spares.json`
- Photos stored as base64 data URLs
- Automatic timestamps for creation and updates

## Best Practices

### Inventory Management
1. **Regular Updates**: Update stock levels after each sale
2. **Photo Documentation**: Add photos for valuable or unique parts
3. **Accurate Descriptions**: Include condition details and compatibility info
4. **Location Tracking**: Use shelf/bay locations for easy retrieval
5. **Price Management**: Keep cost prices updated for profit tracking

### Stock Control
1. **Monitor Low Stock**: Check low stock alerts regularly
2. **Restock Planning**: Use low stock indicators to plan purchases
3. **Accurate Counts**: Verify physical stock matches system
4. **Regular Audits**: Periodically check inventory accuracy

### Pricing Strategy
1. **Cost Tracking**: Always enter cost price for profit analysis
2. **Competitive Pricing**: Research market prices for similar parts
3. **Condition-Based**: Adjust prices based on condition
4. **Profit Margins**: Monitor margins to ensure profitability

## Mobile Friendly
- Fully responsive design
- Works on phones, tablets, and desktops
- Touch-friendly buttons and controls
- Optimized for on-the-go inventory management

## Integration
- Seamlessly integrated with MH Towing dashboard
- Same elegant purple gradient design
- Easy navigation between systems
- Consistent user experience

## Tips

### Quick Actions
- Click item card to view full details
- Use edit button for quick updates
- Sell button for fast transactions
- Delete for removing obsolete items

### Efficient Searching
- Search by part number for exact matches
- Search by vehicle to find compatible parts
- Use category filter to browse by type
- Combine filters for precise results

### Photo Management
- Take clear, well-lit photos
- Show part from multiple angles if possible
- Include any identifying marks or numbers
- Photos help with customer inquiries

## Support
For issues or questions, check the browser console (F12) for error messages.
