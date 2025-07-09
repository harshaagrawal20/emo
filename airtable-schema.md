# Airtable Database Schema for Emotion-Aware Product Recommendations

## Base: "EmotionRecommendationSystem"

### Table 1: "EmotionLogs"
**Purpose:** Store all emotion detection events from users

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| UserId | Single line text | Unique identifier for user | "u001", "user_12345" |
| Emotion | Single select | Detected emotion | Options: happy, sad, angry, fear, surprise, disgust, neutral |
| Confidence | Number (0-1, 2 decimal places) | Confidence score from DeepFace | 0.87 |
| ProductId | Single line text | Product being viewed | "p045", "laptop_001" |
| Price | Currency (₹) | Price of the product | ₹11999 |
| Category | Single select | Product category | Options: Electronics, Fashion, Home, Books, Sports, etc. |
| Timestamp | Date and time | When emotion was detected | 2025-07-09 12:30:00 |
| SessionId | Single line text | Browser/app session ID | "session_abc123" |
| RecordId | Autonumber | Auto-generated unique ID | 1, 2, 3... |

### Table 2: "Products"
**Purpose:** Store product catalog with alternatives and premium options

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| ProductId | Single line text (Primary) | Unique product identifier | "laptop_gaming_001" |
| Name | Single line text | Product name | "Dell Gaming Laptop 15.6\"" |
| Price | Currency (₹) | Current price | ₹75000 |
| Category | Single select | Product category | Electronics |
| Description | Long text | Product description | "High-performance gaming laptop with..." |
| Image | Attachment | Product images | [image files] |
| Rating | Number (1-5, 1 decimal) | Average customer rating | 4.5 |
| Features | Long text | Key features (comma-separated) | "16GB RAM, 512GB SSD, RTX 3060" |
| PremiumFeatures | Long text | Premium features if applicable | "RGB Keyboard, 144Hz Display" |
| Available | Checkbox | Is product available? | ✓ |
| IsPremium | Checkbox | Is this a premium product? | ✓ |
| IsAlternative | Checkbox | Can be suggested as alternative? | ✓ |
| PopularityScore | Number (0-100) | Popularity ranking | 85 |
| Availability | Single select | Stock status | Options: In Stock, Limited, Out of Stock |
| Brand | Single line text | Product brand | "Dell", "Apple", "Samsung" |
| CreatedDate | Date | When product was added | 2025-07-09 |
| UpdatedDate | Last modified time | Auto-updated timestamp | Auto-generated |

### Table 3: "UserProfiles" (Optional - for advanced personalization)
**Purpose:** Store user preferences and history

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| UserId | Single line text (Primary) | Unique user identifier | "u001" |
| PreferredCategories | Multiple select | User's favorite categories | Electronics, Books |
| BudgetRange | Single select | Typical budget range | Options: <₹5k, ₹5k-₹20k, ₹20k-₹50k, >₹50k |
| EmotionPattern | Single select | Dominant emotion pattern | Options: Positive, Neutral, Cautious, Wellness_Mode |
| LastWellnessMode | Date | Last time wellness mode triggered | 2025-07-08 |
| TotalSadCount | Number | Total sad emotions recorded | 12 |
| RegistrationDate | Date | When user first appeared | 2025-07-01 |
| PreferredBrands | Multiple select | Favorite brands | Apple, Samsung, Nike |

### Table 4: "WellnessContent"
**Purpose:** Store wellness mode content (quotes, resources)

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| ContentId | Autonumber | Unique content ID | 1, 2, 3... |
| Type | Single select | Content type | Options: Quote, JournalApp, Playlist, Meditation |
| Content | Long text | The actual content/quote | "Take time to breathe. You're doing better..." |
| Title | Single line text | Content title/name | "Peaceful Piano Playlist" |
| URL | URL | Link to external resource | https://open.spotify.com/playlist/... |
| Platform | Single line text | Platform name | "Spotify", "YouTube", "Headspace" |
| Category | Single select | Wellness category | Options: Mindfulness, Music, Journaling, Support |
| IsActive | Checkbox | Should this content be used? | ✓ |
| UsageCount | Number | How many times used | 45 |
| LastUsed | Date | When last selected | 2025-07-09 |

## Airtable Setup Instructions:

### 1. Create Base
1. Go to Airtable.com
2. Create new base: "EmotionRecommendationSystem"
3. Replace default table with "EmotionLogs"

### 2. Configure Tables
Create each table above with the exact field names and types specified.

### 3. Sample Data for Products Table:
```
Electronics - Expensive:
- "Premium Laptop", ₹75000, Electronics, Premium Gaming Laptop
- "Designer Watch", ₹25000, Fashion, Luxury Timepiece
- "Professional Camera", ₹120000, Photography, DSLR Camera

Electronics - Alternatives:
- "Budget Laptop", ₹35000, Electronics, Affordable Daily Use Laptop  
- "Smart Watch", ₹8000, Fashion, Feature-rich Smartwatch
- "Action Camera", ₹7500, Photography, Compact Action Camera
```

### 4. API Configuration
1. Go to Airtable API docs: https://airtable.com/api
2. Select your base
3. Get Base ID (starts with "app...")
4. Create Personal Access Token with read/write permissions
5. Update the workflow JSON with your Base ID

### 5. Field Formulas Examples:

**For filtering cheaper alternatives:**
```
AND(
  {Category} = "Electronics",
  {Price} <= 52500,
  {Available} = TRUE(),
  {IsAlternative} = TRUE()
)
```

**For premium products:**
```
AND(
  {Category} = "Electronics",
  OR({IsPremium} = TRUE(), {Price} >= 75000),
  {Available} = TRUE()
)
```

### 6. Webhook URL Configuration:
Update your Flask app's N8N_WEBHOOK_URL to:
```python
N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/emotion-capture"
```

This schema provides a complete foundation for the emotion-aware recommendation system with wellness mode support!
