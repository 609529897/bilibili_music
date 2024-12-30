import { ipcMain } from 'electron';
import axios from 'axios';

export function setupImageProxy() {
  ipcMain.handle('fetch-image', async (_, url: string) => {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://www.bilibili.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      const contentType = response.headers['content-type'] || 'image/jpeg';
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('Image proxy error:', error);
      return null;
    }
  });
}
