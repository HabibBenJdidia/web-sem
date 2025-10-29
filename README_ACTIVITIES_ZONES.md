# Activities & Natural Zones Management System

## 🎯 Overview
This is your dedicated module for managing **Activities** (Activités) and **Natural Zones** (Zones Naturelles) in the Eco-Tourism semantic web application.

## 📋 Features Implemented

### Backend (Flask API)
✅ **Complete CRUD endpoints for Activities**
- `POST /activite` - Create new activity
- `GET /activite` - Get all activities
- `GET /activite/<uri>` - Get specific activity
- `PUT /activite/<uri>` - Update activity
- `DELETE /activite/<uri>` - Delete activity

✅ **Complete CRUD endpoints for Natural Zones**
- `POST /zone-naturelle` - Create new zone
- `GET /zone-naturelle` - Get all zones
- `GET /zone-naturelle/<uri>` - Get specific zone
- `PUT /zone-naturelle/<uri>` - Update zone
- `DELETE /zone-naturelle/<uri>` - Delete zone

### Frontend (React)

#### 🌐 **Client Interface (Tourist/Public Access)**
Located at:
- `/client/activities` - Browse and manage activities
- `/client/natural-zones` - Browse and manage natural zones

Features:
- ✅ View all activities/zones in card layout
- ✅ Search functionality
- ✅ Create new activities/zones
- ✅ Edit existing activities/zones
- ✅ Delete activities/zones
- ✅ Beautiful UI with Material Tailwind
- ✅ Real-time data from Fuseki SPARQL

#### 🔐 **Admin Interface (Guide Dashboard)**
Located at:
- `/dashboard/activities` - Admin activities management
- `/dashboard/zones` - Admin zones management

Features:
- ✅ Table view with all data
- ✅ Advanced search and filtering
- ✅ Full CRUD operations
- ✅ Success/Error alerts
- ✅ Statistics display
- ✅ Professional admin UI

#### 🏠 **Landing Page Section**
- ✅ New "Activities & Natural Zones" section added
- ✅ Direct links to client pages
- ✅ Beautiful cards with icons
- ✅ Navigation menu updated

## 🗄️ Data Models

### Activity (Activite)
```javascript
{
  nom: string,              // Activity name
  difficulte: string,       // Difficulty: "Facile", "Moyenne", "Difficile"
  duree_heures: float,      // Duration in hours
  prix: float,              // Price in dollars
  est_dans_zone: URI        // Optional: Link to Natural Zone
}
```

### Natural Zone (Zone Naturelle)
```javascript
{
  nom: string,              // Zone name
  type: string              // Type: "Parc National", "Réserve Naturelle", 
                            //       "Forêt", "Montagne", "Plage", "Désert", 
                            //       "Lac", "Rivière"
}
```

## 🚀 How to Use

### Starting the Backend
```bash
# Navigate to project root
cd c:\Users\nourh\OneDrive\Bureau\web_sem\web-sem

# Make sure Fuseki is running
# Start Flask app
python app.py
```

The API will be available at `http://localhost:8000`

### Starting the Frontend
```bash
# Navigate to frontend directory
cd Web-Semantique-Front

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📍 Access Points

### For Tourists (Public)
1. Go to landing page: `http://localhost:5173/`
2. Scroll to "Activities & Natural Zones" section
3. Click "Browse Activities" or "Explore Zones"
4. You can view, create, edit, and delete without login

### For Guides (Admin)
1. Login as a Guide user
2. Go to Dashboard
3. Click "Activities" or "Natural Zones" in sidebar
4. Full admin interface with table view

## 🔗 API Integration

All data comes from **Apache Jena Fuseki** via SPARQL queries:
- No static data
- Real-time updates
- Semantic web RDF triples
- SPARQL endpoint: `http://localhost:3030/ecotourism`

## 📊 SPARQL Queries Used

### Get All Activities
```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o WHERE {
    ?s a eco:Activite .
    ?s ?p ?o .
}
```

### Get All Natural Zones
```sparql
PREFIX eco: <http://example.org/eco-tourism#>
SELECT ?s ?p ?o WHERE {
    ?s a eco:ZoneNaturelle .
    ?s ?p ?o .
}
```

## 🎨 UI Components

