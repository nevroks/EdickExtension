import type { NewsItem } from '@/utils/api/newsApi/NewsApi';

/**
 * Проверяет, содержит ли новость нужный тикер
 */
export const newsMatchesTicker = (newsItem: NewsItem, targetTicker: string): boolean => {
  if (!targetTicker) return true;
  
  return newsItem.tikers?.some(t => 
    t.toLowerCase() === targetTicker.toLowerCase() || 
    t.toLowerCase() === `$${targetTicker.toLowerCase()}`
  ) ?? false;
};

/**
 * Проверяет, соответствует ли новость поисковому запросу
 */
export const newsMatchesSearch = (newsItem: NewsItem, search: string): boolean => {
  if (!search.trim()) return true;
  
  const searchLower = search.toLowerCase();
  return (
    newsItem.text?.toLowerCase().includes(searchLower) ||
    newsItem.source?.toLowerCase().includes(searchLower) ||
    newsItem.tikers?.some(t => t.toLowerCase().includes(searchLower)) ||
    false
  );
};

/**
 * Фильтрует массив новостей по тикеру и поисковому запросу
 */
export const filterNews = (
  news: NewsItem[],
  ticker?: string,
  search?: string
): NewsItem[] => {
  return news.filter(item => {
    const matchesTicker = !ticker || newsMatchesTicker(item, ticker);
    const matchesSearch = !search || newsMatchesSearch(item, search);
    return matchesTicker && matchesSearch;
  });
};

