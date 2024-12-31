import { app, BrowserWindow, ipcMain, session, protocol, shell } from 'electron'
import path from 'path'
import axios from 'axios'

// B站API接口
const API = {
  VIEW: 'https://api.bilibili.com/x/web-interface/view',
  PLAY_URL: 'https://api.bilibili.com/x/player/playurl',
  USER_INFO: 'https://api.bilibili.com/x/web-interface/nav',
  FAVORITE_LIST: 'https://api.bilibili.com/x/v3/fav/folder/created/list-all',
  FAVORITE_DETAIL: 'https://api.bilibili.com/x/v3/fav/resource/list',
  LOGIN_URL: 'https://passport.bilibili.com/login',
  VIDEO_INFO: 'https://api.bilibili.com/x/web-interface/view',
}

// 基础请求头
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com',
  'Origin': 'https://www.bilibili.com'
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  // 默认打开开发者工具
  mainWindow.webContents.openDevTools()
}

// 打开B站登录页面
async function openBilibiliLogin() {
  if (!mainWindow) return

  const loginWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    parent: mainWindow,
    modal: true
  })

  // 监听登录成功
  loginWindow.webContents.on('did-navigate', async (event, url) => {
    if (url.includes('bilibili.com') && !url.includes('login')) {
      // 获取所有cookies
      const cookies = await session.defaultSession.cookies.get({
        url: 'https://bilibili.com'
      })
      
      // 保存需要的cookies
      const cookieData = {
        SESSDATA: cookies.find(c => c.name === 'SESSDATA')?.value,
        bili_jct: cookies.find(c => c.name === 'bili_jct')?.value,
        DedeUserID: cookies.find(c => c.name === 'DedeUserID')?.value
      }

      // 检查是否获取到所有需要的cookie
      if (cookieData.SESSDATA && cookieData.bili_jct && cookieData.DedeUserID) {
        console.log('Login successful, cookies obtained')
        // 关闭登录窗口
        loginWindow.close()
        // 通知渲染进程登录成功
        mainWindow?.webContents.send('bilibili-login-success')
      }
    }
  })

  // 加载B站登录页面
  await loginWindow.loadURL('https://passport.bilibili.com/login')
}

// 检查登录状态
async function checkLoginStatus() {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: 'https://bilibili.com'
    })

    const sessdata = cookies.find(c => c.name === 'SESSDATA')?.value
    if (!sessdata) {
      return false
    }

    const response = await axios.get(API.USER_INFO, {
      headers: {
        ...headers,
        Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
      }
    })
    return response.data.code === 0
  } catch (error) {
    console.error('Failed to check login status:', error)
    return false
  }
}

// 获取cookie字符串
async function getCookieString() {
  const cookies = await session.defaultSession.cookies.get({
    url: 'https://bilibili.com'
  })
  return cookies.map(c => `${c.name}=${c.value}`).join('; ')
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('left', (request, callback) => {
    const url = request.url.replace('left://local-file/', '');
    try {
      const decodedPath = decodeURIComponent(url);
      callback({ path: decodedPath });
    } catch (error) {
      console.error('Protocol error:', error);
      callback({ error: -2 /* net::FAILED */ });
    }
  });

  createWindow()
  setupImageProxy()  // 注册图片代理服务

  // 处理外部链接
  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      await shell.openExternal(url)
    } catch (error) {
      console.error('Failed to open external URL:', error)
      throw error
    }
  })

  // 注册 IPC 处理函数
  ipcMain.handle('open-bilibili-login', openBilibiliLogin)
  ipcMain.handle('check-login-status', checkLoginStatus)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 处理登录请求
ipcMain.handle('bilibili-login', async () => {
  await openBilibiliLogin()
})

