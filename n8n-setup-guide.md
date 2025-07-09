# N8N Workflow Configuration Guide

## Step 1: Update Airtable Base ID

After importing the workflow into n8n, you need to update these settings:

### In each Airtable node, replace:
- `"application": "app12345678"` → `"application": "YOUR_ACTUAL_BASE_ID"`

**Nodes to update:**
1. "Store in Airtable"
2. "Get User Emotion History" 
3. "Get Cheaper Alternatives"
4. "Get Premium Products"

## Step 2: Configure Airtable Credentials in N8N

1. Go to your n8n instance
2. Click **Credentials** in the left menu
3. Click **+ Add Credential**
4. Select **Airtable Personal Access Token**
5. Enter your token (starts with `pat_...`)
6. Name it: "Airtable Credentials"
7. Save

## Step 3: Add Sample Data to Your Airtable

### Products Table Sample Data:

**Electronics - Premium Products:**
```
Name: "MacBook Pro 16-inch"
Price: ₹250000
Category: Electronics
IsPremium: ✓
Available: ✓
Rating: 4.8
Features: "M3 Max chip, 32GB RAM, 1TB SSD"

Name: "iPhone 15 Pro Max"
Price: ₹150000
Category: Electronics
IsPremium: ✓
Available: ✓
Rating: 4.9
Features: "Titanium design, A17 Pro chip, 256GB"

Name: "Sony WH-1000XM5"
Price: ₹35000
Category: Electronics
IsPremium: ✓
Available: ✓
Rating: 4.7
Features: "Active noise canceling, 30-hour battery"
```

**Electronics - Alternative Products:**
```
Name: "HP Pavilion Laptop"
Price: ₹65000
Category: Electronics
IsAlternative: ✓
Available: ✓
Rating: 4.2
Features: "Intel i5, 8GB RAM, 512GB SSD"

Name: "OnePlus Nord 3"
Price: ₹35000
Category: Electronics
IsAlternative: ✓
Available: ✓
Rating: 4.3
Features: "Snapdragon 8 Gen 2, 128GB, 5G"

Name: "JBL Tune 770NC"
Price: ₹8000
Category: Electronics
IsAlternative: ✓
Available: ✓
Rating: 4.1
Features: "Wireless, noise canceling, 44-hour battery"
```

**Fashion - Premium:**
```
Name: "Apple Watch Ultra"
Price: ₹89000
Category: Fashion
IsPremium: ✓
Available: ✓
Rating: 4.6
Features: "Titanium case, GPS + Cellular, 49mm"

Name: "Nike Air Jordan 1"
Price: ₹15000
Category: Fashion
IsPremium: ✓
Available: ✓
Rating: 4.8
Features: "Leather upper, classic colorway, limited edition"
```

**Fashion - Alternatives:**
```
Name: "Samsung Galaxy Watch 6"
Price: ₹25000
Category: Fashion
IsAlternative: ✓
Available: ✓
Rating: 4.4
Features: "AMOLED display, health tracking, 40mm"

Name: "Adidas Ultraboost 23"
Price: ₹8000
Category: Fashion
IsAlternative: ✓
Available: ✓
Rating: 4.3
Features: "Boost midsole, Primeknit upper, energy return"
```

### WellnessContent Table Sample Data:

**Quotes:**
```
Type: Quote
Content: "Take time to breathe. You're doing better than you think. 🌸"
Category: Mindfulness
IsActive: ✓

Type: Quote
Content: "Your wellbeing matters more than any product. 🧘‍♀️"
Category: Mindfulness
IsActive: ✓

Type: Quote
Content: "Sometimes the best buy is to not buy at all. 🌱"
Category: Financial Wellness
IsActive: ✓
```

**Journal Apps:**
```
Type: JournalApp
Title: "Daylio"
URL: https://daylio.net
Content: "Simple micro mood diary to track your emotions"
Platform: "Mobile App"
Category: Journaling
IsActive: ✓

Type: JournalApp
Title: "Journey"
URL: https://journey.cloud
Content: "Beautiful journaling experience with photos and locations"
Platform: "Cross-platform"
Category: Journaling
IsActive: ✓
```

**Calming Content:**
```
Type: Playlist
Title: "Peaceful Piano"
URL: https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u
Content: "Relaxing piano music for stress relief"
Platform: "Spotify"
Category: Music
IsActive: ✓

Type: Meditation
Title: "Headspace Stress Relief"
URL: https://www.headspace.com/meditation/stress
Content: "Guided meditation for managing stress and anxiety"
Platform: "Headspace"
Category: Meditation
IsActive: ✓
```

