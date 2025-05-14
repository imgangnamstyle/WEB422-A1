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
const PORT = process.env.PORT || 8080;

//middleware
app.use(cors());
app.use(express.json());

//root route
app.get('/', (req, res) => {
  res.json({message: 'API Listening'});
});


//********API ROUTES
//POST /api/listings
app.post("/api/listings", async (req, res) => {
  try {
    let result = await db.addNewListing(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({message: 'Failed to add listings', error: err});
  }
});

//GET /api/listings
app.get("/api/listings", async (req, res) => {
  const page = parseInt(req.query.page);
  const perPage = parseInt(req.query.perPage);
  const name = req.query.name;

  try {
    let listings = await db.getAllListings(page, perPage, name);
    res.json(listings);
  } catch (err) {
    res.status(500).json({message: 'Failed to get listings', error: err});
  }
});

//GET /api/listings/ID value
app.get("/api/listings/:id", async (req, res) => {
  try {
    let listing = await db.getListingById(req.params.id);
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({message: "Listing not found"});
    }
  } catch (err) {
    res.status(500).json({message: 'Failed to get listings and ID', error: err});
  }
});

//PUT /api/listings/ID value
app.put("/api/listings/:id", async (req, res) => {
  try {
    let result = await db.updateListingById(req.body, req.params.id);
    if (result) {
      res.status(204).end(); 
    } else {
      res.status(404).json({message: "Listing not found"});
    }
  } catch (err) {
    res.status(500).json({message: 'Failed to update listing', error: err});
  }
});

app.delete("/api/listings/:id", async (req, res) => {
  try {
    let result = await db.deleteListingById(req.params.id);
    if (result) {
      res.status(204).end(); 
    } else {
      res.status(404).json({message: "Delete listing not found"});
    }
  } catch (err) {
    res.status(500).json({message: 'Error deleting listing', error: err});
  }
});

//initialization
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB', err);
  });