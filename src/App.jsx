// APP.JSX - MAIN APPLICATION COMPONENT

import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

// API CONFIGURATION
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  // SEARCH-RELATED STATE
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // MAIN MOVIES STATE
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // TRENDING MOVIES STATE
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingIsLoading, setTrendingIsLoading] = useState([]);
  const [trendingErrorMessage, setTrendingErrorMessage] = useState([]);

  // DEBOUNCED SEARCH IMPLEMENTATION (prevents API calls on every keystroke)
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // MAIN MOVIE FETCHING FUNCTION (from API)
  const fetchMovies = async (query = "") => {
    // Set loading state and clear previous errors
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Determine API endpoint based on whether user is searching or not
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` // Search endpoint
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`; // Popular movies endpoint

      // Make API request
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      // Update movie list with API results
      setMovieList(data.results || []);

      // If user searched and got results, save this search to our database
      if (query && data.results && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please, try again later.");
    } finally {
      // Always set loading to false when done (success or error)
      setIsLoading(false);
    }
  };

  // TRENDING MOVIES FETCHING FUNCTION
  const loadTrendingMovies = async () => {
    // Set loading state and clear previous errors
    setTrendingIsLoading(true);
    setTrendingErrorMessage("");
    try {
      // Get trending movies from database (sorted by search count)
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingErrorMessage(
        "Error loading trending movies. Please try again later."
      );
    } finally {
      // Always set loading to false when done
      setTrendingIsLoading(false);
    }
  };

  // REACT EFFECTS runs at specific times during component lifecycle
  // Effect 1: Fetch movies when debounced search term changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Effect 2: Load trending movies when component first mounts
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // ====================================================================
  // COMPONENT RENDER
  return (
    <main>
      {/* Background pattern overlay */}
      <div className="pattern " />

      {/* Main content wrapper */}
      <div className="wrapper">
        {/* HEADER SECTION */}
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          {/* Search component with controlled input */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* TRENDING MOVIES SECTION */}
        {/* Only show this section if there is trending movies */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            {/* Conditional rendering based on state */}
            {trendingIsLoading ? (
              // Show spinner while loading
              <Spinner />
            ) : trendingErrorMessage ? (
              // Show error message if something went wrong
              <p className="text-red-500">{trendingErrorMessage}</p>
            ) : trendingMovies.length > 0 ? (
              // Show trending movies list
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    {/* Display ranking number */}
                    <p>{index + 1}</p>
                    {/* Movie poster from the database */}
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No trending movies available.</p>
            )}
          </section>
        )}

        {/* ALL MOVIES SECTION */}
        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            // Show spinner while loading
            <Spinner />
          ) : errorMessage ? (
            // Show error message if something went wrong
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            // Show movies grid
            <ul>
              {movieList.map((movie) => (
                // Each movie gets its own MovieCard component
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
