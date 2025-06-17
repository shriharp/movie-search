require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Proxy endpoint for OMDb search
app.get('/api/search', async (req, res) => {
  const { s, i, page } = req.query;
  let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
  if (s) url += `&s=${encodeURIComponent(s)}`;
  if (i) url += `&i=${encodeURIComponent(i)}`;
  if (page) url += `&page=${page}`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from OMDb API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
