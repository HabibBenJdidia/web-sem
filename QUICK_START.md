# 🚀 Quick Start Guide - Activities & Natural Zones

## Step 1: Start Fuseki (if not running)
```bash
# Fuseki should be running on http://localhost:3030
# Dataset name: ecotourism
```

## Step 2: Start Backend
```bash
cd c:\Users\nourh\OneDrive\Bureau\web_sem\web-sem
python app.py
```
✅ Backend running on `http://localhost:8000`

## Step 3: Start Frontend
```bash
cd c:\Users\nourh\OneDrive\Bureau\web_sem\web-sem\Web-Semantique-Front
npm run dev
```
✅ Frontend running on `http://localhost:5173`

## Step 4: Access Your Pages

### 🌐 Client Pages (Public - No Login Required)
1. **Activities Page**: http://localhost:5173/client/activities
2. **Natural Zones Page**: http://localhost:5173/client/natural-zones

### 🔐 Admin Pages (Guide Login Required)
1. Login as Guide at: http://localhost:5173/auth/sign-in
2. Go to Dashboard
3. Click "Activities" or "Natural Zones" in sidebar

### 🏠 Landing Page
http://localhost:5173/
- Scroll to "Activities & Natural Zones" section
- Click buttons to access client pages

## 📝 Quick Test

### Create a Natural Zone
1. Go to http://localhost:5173/client/natural-zones
2. Click "Add Zone"
3. Enter:
   - Name: "Parc National Ifrane"
   - Type: "Parc National"
4. Click "Create"

### Create an Activity
1. Go to http://localhost:5173/client/activities
2. Click "Add Activity"
3. Enter:
   - Name: "Mountain Hiking"
   - Difficulty: "Moyenne"
   - Duration: 4.5
   - Price: 45
   - Zone: Select "Parc National Ifrane"
4. Click "Create"

## ✅ Verify in Fuseki
Go to http://localhost:3030/ecotourism/query

Run this query:
```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT * WHERE {
  ?s a eco:Activite .
  ?s ?p ?o .
}
```

You should see your activity data!

## 🎯 What You Can Do

### Client Interface
- ✅ View all activities/zones
- ✅ Search by name
- ✅ Create new items
- ✅ Edit existing items
- ✅ Delete items
- ✅ See relationships (Activity → Zone)

### Admin Interface
- ✅ Table view with all data
- ✅ Search and filter
- ✅ Full CRUD operations
- ✅ Success/Error notifications
- ✅ Statistics display

## 🔗 API Endpoints

### Activities
- `GET /activite` - Get all
- `POST /activite` - Create
- `PUT /activite/<uri>` - Update
- `DELETE /activite/<uri>` - Delete

### Natural Zones
- `GET /zone-naturelle` - Get all
- `POST /zone-naturelle` - Create
- `PUT /zone-naturelle/<uri>` - Update
- `DELETE /zone-naturelle/<uri>` - Delete

## 🎨 Features Highlights

1. **No Static Data** - Everything from Fuseki SPARQL
2. **Real-time Updates** - Changes reflect immediately
3. **Beautiful UI** - Material Tailwind components
4. **Responsive** - Works on all devices
5. **Search** - Filter by name in real-time
6. **Relationships** - Link activities to zones

## 🐛 Common Issues

**Problem**: Can't see data
- **Solution**: Check Fuseki is running and dataset exists

**Problem**: CORS error
- **Solution**: Make sure backend is running on port 8000

**Problem**: "Cannot connect"
- **Solution**: Verify both backend and frontend are running

## 📞 Need Help?

Check the full documentation in `README_ACTIVITIES_ZONES.md`

---

**Your Module**: Activities (Activités) & Natural Zones (Zones Naturelles)
**Status**: ✅ Complete and Ready to Use!