## Step 4: Update Flask App Webhook URL

Update your Flask app's webhook URL to point to your n8n instance:

```python
# In your app.py, replace:
N8N_WEBHOOK_URL = "https://your-n8n-domain/webhook/emotion-capture"

# With your actual n8n webhook URL, for example:
N8N_WEBHOOK_URL = "https://your-n8n-instance.app.n8n.cloud/webhook/emotion-capture"
```

## Step 5: Test the Workflow

### Test Payload for Flask API:
```json
{
  "image": "base64_encoded_image_here",
  "userId": "test_user_001",
  "productId": "laptop_001", 
  "price": 75000,
  "category": "Electronics"
}
```

### Expected Responses:

**Happy Emotion:**
```json
{
  "success": true,
  "emotion": "happy",
  "confidence": 0.89,
  "recommendation": {
    "type": "premium_recommendation",
    "message": "Since you're happy with this choice, you might also love these premium options! ✨",
    "products": [...]
  }
}
```

**Sad + Expensive:**
```json
{
  "success": true,
  "emotion": "sad", 
  "confidence": 0.76,
  "recommendation": {
    "type": "cheaper_alternative",
    "message": "We found some great alternatives that might be easier on your budget! 💰",
    "bestAlternative": {...}
  }
}
```

**Wellness Mode (3+ sad):**
```json
{
  "success": true,
  "emotion": "sad",
  "recommendation": {
    "type": "wellness",
    "message": "We've noticed you might need some emotional support...",
    "wellness": {
      "quote": "Take time to breathe...",
      "journalApp": {...},
      "calmingContent": {...}
    }
  },
  "wellnessAlert": {
    "triggered": true,
    "consecutiveCount": 3
  }
}
```

## Step 6: Monitor and Debug

1. Check n8n execution history for errors
2. Verify Airtable data is being stored correctly
3. Test different emotion scenarios
4. Monitor Flask app logs for webhook responses

Your emotion-aware recommendation system is now ready! 🚀

## Step 3A: Real Product Data Integration

### Your Actual Product Data Structure
Based on your CSV data, update your Airtable **Products** table with these fields:

**Required Fields:**
- `id` (Number) - Unique product identifier
- `productDisplayName` (Single line text) - Product name
- `price` (Number) - Product price
- `masterCategory` (Single select: Apparel, Accessories, Footwear, etc.)
- `subCategory` (Single line text) - Subcategory
- `articleType` (Single line text) - Specific type (Shirts, Jeans, Watches, etc.)
- `gender` (Single select: Men, Women, Unisex)
- `baseColour` (Single line text) - Primary color
- `season` (Single select: Summer, Winter, Fall, Spring)
- `year` (Number) - Product year
- `usage` (Single select: Casual, Formal, Party, Sports)
- `filename` (Single line text) - Image filename
- `link` (URL) - Product image URL
- `IsPremium` (Checkbox) - Mark expensive items as premium
- `IsAlternative` (Checkbox) - Mark budget-friendly alternatives
- `Available` (Checkbox) - Product availability
- `Rating` (Number) - Product rating (1-5)

### Sample Data from Your CSV:

**Premium Products (Price > ₹1000):**
```
id: 15970
productDisplayName: "Turtle Check Men Navy Blue Shirt"
price: 1000
masterCategory: "Apparel"
subCategory: "Topwear" 
articleType: "Shirts"
gender: "Men"
baseColour: "Navy Blue"
season: "Fall"
year: 2011
usage: "Casual"
filename: "15970"
link: "http://assets.myntassets.com/v1/images/style/properties/7a5b82d1372a7a5c6de67ae7a314fd91_images.jpg"
IsPremium: ✓
Available: ✓
Rating: 4.2

id: 39386
productDisplayName: "Peter England Men Party Blue Jeans"
price: 1400
masterCategory: "Apparel"
subCategory: "Bottomwear"
articleType: "Jeans" 
gender: "Men"
baseColour: "Blue"
season: "Summer"
year: 2012
usage: "Casual"
IsPremium: ✓
Available: ✓
Rating: 4.5
```

