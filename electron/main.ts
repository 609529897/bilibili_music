import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import axios from 'axios'

// B站API接口
const API = {
  VIEW: 'https://api.bilibili.com/x/web-interface/view',
  PLAY_URL: 'https://api.bilibili.com/x/player/playurl',
  USER_INFO: 'https://api.bilibili.com/x/web-interface/nav'
}

// 基础请求头
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com',
  'Origin': 'https://www.bilibili.com',
  'Accept': 'application/json, text/plain, */*',
  'Connection': 'keep-alive',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site'
}

// 认证信息
const BILIBILI_COOKIES = {
  SESSDATA: '请把你的SESSDATA粘贴在这里',  // 例如：'abc123....'
  bili_jct: '请把你的bili_jct粘贴在这里',  // 例如：'def456....'
  DedeUserID: '请把你的DedeUserID粘贴在这里'  // 例如：'123456'
}

// 获取完整的Cookie字符串
const getCookieString = () => {
  return Object.entries(BILIBILI_COOKIES)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

// 检查登录状态
async function checkLoginStatus() {
  try {
    const response = await axios.get(API.USER_INFO, {
      headers: {
        ...headers,
        Cookie: getCookieString()
      }
    })
    return response.data.code === 0
  } catch (error) {
    console.error('Failed to check login status:', error)
    return false
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile('dist/index.html')
  }

  // 默认打开开发者工具
  win.webContents.openDevTools()
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

// Handle IPC messages here
ipcMain.handle('add-video', async (event, videoUrl: string) => {
  try {
    console.log('Processing video URL:', videoUrl)
    
    // 检查登录状态
    const isLoggedIn = await checkLoginStatus()
    if (!isLoggedIn) {
      throw new Error('需要登录B站账号才能获取视频信息')
    }

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
        Cookie: getCookieString()
      }
    })

    console.log('Video info response:', viewResponse.data)

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
        fnval: 16, // 请求音频流
        qn: 64,    // 音质
        fourk: 1   // 支持4K
      },
      headers: {
        ...headers,
        Cookie: getCookieString()
      }
    })

    console.log('Play URL response:', playUrlResponse.data)

    if (playUrlResponse.data.code !== 0) {
      throw new Error(playUrlResponse.data.message || 'Failed to fetch audio URL')
    }

    // 从响应中提取音频URL
    const audioUrl = playUrlResponse.data.data.dash?.audio?.[0]?.baseUrl
    if (!audioUrl) {
      throw new Error('无法获取音频URL，可能需要大会员权限')
    }
    console.log('Extracted audio URL:', audioUrl)

    const responseData = {
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
    
    console.log('Sending response to renderer:', responseData)
    return responseData

  } catch (error) {
    console.error('Error processing video:', error)
    return {
      success: false,
      error: error.message || 'Failed to process video'
    }
  }
})
