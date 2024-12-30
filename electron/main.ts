import { app, BrowserWindow, ipcMain, session } from 'electron'
import path from 'path'
import axios from 'axios'

// B站API接口
const API = {
  VIEW: 'https://api.bilibili.com/x/web-interface/view',
  PLAY_URL: 'https://api.bilibili.com/x/player/playurl',
  USER_INFO: 'https://api.bilibili.com/x/web-interface/nav',
  FAVORITE_LIST: 'https://api.bilibili.com/x/v3/fav/folder/created/list-all',
  FAVORITE_DETAIL: 'https://api.bilibili.com/x/v3/fav/resource/list'
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
    titleBarStyle: 'hiddenInset',
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
  createWindow()

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
ipcMain.handle('get-favorite-videos', async (_event, mediaId: number) => {
  try {
    const cookieString = await getCookieString()
    
    const detailResponse = await axios.get(API.FAVORITE_DETAIL, {
      params: {
        media_id: mediaId,
        pn: 1,
        ps: 40,
        keyword: '',
        order: 'mtime',
        tid: 0,
        platform: 'web',
        web_location: '333.1387'
      },
      headers: {
        ...headers,
        Cookie: cookieString
      }
    })

    if (detailResponse.data.code !== 0) {
      throw new Error(`获取收藏夹内容失败: ${detailResponse.data.message}`)
    }

    const videos = detailResponse.data.data.medias || []
    const processedVideos = []

    for (const video of videos) {
      try {
        const playUrlResponse = await axios.get(API.PLAY_URL, {
          params: {
            bvid: video.bvid,
            cid: video.cid,
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
            processedVideos.push({
              bvid: video.bvid,
              title: video.title,
              author: video.upper.name,
              duration: video.duration,
              thumbnail: video.cover,
              audioUrl: audioUrl
            })
          }
        }
      } catch (error) {
        console.error(`Failed to get audio URL for video ${video.bvid}:`, error)
      }
    }

    return {
      success: true,
      data: processedVideos
    }

  } catch (error) {
    console.error('Error getting favorite videos:', error)
    return {
      success: false,
      error: error.message || 'Failed to get favorite videos'
    }
  }
})
