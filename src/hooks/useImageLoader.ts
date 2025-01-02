import { useCallback, useRef } from "react";
import { ApiClient } from "../utils/apiClient";

export const useImageLoader = () => {
  const imageCache = useRef<Map<string, string>>(new Map());
  const loadingImages = useRef<Set<string>>(new Set());
  
  const loadImage = useCallback(async (url: string) => {
    if (imageCache.current.has(url)) {
      return imageCache.current.get(url);
    }
    
    if (loadingImages.current.has(url)) {
      return null;
    }
    
    try {
      loadingImages.current.add(url);
      const imageUrl = await ApiClient.request(
        () => window.electronAPI.fetchImage(url),
        { maxRetries: 1 }
      );
      
      imageCache.current.set(url, imageUrl);
      return imageUrl;
    } finally {
      loadingImages.current.delete(url);
    }
  }, []);

  return { loadImage };
}; 