### Client Pages
- **Card Layout**: Beautiful cards with icons and colors
- **Search Bar**: Real-time filtering
- **Modal Dialogs**: For create/edit operations
- **Responsive Design**: Works on mobile, tablet, desktop

### Admin Pages
- **Data Table**: Professional table with sorting
- **Inline Actions**: Edit/Delete buttons per row
- **Alert System**: Success/Error notifications
- **Statistics**: Total count display

## 🔧 File Structure

```
web-sem/
├── app.py                          # Backend API (Activities & Zones endpoints added)
├── models/
│   ├── activite.py                 # Activity model
│   └── zone_naturelle.py           # Natural Zone model
└── Web-Semantique-Front/
    └── src/
        ├── pages/
        │   ├── client/
        │   │   ├── Activities.jsx       # Client activities page
        │   │   ├── NaturalZones.jsx     # Client zones page
        │   │   └── index.js
        │   ├── dashboard/
        │   │   ├── activities-admin.jsx # Admin activities page
        │   │   ├── zones-admin.jsx      # Admin zones page
        │   │   └── index.js
        │   └── landing/
        │       └── index.jsx            # Landing page (updated)
        ├── services/
        │   └── api.js                   # API service (updated)
        ├── routes.jsx                   # Routes configuration (updated)
        └── App.jsx                      # Main app (updated)
```

## ✅ Testing Checklist

### Backend Testing
- [ ] Create activity via POST /activite
- [ ] Get all activities via GET /activite
- [ ] Update activity via PUT /activite/<uri>
- [ ] Delete activity via DELETE /activite/<uri>
- [ ] Create zone via POST /zone-naturelle
- [ ] Get all zones via GET /zone-naturelle
- [ ] Update zone via PUT /zone-naturelle/<uri>
- [ ] Delete zone via DELETE /zone-naturelle/<uri>

### Frontend Testing
- [ ] Access `/client/activities` - view activities
- [ ] Create new activity from client page
- [ ] Edit existing activity
- [ ] Delete activity
- [ ] Search activities
- [ ] Access `/client/natural-zones` - view zones
- [ ] Create new zone
- [ ] Edit existing zone
- [ ] Delete zone
- [ ] Search zones
- [ ] Login as Guide
- [ ] Access `/dashboard/activities` - admin view
- [ ] Access `/dashboard/zones` - admin view
- [ ] Verify landing page section displays correctly

## 🎯 Demo Data

You can create test data using these examples:

### Sample Activities
```json
{
  "nom": "Mountain Hiking",
  "difficulte": "Moyenne",
  "duree_heures": 4.5,
  "prix": 45.00,
  "est_dans_zone": "http://example.org/eco-tourism#ZoneNaturelle_Parc_National_Ifrane"
}
```

### Sample Natural Zones
```json
{
  "nom": "Parc National Ifrane",
  "type": "Parc National"
}
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
- Make sure Flask is running on port 8000
- Check `VITE_API_URL` in frontend `.env` file

### Issue: "No data showing"
- Verify Fuseki is running on port 3030
- Check dataset name is "ecotourism"
- Verify SPARQL endpoint is accessible

### Issue: "CORS errors"
- Flask-CORS is enabled in `app.py`
- Check browser console for specific errors

## 📝 Notes

- **All data is stored in Fuseki RDF triplestore**
- **No SQL database used**
- **SPARQL queries parse RDF triples into JSON**
- **Frontend uses Material Tailwind for UI**
- **Backend uses Flask with SPARQLWrapper**

## 🎓 For Presentation

Key points to mention:
1. ✅ Complete CRUD operations for both entities
2. ✅ Separate client and admin interfaces
3. ✅ Real-time data from Fuseki SPARQL
4. ✅ No static data - everything from semantic web
5. ✅ Beautiful, responsive UI
6. ✅ Search and filter capabilities
7. ✅ Relationship between Activities and Natural Zones

## 👥 Your Responsibility

You are responsible for:
- ✅ **Activite** (Activities) - Complete
- ✅ **Zone Naturelle** (Natural Zones) - Complete
- ✅ Client interface - Complete
- ✅ Admin interface - Complete
- ✅ Landing page section - Complete

Everything is ready to use and demonstrate! 🎉