// Handle IPC messages here
ipcMain.handle('add-video', async (event, videoUrl: string) => {
  try {
    console.log('Processing video URL:', videoUrl)
    
    // 检查登录状态
    const isLoggedIn = await checkLoginStatus()
    if (!isLoggedIn) {
      // 如果未登录，打开登录窗口
      await openBilibiliLogin()
      throw new Error('请先登录B站账号')
    }

    // 获取cookie字符串
    const cookieString = await getCookieString()

    // 解析BV号
    const bvMatch = videoUrl.match(/BV\w+/)
    if (!bvMatch) {
      throw new Error('Invalid Bilibili video URL')
    }
    const bvid = bvMatch[0]
    console.log('Extracted BVID:', bvid)

    // 获取视频信息
    console.log('Fetching video info...')
    const viewResponse = await axios.get(API.VIEW, {
      params: { bvid },
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    if (viewResponse.data.code !== 0) {
      throw new Error(viewResponse.data.message || 'Failed to fetch video info')
    }

    const videoData = viewResponse.data.data
    console.log('Video data:', {
      title: videoData.title,
      author: videoData.owner.name,
      duration: videoData.duration,
      cid: videoData.cid
    })
    
    // 获取音频URL
    console.log('Fetching audio URL...')
    const playUrlResponse = await axios.get(API.PLAY_URL, {
      params: {
        bvid,
        cid: videoData.cid,
        fnval: 16,
        qn: 64,
        fourk: 1
      },
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    if (playUrlResponse.data.code !== 0) {
      throw new Error(playUrlResponse.data.message || 'Failed to fetch audio URL')
    }

    // 从响应中提取音频URL
    const audioUrl = playUrlResponse.data.data.dash?.audio?.[0]?.baseUrl
    if (!audioUrl) {
      throw new Error('无法获取音频URL，可能需要大会员权限')
    }

    return {
      success: true,
      data: {
        bvid,
        title: videoData.title,
        author: videoData.owner.name,
        duration: videoData.duration,
        thumbnail: videoData.pic,
        audioUrl
      }
    }

  } catch (error) {
    console.error('Error processing video:', error)
    return {
      success: false,
      error: error.message || 'Failed to process video'
    }
  }
})

// 获取收藏列表
ipcMain.handle('get-favorites', async () => {
  try {
    console.log('Starting to fetch favorites...')
    // 检查登录状态
    const isLoggedIn = await checkLoginStatus()
    if (!isLoggedIn) {
      throw new Error('请先登录B站账号')
    }

    const cookieString = await getCookieString()
    console.log('Cookie string:', cookieString)
    
    // 获取用户信息
    console.log('Fetching user info...')
    const userResponse = await axios.get(API.USER_INFO, {
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    console.log('User info response:', userResponse.data)

    if (userResponse.data.code !== 0) {
      throw new Error(`获取用户信息失败: ${userResponse.data.message}`)
    }

    const mid = userResponse.data.data.mid
    console.log('User mid:', mid)
    
    // 获取收藏夹列表
    console.log('Fetching favorite folders...')
    const favListResponse = await axios.get(API.FAVORITE_LIST, {
      params: { 
        up_mid: mid,
        web_location: '333.1387'
      },
      headers: {
        ...headers,
        'Cookie': cookieString
      }
    })

    console.log('Full favorite folders response:', favListResponse.data)

    if (favListResponse.data.code !== 0) {
      throw new Error(`获取收藏夹列表失败: ${favListResponse.data.message}`)
    }

    if (!favListResponse.data.data?.list) {
      throw new Error('收藏夹列表为空或格式不正确')
    }

    // 只保留以"我的"开头的收藏夹
    const favList = favListResponse.data.data.list
      .map((fav: any) => ({
        id: fav.id,
        title: fav.title,
        count: fav.media_count
      }))

    return {
      success: true,
      data: favList
    }

  } catch (error) {
    console.error('Error getting favorites:', error.response?.data || error)
    return {
      success: false,
      error: error.message || 'Failed to get favorites'
    }
  }
})

// 获取收藏夹内容
ipcMain.handle('get-favorite-videos', async (_event, mediaId: number, currentPage: number = 1) => {
  console.log('Starting to fetch favorite videos for media ID:', mediaId)
  try {
    console.log('Getting favorite videos for media ID:', mediaId)
    const cookieString = await getCookieString()
    
    const detailResponse = await axios.get(API.FAVORITE_DETAIL, {
      params: {
        media_id: mediaId,
        pn: currentPage,
        ps: 20,
        platform: 'web'
      },
      headers: {
        Cookie: cookieString
      }
    })

    console.log('Detail response:', detailResponse.data)

    if (detailResponse.data.code === 0) {
      const videos = detailResponse.data.data?.medias || []
      console.log('Found videos:', videos.length)
      
      const processedVideos = videos.map(video => ({
        bvid: video.bvid,
        title: video.title,
        author: video.upper.name,
        duration: video.duration,
        thumbnail: video.cover
      }))
      
      const hasMore = detailResponse.data.data?.has_more || false
      return { success: true, data: processedVideos, hasMore };
    }
    
    return { 
      success: false, 
      error: detailResponse.data.message || 'Failed to get favorite videos' 
    }
  } catch (error) {
    console.error('Error getting favorite videos:', error.response?.data || error)
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to get favorite videos'
    }
  }
})

// 获取视频音频URL
ipcMain.handle('get-video-audio-url', async (_event, bvid: string) => {
  try {
    const cookieString = await getCookieString()
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.bilibili.com'
    }

    // 先获取视频信息以获取 cid
    const videoInfoResponse = await axios.get(API.VIDEO_INFO, {
      params: {
        bvid: bvid
      },
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    if (videoInfoResponse.data.code === 0) {
      const cid = videoInfoResponse.data.data.cid
      console.log('Got cid for video:', bvid, cid)

      const playUrlResponse = await axios.get(API.PLAY_URL, {
        params: {
          bvid: bvid,
          cid: cid,
          fnval: 16,
          qn: 64,
          fourk: 1,
          platform: 'web'
        },
        headers: {
          ...headers,
          Cookie: cookieString
        }
      })

      if (playUrlResponse.data.code === 0) {
        const audioUrl = playUrlResponse.data.data.dash?.audio?.[0]?.baseUrl
        if (audioUrl) {
          return { success: true, data: { audioUrl } }
        }
        return { success: false, error: 'No audio URL found' }
      }
      return { success: false, error: playUrlResponse.data.message }
    }
    return { success: false, error: videoInfoResponse.data.message }
  } catch (error) {
    console.error('Error getting video audio URL:', error.response?.data || error)
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to get audio URL'
    }
  }
})

// 获取用户信息
ipcMain.handle('get-user-info', async () => {
  try {
    const cookieString = await getCookieString()
    const response = await axios.get(API.USER_INFO, {
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }

    return {
      success: true,
      data: {
        uname: response.data.data.uname,
        face: response.data.data.face,
        level: response.data.data.level
      }
    }
  } catch (error) {
    console.error('Error getting user info:', error)
    return {
      success: false,
      error: error.message || 'Failed to get user info'
    }
  }
})

// 检查登录状态
ipcMain.handle('check-login-status', async () => {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: 'https://bilibili.com'
    })

    const sessdata = cookies.find(c => c.name === 'SESSDATA')?.value
    if (!sessdata) {
      return false
    }

    const response = await axios.get(API.USER_INFO, {
      headers: {
        ...headers,
        Cookie: `SESSDATA=${sessdata}`
      }
    })

    return response.data.code === 0
  } catch (err) {
    console.error('Error checking login status:', err)
    return false
  }
})

// 退出登录
ipcMain.handle('logout', async () => {
  try {
    // 清除所有 bilibili.com 域名下的 cookie
    await session.defaultSession.clearStorageData({
      origin: 'https://bilibili.com',
      storages: ['cookies']
    })
    return { success: true }
  } catch (error) {
    console.error('Error logging out:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to logout' 
    }
  }
})

ipcMain.handle('proxy-audio', async (_, url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Origin': 'https://www.bilibili.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    // 将音频数据转换为 base64 格式
    const base64 = Buffer.from(buffer).toString('base64');
    // 创建 data URL
    return `data:audio/mp4;base64,${base64}`;
  } catch (error) {
    console.error('Error proxying audio:', error);
    throw error;
  }
});

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
