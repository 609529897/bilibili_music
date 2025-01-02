import { app, BrowserWindow, ipcMain, session, protocol, shell, BrowserView } from 'electron'
import path from 'path'
import axios from 'axios'
import http from 'http'
import { AddressInfo } from 'net'

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
let playerView: BrowserView | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
    backgroundColor: '#ffffff',
    // frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // 允许跨域请求
    },
  })

  // 添加加载错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Main window load failed:', errorCode, errorDescription);
  });

  // 添加渲染进程错误处理
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
  });

  // 添加崩溃处理
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Window crashed');
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      .catch(err => console.error('Failed to load dev server:', err));
  } else {
    mainWindow.loadFile('dist/index.html')
      .catch(err => console.error('Failed to load file:', err));
  }

  // 默认打开开发者工具
  // mainWindow.webContents.openDevTools()
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
  // setupImageProxy()  // 注册图片代理服务

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
  playerView = null;
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
    // 清除所有 bilibili 相关域名的 cookie 和存储数据
    const domains = [
      'bilibili.com',
      '.bilibili.com',
      'www.bilibili.com',
      'passport.bilibili.com',
      'api.bilibili.com'
    ];

    for (const domain of domains) {
      // 清除 cookies
      await session.defaultSession.clearStorageData({
        origin: `https://${domain}`,
        storages: [
          'cookies',
          'localstorage',
          'indexdb',
          'shadercache',
          'websql',
          'serviceworkers',
        ]
      });

      // 额外清除特定的 cookies
      const cookies = await session.defaultSession.cookies.get({ domain });
      for (const cookie of cookies) {
        await session.defaultSession.cookies.remove(
          `https://${domain}`,
          cookie.name
        );
      }
    }

    // 清除本地存储的登录状态
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        localStorage.removeItem('disclaimer-accepted');
        localStorage.removeItem('login-status');
        sessionStorage.clear();
      `);
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return {
      success: false,
      error: error.message || 'Failed to logout'
    };
  }
});

ipcMain.handle('proxy-audio', async (_, url: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Origin': 'https://www.bilibili.com'
      },
      maxRedirects: 5,
      timeout: 30000,
    });

    // 创建本地服务器来代理音频流
    const server = http.createServer(async (req, res) => {
      // 设置CORS头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');

      // 处理预检请求
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // 处理范围请求
      const range = req.headers.range;
      if (range) {
        try {
          const rangeResponse = await axios({
            method: 'get',
            url: url,
            headers: {
              ...response.config.headers,
              'Range': range
            },
            responseType: 'stream',
            maxRedirects: 5,
            timeout: 30000,
          });

          res.writeHead(206, {
            'Content-Type': rangeResponse.headers['content-type'] || 'audio/mp4',
            'Content-Range': rangeResponse.headers['content-range'],
            'Content-Length': rangeResponse.headers['content-length'],
            'Accept-Ranges': 'bytes'
          });

          rangeResponse.data.pipe(res);
        } catch (error) {
          console.error('Range request error:', error);
          res.writeHead(500);
          res.end('Range request failed');
        }
        return;
      }

      // 普通请求
      try {
        const fullResponse = await axios({
          method: 'get',
          url: url,
          responseType: 'stream',
          headers: response.config.headers,
          maxRedirects: 5,
          timeout: 30000,
        });

        res.writeHead(200, {
          'Content-Type': fullResponse.headers['content-type'] || 'audio/mp4',
          'Content-Length': fullResponse.headers['content-length'],
          'Accept-Ranges': 'bytes'
        });

        fullResponse.data.pipe(res);
      } catch (error) {
        console.error('Full request error:', error);
        res.writeHead(500);
        res.end('Full request failed');
      }
    });

    // 随机端口启动服务器
    await new Promise<void>((resolve) => server.listen(0, 'localhost', () => resolve()));
    const port = (server.address() as AddressInfo).port;

    // 返回本地代理URL
    return `http://localhost:${port}`;
  } catch (error) {
    console.error('Error proxying audio:', error);
    throw error;
  }
});

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

// 窗口控制
ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