**Alternative Products (Price ≤ ₹1000):**
```
id: 59263
productDisplayName: "Titan Women Silver Watch"
price: 500
masterCategory: "Accessories"
subCategory: "Watches"
articleType: "Watches"
gender: "Women"
baseColour: "Silver"
season: "Winter"
year: 2016
usage: "Casual"
filename: "59263"
link: "http://assets.myntassets.com/v1/images/style/properties/Titan-Women-Silver-Watch_b4ef04538840c0020e4829ecc042ead1_images.jpg"
IsAlternative: ✓
Available: ✓
Rating: 4.0
```

### N8N Workflow Updates for Real Data

Update your N8N workflow nodes to use the real product fields:

**1. Enhanced "Get Premium Products" Node:**
```javascript
// Filter for premium products based on user context
const filters = [];

// Price-based premium filtering
if (items[0].json.price < 1000) {
  filters.push({
    field: 'price',
    operator: 'greaterThan',
    value: items[0].json.price
  });
} else {
  filters.push({
    field: 'IsPremium',
    operator: 'equal',
    value: true
  });
}

// Category matching
filters.push({
  field: 'masterCategory',
  operator: 'equal', 
  value: items[0].json.category || 'Apparel'
});

// Gender preference (if available)
if (items[0].json.gender) {
  filters.push({
    field: 'gender',
    operator: 'equal',
    value: items[0].json.gender
  });
}

return { filters };
```

**2. Enhanced "Get Cheaper Alternatives" Node:**
```javascript
// Find alternatives based on user's current selection
const currentPrice = items[0].json.price || 1000;
const currentCategory = items[0].json.category || 'Apparel';
const targetBudget = Math.max(currentPrice * 0.7, 500); // 30% less or minimum ₹500

const filters = [
  {
    field: 'price',
    operator: 'lessThanOrEqual',
    value: targetBudget
  },
  {
    field: 'masterCategory',
    operator: 'equal',
    value: currentCategory
  },
  {
    field: 'Available',
    operator: 'equal',
    value: true
  }
];

// Optional: Same gender preference
if (items[0].json.gender) {
  filters.push({
    field: 'gender',
    operator: 'equal',
    value: items[0].json.gender
  });
}

return { filters };
```

### Enhanced Response Formatting

Update your N8N response node to include real product details:

```javascript
// Format product recommendation response
const formatProduct = (product) => ({
  id: product.id,
  name: product.productDisplayName,
  price: product.price,
  category: product.masterCategory,
  subCategory: product.subCategory,
  type: product.articleType,
  gender: product.gender,
  color: product.baseColour,
  season: product.season,
  usage: product.usage,
  rating: product.Rating || 4.0,
  image: product.link,
  features: `${product.baseColour} ${product.articleType} for ${product.usage} use`,
  year: product.year,
  filename: product.filename
});

// Response based on emotion and scenario
const emotion = items[0].json.emotion;
const price = items[0].json.price || 1000;

if (emotion === 'happy') {
  return {
    type: 'premium_recommendation',
    message: `Since you're feeling great, check out these premium ${items[0].json.category || 'fashion'} items! ✨`,
    recommendations: {
      all: $node["Get Premium Products"].json.records.map(formatProduct),
      primary: formatProduct($node["Get Premium Products"].json.records[0])
    }
  };
} else if (emotion === 'sad' && price > 1000) {
  const alternatives = $node["Get Cheaper Alternatives"].json.records;
  return {
    type: 'cheaper_alternative',
    message: `We found some great alternatives that are easier on your budget! 💰`,
    bestAlternative: formatProduct(alternatives[0]),
    savings: price - alternatives[0].price,
    allAlternatives: alternatives.slice(0, 3).map(formatProduct)
  };
}

// Default response
return {
  type: 'standard_response',
  message: 'Here are some products you might like!',
  products: $node["Get Premium Products"].json.records.slice(0, 2).map(formatProduct)
};
```

## Step 7: Optimizing for Large Dataset (40K+ Products)

🎉 **Congratulations!** You've loaded 40,000 products into Airtable. Here's how to optimize your system for this massive dataset:

### A. Airtable Performance Optimization

**1. Index Your Key Fields**
Ensure these fields are properly indexed for faster queries:
- `price` (for budget-based filtering)
- `masterCategory` (for category matching)
- `gender` (for demographic targeting)
- `IsPremium` & `IsAlternative` (for recommendation types)
- `Available` (to exclude out-of-stock items)

**2. Use Filtered Views in Airtable**
Create these views to speed up N8N queries:

```
View: "Premium_Men_Apparel"
Filter: masterCategory = "Apparel" AND gender = "Men" AND price > 1500 AND Available = true

