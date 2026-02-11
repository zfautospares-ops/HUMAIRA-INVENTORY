# 🔧 Truck Spares Inventory System

## Overview
Complete inventory management system for your second-hand truck spares business, integrated with the MH Towing dashboard. Now includes comprehensive sales tracking and reporting!

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

### Sales Tracking ⭐ NEW
- Complete sales history with detailed records
- Customer information capture (name, phone)
- Sale notes and additional details
- Automatic stock deduction
- Real-time sales statistics
- Date range filtering
- Search sales by part or customer
- Profit tracking per sale

### Sales Statistics
- Today's sales total
- This week's sales
- This month's sales
- All-time total sales
- Individual sale profit margins
- 🔩 Engine Parts
- ⚙️ Transmission
- 🛞 Suspension
- 🛑 Brakes
- ⚡ Electrical
- 🚛 Body Parts
- 🪑 Interior
- 🔘 Wheels & Tires
- 📦 Other

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

### Dashboard Statistics
- Total items in inventory
- Items in stock
- Low stock alerts
- Total inventory value
- Today's sales (highlighted)
- Total sales (highlighted)

## How to Use

### Access the System
1. Go to Admin Dashboard: https://mh-towing-job-cards.onrender.com/admin.html
2. Click the **🔧 Spares** button
3. Or directly visit: https://mh-towing-job-cards.onrender.com/spares.html

### Record a Sale ⭐ NEW
1. Find the item you want to sell
2. Click the **💰** (sell) button
3. Enter sale details:
   - Quantity to sell (max = available stock)
   - Unit price (pre-filled with standard price, editable)
   - Customer name (optional)
   - Customer phone (optional)
   - Sale notes (optional)
4. Review the total amount
5. Click **Complete Sale**
6. Stock automatically deducted
7. Sale recorded in history

### View Sales History ⭐ NEW
1. Click the **📊 Sales** button in the header
2. View sales summary cards:
   - Today's sales
   - This week's sales
   - This month's sales
   - Total sales
3. Browse all sales with details:
   - Part name and number
   - Sale date and time
   - Quantity and unit price
   - Total amount
   - Profit (if cost price was entered)
   - Customer information
   - Notes
4. Filter sales:
   - By date range (from/to dates)
   - By search term (part name, customer)
5. All sales sorted newest first

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

## Sales Features ⭐ NEW

### Recording Sales
When you sell an item:
1. System captures all sale details
2. Automatically deducts from stock
3. Calculates profit if cost price is available
4. Records customer information
5. Timestamps the transaction
6. Updates all statistics

### Sales Information Captured
- Part details (name, number, category)
- Quantity sold
- Unit price (can differ from standard price)
- Total amount
- Cost and profit
- Customer name and phone
- Sale notes
- Date and time

### Sales Reports
View comprehensive sales data:
- **Summary Cards**: Quick view of sales by period
- **Detailed List**: Every sale with full information
- **Filtering**: Find specific sales by date or search
- **Profit Tracking**: See profit on each sale
- **Customer History**: Track sales to specific customers

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

### Inventory Endpoints

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

### Get Inventory Statistics
```
GET /api/spares/stats
```
Returns inventory statistics (total items, in stock, low stock, total value).

### Sales Endpoints ⭐ NEW

### Get All Sales
```
GET /api/spares/sales
```
Returns array of all sales records.

### Record New Sale
```
POST /api/spares/sales
```
Creates new sale record.

### Get Sales Statistics
```
GET /api/spares/sales/stats
```
Returns sales statistics (today, week, month, total).

## Data Storage
- Spares data stored in: `./data/spares.json`
- Sales data stored in: `./data/sales.json` ⭐ NEW
- Photos stored as base64 data URLs
- Automatic timestamps for creation and updates

## Best Practices

### Inventory Management
1. **Regular Updates**: Update stock levels after each sale
2. **Photo Documentation**: Add photos for valuable or unique parts
3. **Accurate Descriptions**: Include condition details and compatibility info
4. **Location Tracking**: Use shelf/bay locations for easy retrieval
5. **Price Management**: Keep cost prices updated for profit tracking

### Sales Management ⭐ NEW
1. **Customer Information**: Capture customer details for repeat business
2. **Accurate Pricing**: Verify prices before completing sale
3. **Sale Notes**: Add relevant details (warranty, special terms, etc.)
4. **Regular Review**: Check sales history to identify trends
5. **Profit Tracking**: Monitor profit margins to optimize pricing

### Stock Control
1. **Monitor Low Stock**: Check low stock alerts regularly
2. **Restock Planning**: Use low stock indicators to plan purchases
3. **Accurate Counts**: Verify physical stock matches system
4. **Regular Audits**: Periodically check inventory accuracy
5. **Sales Analysis**: Review sales data to stock popular items

### Pricing Strategy
1. **Cost Tracking**: Always enter cost price for profit analysis
2. **Competitive Pricing**: Research market prices for similar parts
3. **Condition-Based**: Adjust prices based on condition
4. **Profit Margins**: Monitor margins to ensure profitability
5. **Flexible Pricing**: Adjust unit price during sale if needed

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
- Sell button opens detailed sale form
- Delete for removing obsolete items
- Sales button shows complete history

### Efficient Searching
- Search by part number for exact matches
- Search by vehicle to find compatible parts
- Use category filter to browse by type
- Combine filters for precise results
- Search sales by customer name

### Sales Tracking
- Record every sale for accurate reporting
- Add customer info to build database
- Use notes field for important details
- Review sales regularly for insights
- Track profit margins on all sales

### Photo Management
- Take clear, well-lit photos
- Show part from multiple angles if possible
- Include any identifying marks or numbers
- Photos help with customer inquiries

## Business Insights ⭐ NEW

### Sales Analytics
The sales system helps you:
- **Identify Best Sellers**: See which parts sell most
- **Track Revenue**: Monitor daily, weekly, monthly income
- **Customer Relationships**: Build customer database
- **Profit Analysis**: Understand which parts are most profitable
- **Inventory Planning**: Stock items that sell well
- **Pricing Optimization**: Adjust prices based on sales data

### Reports Available
- Sales by time period (today, week, month, all-time)
- Individual sale details with profit
- Customer purchase history
- Part sales frequency
- Revenue trends

## Support
For issues or questions, check the browser console (F12) for error messages.