// 创建播放器视图
ipcMain.handle('create-player-view', (_, bvid: string) => {
  if (!mainWindow) return;
  
  // 如果已存在播放器视图，先移除
  if (playerView) {
    mainWindow.removeBrowserView(playerView);
    playerView = null;
  }

  // 创建新的播放器视图
  playerView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    }
  });

  mainWindow.addBrowserView(playerView);

  // 设置播放器视图的位置和大小
  const bounds = mainWindow.getBounds();
  const titleBarHeight = process.platform === 'darwin' ? 28 : 32; // 标题栏高度
  playerView.setBounds({
    x: 0,
    y: titleBarHeight,
    width: bounds.width,
    height: bounds.height - titleBarHeight
  });
  playerView.setBackgroundColor('#000000');

  // 加载 B 站播放器
  playerView.webContents.loadURL(
    `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0&autoplay=1&theater=1&t=0&p=1&as_wide=1&widescale=1`
  );

  // 监听窗口大小变化
  mainWindow.on('resize', () => {
    if (!mainWindow || !playerView) return;
    const newBounds = mainWindow.getBounds();
    playerView.setBounds({
      x: 0,
      y: titleBarHeight,
      width: newBounds.width,
      height: newBounds.height - titleBarHeight
    });
  });
});

// 关闭播放器视图
ipcMain.handle('close-player-view', () => {
  if (!mainWindow || !playerView) return;
  mainWindow.removeBrowserView(playerView);
  playerView = null;
});

// 在窗口关闭时清理播放器视图
app.on('window-all-closed', () => {
  playerView = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

export function setupImageProxy() {
  // ipcMain.handle('fetch-image', async (_, url: string) => {
  //   try {
  //     const response = await axios.get(url, {
  //       responseType: 'arraybuffer',
  //       headers: {
  //         'Referer': 'https://www.bilibili.com',
  //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  //       }
  //     });

  //     const buffer = Buffer.from(response.data);
  //     const base64 = buffer.toString('base64');
  //     const contentType = response.headers['content-type'] || 'image/jpeg';
  //     return `data:${contentType};base64,${base64}`;
  //   } catch (error) {
  //     console.error('Image proxy error:', error);
  //     return null;
  //   }
  // });
}

// 禁用右键菜单和开发者工具
app.on('browser-window-created', (_, window) => {
  window.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });
  
  // 禁用开发者工具
  if (app.isPackaged) {
    window.webContents.on('devtools-opened', () => {
      window.webContents.closeDevTools();
    });
  }
});

// 修改请求过滤规则，允许必要的资源请求
app.on('web-contents-created', (event, contents) => {
  contents.session.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    // 允许以下请求:
    // - B站 API 请求
    // - 本地资源请求
    // - Vite 开发服务器请求
    // - B站图片资源
    // - Electron 相关请求
    if (
      url.startsWith('https://api.bilibili.com/') || 
      url.startsWith('file://') || 
      url.startsWith('data:') ||
      url.startsWith('http://localhost') || // 允许本地开发服务器
      url.startsWith('https://i0.hdslb.com/') || // B站图片资源
      url.startsWith('https://i1.hdslb.com/') ||
      url.startsWith('https://i2.hdslb.com/') ||
      url.startsWith('ws://') || // WebSocket 连接
      url.startsWith('wss://') ||
      url.startsWith('devtools://') || // 开发工具
      url.startsWith('chrome-extension://') || // Chrome 扩展
      url.includes('vite') || // Vite 相关资源
      url.includes('sourcemap') // Source maps
    ) {
      callback({cancel: false});
    } else {
      console.log('Blocked request to:', url); // 添加日志以便调试
      callback({cancel: false}); // 临时改为允许所有请求，方便调试
    }
  });

  // 添加错误处理
  contents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page load failed:', errorCode, errorDescription);
  });
});

// 退出登录后强制刷新
if (mainWindow) {
  mainWindow.webContents.reload();
}

// 退出登录后重新创建窗口
if (mainWindow) {
  const bounds = mainWindow.getBounds();
  mainWindow.close();
  mainWindow = null;
  createWindow();
  mainWindow?.setBounds(bounds);
}
