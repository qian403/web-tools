const fs = require('fs')
const path = require('path')

// 讀取設定檔（使用 CommonJS 方式）
const configPath = path.join(__dirname, '../src/config/routes.js')
const configContent = fs.readFileSync(configPath, 'utf-8')

// 解析 routesMeta
const match = configContent.match(/export const routesMeta = (\[[\s\S]*?\n\])/)
if (!match) {
  console.error('無法解析 routes.js')
  process.exit(1)
}

const routesMeta = eval(match[1])

const distPath = path.join(__dirname, '../dist')
const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8')

// 跳過首頁，只處理子頁面
const pages = routesMeta.filter(r => r.path !== '/')

pages.forEach(page => {
  const dirPath = path.join(distPath, page.path)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  
  let html = indexHtml
    .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${page.description}"`)
    .replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${page.keywords}"`)
    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${page.title}"`)
    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${page.description}"`)
    .replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${page.title}"`)
    .replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${page.description}"`)
  
  fs.writeFileSync(path.join(dirPath, 'index.html'), html)
  console.log(`Generated: ${page.path}/index.html`)
})

console.log('Static pages generated successfully!')
