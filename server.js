/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Lena Park Student ID: 127390235 Date: 2025-05-15
*
* Published URL: ___________________________________________________________
*
********************************************************************************/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper function to ensure DB is initialized
async function ensureDBInitialized() {
  if (!db.Listing) {
    await db.initialize(process.env.MONGODB_CONN_STRING);
  }
}

// Root route
app.get('/', async (req, res) => {
  res.json({ message: "API Listening" });
});

// POST /api/listings
app.post('/api/listings', async (req, res) => {
  try {
    await ensureDBInitialized();
    const newListing = await db.addNewListing(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ message: "Failed to create listing", error: err.message });
  }
});

// GET /api/listings
app.get('/api/listings', async (req, res) => {
  const { page, perPage, name } = req.query;

  try {
    await ensureDBInitialized();
    const listings = await db.getAllListings(parseInt(page), parseInt(perPage), name);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve listings", error: err.message });
  }
});

// GET /api/listings/:id
app.get('/api/listings/:id', async (req, res) => {
  try {
    await ensureDBInitialized();
    const listing = await db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve listing", error: err.message });
  }
});

// PUT /api/listings/:id
app.put('/api/listings/:id', async (req, res) => {
  try {
    await ensureDBInitialized();
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Listing not found or no changes made" });
    }
    res.status(204).send(); // success, no content
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});

// DELETE /api/listings/:id
app.delete('/api/listings/:id', async (req, res) => {
  try {
    await ensureDBInitialized();
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(204).send(); // success, no content
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});

// Only for local use — Vercel won’t use this
if (require.main === module) {
  db.initialize(process.env.MONGODB_CONN_STRING)
    .then(() => {
      app.listen(HTTP_PORT, () => {
        console.log(`Server listening on: ${HTTP_PORT}`);
      });
    })
    .catch((err) => {
      console.log("Database connection failed:", err);
    });
}

module.exports = app;
