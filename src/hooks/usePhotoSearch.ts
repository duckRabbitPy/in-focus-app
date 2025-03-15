import { useState } from 'react';

interface PhotoSearchResult {
  id: string;
  roll_id: string;
  subject: string;
  photo_url?: string;
  created_at: string;
  roll_name: string;
  tags: string[];
}

interface SearchResult {
  photos: PhotoSearchResult[];
  isLoading: boolean;
  error: string | null;
}

export function usePhotoSearch(userId: string) {
  const [searchResult, setSearchResult] = useState<SearchResult>({
    photos: [],
    isLoading: false,
    error: null
  });

  const searchPhotos = async (tags: string[]) => {
    try {
      setSearchResult(prev => ({ ...prev, isLoading: true, error: null }));
      
      const queryParams = new URLSearchParams();
      tags.forEach(tag => queryParams.append('tags', tag));
      
      const response = await fetch(`/api/user/${userId}/search?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setSearchResult({
        photos: data.photos,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setSearchResult({
        photos: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };

  return {
    ...searchResult,
    searchPhotos
  };
} 