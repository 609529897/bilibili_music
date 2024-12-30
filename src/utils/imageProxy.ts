const imageCache = new Map<string, string>();

export async function fetchImage(url: string): Promise<string> {
  if (!url) return '';
  
  // 检查缓存
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  try {
    const dataUrl = await window.electronAPI.fetchImage(url);
    if (dataUrl) {
      imageCache.set(url, dataUrl);
      return dataUrl;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
  }

  // 返回默认图片
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1ZTdlYiIgZD0iTTEyIDN2MTAuNTVjLS41OS0uMzQtMS4yNy0uNTUtMi0uNTVjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDRzNC0xLjc5IDQtNFY3aDRWM2gtNloiLz48L3N2Zz4=';
}
