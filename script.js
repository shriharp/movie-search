const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');

// Load movies from API
async function loadMovies(searchTerm) {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=f6df7e70`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    if(data.Response == "True") displayMovieList(data.Search);
}

function findMovies() {
    let searchTerm = (movieSearchBox.value).trim();
    if(searchTerm.length > 0) {
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    for(let idx = 0; idx < movies.length; idx++) {
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID;
        movieListItem.classList.add('search-list-item');
        let moviePoster = movies[idx].Poster != "N/A" ? movies[idx].Poster : "image_not_found.png";
        
        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${moviePoster}">
            </div>
            <div class="search-item-info">
                <h3>${movies[idx].Title}</h3>
                <p>${movies[idx].Year}</p>
            </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=f6df7e70`);
            const movieDetails = await result.json();
            displayMovieDetails(movieDetails);
        });
    });
}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
        <div class="movie-card">
            <div class="movie-poster">
                <img src="${(details.Poster != "N/A") ? details.Poster : "image_not_found.png"}" alt="movie poster">
            </div>
            <div class="movie-details">
                <h2 class="movie-title">${details.Title}</h2>
                <div class="movie-meta">
                    <span class="meta-item">${details.Year}</span>
                    <span class="meta-item">${details.Rated}</span>
                    <span class="meta-item">${details.Runtime}</span>
                </div>
                <p><strong>Genre:</strong> ${details.Genre}</p>
                <p><strong>Director:</strong> ${details.Director}</p>
                <p><strong>Cast:</strong> ${details.Actors}</p>
                <p><strong>Plot:</strong> ${details.Plot}</p>
                <div class="rating-section">
                    <h3>Rate this movie:</h3>
                    <div class="star-rating" id="star-rating">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                    <button class="collection-btn" onclick="addToCollection('${details.imdbID}')">
                        Add to Collection
                    </button>
                </div>
            </div>
        </div>
    `;
    initializeRating();
}

function initializeRating() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            stars.forEach(s => {
                s.style.color = parseInt(s.dataset.rating) <= parseInt(rating) ? '#ffd700' : '#ccc';
            });
        });
    });
}

function addToCollection(movieId) {
    let collections = JSON.parse(localStorage.getItem('movieCollections')) || [];
    if (!collections.includes(movieId)) {
        collections.push(movieId);
        localStorage.setItem('movieCollections', JSON.stringify(collections));
        alert('Movie added to your collection!');
    } else {
        alert('This movie is already in your collection!');
    }
}

// Event listener for search input
movieSearchBox.addEventListener('input', findMovies);

// Event listener for clicking outside search results
window.addEventListener('click', (event) => {
    if(event.target.className != "search-input") {
        searchList.classList.add('hide-search-list');
    }
});

// Previous code remains the same...

// Navigation handling
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;
        
        // Update active states
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`${pageId}-page`).classList.add('active');

        // Load collections if needed
        if (pageId === 'collections') {
            loadCollections();
        }
    });
});

// Collections functionality
async function loadCollections() {
    const collectionsGrid = document.getElementById('collections-grid');
    const collections = JSON.parse(localStorage.getItem('movieCollections')) || [];
    
    if (collections.length === 0) {
        collectionsGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No movies in your collection yet.</p>';
        return;
    }

    collectionsGrid.innerHTML = '<div class="loading" style="color: white; text-align: center; grid-column: 1/-1;">Loading your collection...</div>';
    
    const movieCards = await Promise.all(collections.map(async (movieId) => {
        const result = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=fc1fef96`);
        const movie = await result.json();
        return createCollectionCard(movie);
    }));

    collectionsGrid.innerHTML = movieCards.join('');

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', () => removeFromCollection(button.dataset.movieId));
    });
}

function createCollectionCard(movie) {
    return `
        <div class="collection-card">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'image_not_found.png'}" alt="${movie.Title}">
            <div class="collection-card-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <button class="remove-btn" data-movie-id="${movie.imdbID}">Remove from Collection</button>
            </div>
        </div>
    `;
}

function removeFromCollection(movieId) {
    let collections = JSON.parse(localStorage.getItem('movieCollections')) || [];
    collections = collections.filter(id => id !== movieId);
    localStorage.setItem('movieCollections', JSON.stringify(collections));
    loadCollections(); // Refresh the collections grid
}

// Update addToCollection function to show immediate feedback
function addToCollection(movieId) {
    let collections = JSON.parse(localStorage.getItem('movieCollections')) || [];
    if (!collections.includes(movieId)) {
        collections.push(movieId);
        localStorage.setItem('movieCollections', JSON.stringify(collections));
        alert('Movie added to your collection!');
    } else {
        alert('This movie is already in your collection!');
    }
}