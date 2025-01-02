import { useCallback, useRef } from "react";
import { ApiClient } from "../utils/apiClient";

const MAX_CACHE_SIZE = 100; // 最大缓存数量

export const useImageLoader = () => {
  const imageCache = useRef<Map<string, string>>(new Map());
  const loadingImages = useRef<Set<string>>(new Set());
  
  const cleanCache = useCallback(() => {
    if (imageCache.current.size > MAX_CACHE_SIZE) {
      const entries = Array.from(imageCache.current.entries());
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => imageCache.current.delete(key));
    }
  }, []);

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
        { maxRetries: 2 }
      );
      
      imageCache.current.set(url, imageUrl);
      cleanCache();
      return imageUrl;
    } catch (error) {
      console.error("Failed to load image:", error);
      return null;
    } finally {
      loadingImages.current.delete(url);
    }
  }, [cleanCache]);

  return { loadImage };
}; 