import axios from "axios";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export const fetchNews = async (category = "technology", search = "") => {
  const query = search.trim();
  const cacheKey = query ? `news-search-${query}` : `news-category-${category}`;

  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const url = query
    ? `https://newsapi.org/v2/everything?q=${query}&language=en&apiKey=${API_KEY}`
    : `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

  const response = await axios.get(url);
  const articles = response.data.articles || [];

  sessionStorage.setItem(cacheKey, JSON.stringify(articles));

  return articles;
};