// APPWRITE.JS - DATABASE INTERACTION FUNCTIONS
// This file handles all database operations using Appwrite as the backend.

import { Client, Databases, ID, Query } from "appwrite";

// ENVIRONMENT CONFIGURATION
// values come from your .env file and configure the Appwrite connection
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// APPWRITE CLIENT SETUP (My connection setup)
// Initialize the Appwrite client with your project configuration
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

// Create database instance for performing database operations
// (My database service - ready to track movie searches)
const database = new Databases(client);

// SEARCH TRACKING FUNCTION: tracks user searches and updates search counts in the database.
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // STEP 1: Check if this search term already exists in the database
    // Query.equal() searches for documents where 'searchTerm' field matches the user's search
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);
    // STEP 2: Handle existing vs new search terms
    if (result.documents.length > 0) {
      // CASE A: Search term exists - increment the count
      const doc = result.documents[0]; // Get the first (and should be only) matching document
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1, // Increment the existing count by 1
      });
    } else {
      // CASE B: New search term - create a new document
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.log("Error updating search count:", error);
  }
};

// TRENDING MOVIES RETRIEVAL FUNCTION
// gets the most popular movies based on search frequency
// returns the top 5 most searched movies from our database.
export const getTrendingMovies = async () => {
  try {
    // Query the database with specific constraints:
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5), // Limit to top 5 trending movies
      Query.orderDesc("count"), // Sort by search count (most searched first)
    ]);

    // Return the array of document objects
    return result.documents;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    // Return empty array so the app doesn't break
    return [];
  }
};