View: "Budget_Women_Accessories" 
Filter: masterCategory = "Accessories" AND gender = "Women" AND price <= 1000 AND Available = true

View: "Premium_Electronics"
Filter: masterCategory = "Electronics" AND price > 5000 AND Available = true

View: "Casual_Footwear_Alternatives"
Filter: masterCategory = "Footwear" AND usage = "Casual" AND price <= 2000 AND Available = true
```

**3. Implement Smart Pagination**
Update your N8N nodes to use pagination for better performance:

```javascript
// Enhanced N8N Query with Pagination
{
  "maxRecords": 20,  // Limit results for faster response
  "sort": [
    {
      "field": "price",
      "direction": "asc"  // or "desc" for premium items
    },
    {
      "field": "Rating", 
      "direction": "desc"  // Prioritize highly rated items
    }
  ],
  "filterByFormula": "AND({Available} = 1, {price} <= 2000, {masterCategory} = 'Apparel')"
}
```

### B. Enhanced Product Recommendation Logic

**1. Multi-Stage Filtering Strategy**
```javascript
// Stage 1: Broad Category Filter (Fast)
const primaryFilters = [
  `{masterCategory} = "${userCategory}"`,
  `{Available} = 1`
];

// Stage 2: Emotional Context Filter
if (emotion === 'happy') {
  primaryFilters.push(`{price} >= ${currentPrice * 1.2}`); // 20% higher budget
  primaryFilters.push(`{Rating} >= 4.0`); // High-quality items
} else if (emotion === 'sad') {
  primaryFilters.push(`{price} <= ${currentPrice * 0.8}`); // 20% lower budget
  primaryFilters.push(`{IsAlternative} = 1`); // Budget-friendly alternatives
}

// Stage 3: Demographic Filter
if (userGender) {
  primaryFilters.push(`OR({gender} = "${userGender}", {gender} = "Unisex")`);
}

// Stage 4: Seasonal Relevance
const currentSeason = getCurrentSeason();
primaryFilters.push(`OR({season} = "${currentSeason}", {season} = "All Season")`);

const formula = `AND(${primaryFilters.join(', ')})`;
```

**2. Smart Recommendation Categories**
Based on your 40K dataset, create these recommendation types:

```javascript
const recommendationStrategies = {
  'happy_premium': {
    filter: 'AND({price} > 2000, {Rating} >= 4.5, {Available} = 1)',
    maxResults: 10,
    message: "Since you're feeling great, treat yourself to these premium items! ✨"
  },
  
  'sad_budget': {
    filter: 'AND({price} <= 1000, {IsAlternative} = 1, {Available} = 1)',
    maxResults: 15,
    message: "Here are some budget-friendly options that won't break the bank 💰"
  },
  
  'neutral_trending': {
    filter: 'AND({year} >= 2020, {Rating} >= 4.0, {Available} = 1)',
    maxResults: 12,
    message: "Check out these trending items that others are loving! 📈"
  },
  
  'angry_comfort': {
    filter: 'AND({usage} = "Casual", {baseColour} IN ("Black", "Grey", "Navy Blue"), {Available} = 1)',
    maxResults: 8,
    message: "Sometimes comfort is key. Here are some relaxing options 😌"
  }
};
```

### C. Performance Monitoring & Analytics

**1. Track Query Performance**
Add these metrics to your N8N workflow:

```javascript
// Performance tracking node
const startTime = Date.now();

// ... your Airtable query ...

const endTime = Date.now();
const queryTime = endTime - startTime;

// Log performance metrics
console.log(`Query completed in ${queryTime}ms`);
console.log(`Results returned: ${results.length}`);

// Alert if query is slow
if (queryTime > 5000) {
  // Send alert or optimize query
  console.warn(`Slow query detected: ${queryTime}ms`);
}
```

**2. Cache Popular Queries**
Implement caching for frequently accessed data:

```javascript
// Cache key based on query parameters
const cacheKey = `${emotion}_${category}_${gender}_${priceRange}`;

// Check cache first
const cachedResults = await getFromCache(cacheKey);
if (cachedResults && cachedResults.timestamp > Date.now() - 300000) { // 5 min cache
  return cachedResults.data;
}

