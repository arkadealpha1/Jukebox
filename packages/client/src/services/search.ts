import { api } from './api';
import type { SearchResult } from '@/types';

interface SearchResponse {
  results: SearchResult[];
}

export const searchService = {
  searchSongs(query: string): Promise<SearchResponse> {
    return api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
  },
};
