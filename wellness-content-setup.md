# WellnessContent Table Setup Guide

## 📋 **Table Structure:**
Create a table named "WellnessContent" with these exact field names:

| Field Name | Field Type | Options/Settings |
|------------|------------|------------------|
| ContentId | Autonumber | Auto-generated |
| Type | Single select | Quote, JournalApp, Playlist, Meditation, Video, Article |
| Content | Long text | Main content/description |
| Title | Single line text | Title/Name of content |
| URL | URL | External link (optional) |
| Platform | Single line text | Platform name |
| Category | Single select | Mindfulness, Music, Journaling, Support, Exercise, Sleep |
| IsActive | Checkbox | Enable/disable content |
| UsageCount | Number | How many times used (start with 0) |
| LastUsed | Date | When last selected |

## 📝 **Sample Data to Add:**

### **Motivational Quotes (Type: Quote)**

**Record 1:**
- Type: Quote
- Content: Take time to breathe. You're doing better than you think. 🌸
- Title: Breathing Reminder
- URL: (leave empty)
- Platform: (leave empty)
- Category: Mindfulness
- IsActive: ✓ (checked)
- UsageCount: 0
- LastUsed: (leave empty)

**Record 2:**
- Type: Quote
- Content: Your wellbeing matters more than any product. 🧘‍♀️
- Title: Wellbeing First
- URL: (leave empty)
- Platform: (leave empty)
- Category: Mindfulness
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 3:**
- Type: Quote
- Content: Sometimes the best buy is to not buy at all. 🌱
- Title: Financial Wellness
- URL: (leave empty)
- Platform: (leave empty)
- Category: Support
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 4:**
- Type: Quote
- Content: Focus on what truly makes you happy, not what you think should make you happy. ✨
- Title: True Happiness
- URL: (leave empty)
- Platform: (leave empty)
- Category: Mindfulness
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 5:**
- Type: Quote
- Content: You are enough, just as you are. No purchase can add to your worth. 💚
- Title: Self Worth
- URL: (leave empty)
- Platform: (leave empty)
- Category: Support
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

### **Journal Apps (Type: JournalApp)**

**Record 6:**
- Type: JournalApp
- Content: Simple micro mood diary to track your emotions daily
- Title: Daylio
- URL: https://daylio.net
- Platform: Mobile App
- Category: Journaling
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 7:**
- Type: JournalApp
- Content: Beautiful journaling experience with photos and locations
- Title: Journey
- URL: https://journey.cloud
- Platform: Cross-platform
- Category: Journaling
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 8:**
- Type: JournalApp
- Content: AI-powered journal that helps you reflect and grow
- Title: Reflectly
- URL: https://www.reflectly.app
- Platform: Mobile App
- Category: Journaling
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

### **Calming Music/Playlists (Type: Playlist)**

**Record 9:**
- Type: Playlist
- Content: Relaxing piano music for stress relief and focus
- Title: Peaceful Piano
- URL: https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u
- Platform: Spotify
- Category: Music
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 10:**
- Type: Playlist
- Content: Natural sounds to help you relax and unwind
- Title: Nature Sounds
- URL: https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY
- Platform: Spotify
- Category: Music
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 11:**
- Type: Playlist
- Content: Ambient and instrumental music for deep relaxation
- Title: Chill Vibes
- URL: https://open.spotify.com/playlist/37i9dQZF1DX0SM0LYsmbMT
- Platform: Spotify
- Category: Music
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

### **Meditation Resources (Type: Meditation)**

**Record 12:**
- Type: Meditation
- Content: Guided meditation for managing stress and anxiety
- Title: Headspace Stress Relief
- URL: https://www.headspace.com/meditation/stress
- Platform: Headspace
- Category: Mindfulness
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 13:**
- Type: Meditation
- Content: Free guided meditations for beginners
- Title: Insight Timer
- URL: https://insighttimer.com
- Platform: Insight Timer
- Category: Mindfulness
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 14:**
- Type: Meditation
- Content: 10-minute breathing exercises for instant calm
- Title: Calm Breathing
- URL: https://www.calm.com/breathe
- Platform: Calm
- Category: Mindfulness
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

### **Helpful Videos (Type: Video)**

**Record 15:**
- Type: Video
- Content: Quick exercises to boost your mood naturally
- Title: 5-Minute Mood Booster
- URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Platform: YouTube
- Category: Exercise
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 16:**
- Type: Video
- Content: Gentle yoga for stress relief and mental clarity
- Title: Yoga for Stress
- URL: https://www.youtube.com/watch?v=example
- Platform: YouTube
- Category: Exercise
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

### **Support Resources (Type: Article)**

**Record 17:**
- Type: Article
- Content: Understanding emotional spending and how to manage it
- Title: Mindful Spending Guide
- URL: https://www.psychologytoday.com/intl/blog/mind-over-money
- Platform: Psychology Today
- Category: Support
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

**Record 18:**
- Type: Article
- Content: Tips for better mental health and emotional wellbeing
- Title: Mental Health Resources
- URL: https://www.mentalhealth.gov/basics/what-is-mental-health
- Platform: Mental Health Gov
- Category: Support
- IsActive: ✓
- UsageCount: 0
- LastUsed: (leave empty)

## 🎯 **Quick Setup Steps:**

1. **Create the table** with exact field names and types above
2. **Add all 18 records** using the data provided
3. **Verify IsActive** is checked (✓) for all records
4. **Leave UsageCount as 0** and LastUsed empty
5. **Test the workflow** - N8N will randomly select from active content

## ✅ **Verification Checklist:**

- [ ] Table named "WellnessContent" created
- [ ] All 10 required fields added with correct types
- [ ] At least 5 quotes added
- [ ] At least 3 journal apps added  
- [ ] At least 3 music playlists added
- [ ] At least 3 meditation resources added
- [ ] All records have IsActive = ✓ (checked)
- [ ] Categories are properly selected

## 🔄 **How N8N Will Use This Data:**

When wellness mode triggers (3+ consecutive sad emotions), the N8N workflow will:
1. Query this table for active content (IsActive = ✓)
2. Randomly select one item from each category
3. Return a wellness package with quote + journal app + calming content
4. Update UsageCount and LastUsed fields automatically

Your wellness content library is now ready to support users in emotional distress! 🧘‍♀️✨