// If not cached, query Airtable and cache result
const freshResults = await queryAirtable(filters);
await setCache(cacheKey, freshResults, 300000); // 5 min expiry
return freshResults;
```

### D. Advanced Emotion-Based Recommendations

**1. Emotion-to-Category Mapping**
With 40K products, you can create sophisticated mappings:

```javascript
const emotionCategoryMapping = {
  'happy': {
    primary: ['Apparel', 'Accessories', 'Electronics'],
    colors: ['Bright', 'Colorful', 'Yellow', 'Orange', 'Pink'],
    priceMultiplier: 1.3, // Willing to spend 30% more when happy
    usage: ['Party', 'Formal', 'Casual']
  },
  
  'sad': {
    primary: ['Apparel', 'Personal Care', 'Books'],
    colors: ['Comfort', 'Neutral', 'Blue', 'Grey', 'Black'],
    priceMultiplier: 0.7, // More budget-conscious when sad
    usage: ['Casual', 'Comfort']
  },
  
  'angry': {
    primary: ['Sports', 'Fitness', 'Electronics'],
    colors: ['Red', 'Black', 'Bold'],
    priceMultiplier: 0.9,
    usage: ['Sports', 'Active']
  },
  
  'surprise': {
    primary: ['Accessories', 'Electronics', 'Novelty'],
    colors: ['Bright', 'Unique', 'Colorful'],
    priceMultiplier: 1.1,
    usage: ['Party', 'Casual']
  }
};
```

**2. Dynamic Price Range Calculation**
```javascript
// Calculate optimal price range based on dataset
const calculatePriceRange = async (category, emotion) => {
  const priceStats = await getAirtableStats(`
    SELECT 
      AVG(price) as avgPrice,
      MIN(price) as minPrice, 
      MAX(price) as maxPrice,
      PERCENTILE_CONT(0.25) as q1,
      PERCENTILE_CONT(0.75) as q3
    FROM Products 
    WHERE masterCategory = '${category}' AND Available = 1
  `);
  
  const multiplier = emotionCategoryMapping[emotion].priceMultiplier;
  
  return {
    min: Math.round(priceStats.q1 * multiplier),
    max: Math.round(priceStats.q3 * multiplier),
    suggested: Math.round(priceStats.avgPrice * multiplier)
  };
};
```

### E. Frontend Optimization for Large Dataset

Update your React frontend to handle the rich product data:

```javascript
// Enhanced product display component
const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-image">
      <img 
        src={product.link} 
        alt={product.name}
        loading="lazy"
        onError={(e) => e.target.src = '/placeholder-image.jpg'}
      />
    </div>
    
    <div className="product-details">
      <h3>{product.name}</h3>
      <div className="product-meta">
        <span className="category">{product.category} • {product.type}</span>
        <span className="gender">{product.gender}</span>
        <span className="season">{product.season} {product.year}</span>
      </div>
      
      <div className="price-section">
        <span className="price">₹{product.price.toLocaleString()}</span>
        <div className="rating">
          {'⭐'.repeat(Math.floor(product.rating))} {product.rating}/5
        </div>
      </div>
      
      <div className="product-tags">
        <span className="usage-tag">{product.usage}</span>
        <span className="color-tag">{product.color}</span>
      </div>
    </div>
  </div>
);
```

### F. Monitoring Dashboard Recommendations

With 40K products, create monitoring dashboards:

**1. Airtable Dashboard Metrics:**
- Total products by category
- Average prices by emotion-recommendation type
- Most recommended products
- Conversion rates by emotion

**2. N8N Performance Metrics:**
- Average query response time
- Most frequent emotion types
- Recommendation click-through rates
- System load and error rates

**3. User Behavior Analytics:**
- Emotion detection accuracy
- Recommendation acceptance rates
- Category preferences by emotion
- Seasonal trends

### G. Scaling Tips

**1. Database Optimization:**
- Consider migrating to PostgreSQL or MongoDB for even larger datasets
- Implement Redis caching for frequently accessed products
- Use CDN for product images

**2. API Rate Limiting:**
- Implement request throttling to prevent Airtable API limits
- Use background jobs for data updates
- Batch process emotion logs

**3. Machine Learning Enhancements:**
- Train recommendation models on your 40K dataset
- Implement collaborative filtering
- Use A/B testing for recommendation strategies

---

**🎯 Next Steps with Your 40K Dataset:**

1. **Set up the optimized Airtable views** mentioned above
2. **Update your N8N workflow** with the enhanced filtering logic
3. **Monitor query performance** and optimize slow queries
4. **Implement caching** for frequently accessed data
5. **Create analytics dashboards** to track recommendation effectiveness

Your emotion-aware recommendation system is now ready to handle enterprise-scale data! 🚀
