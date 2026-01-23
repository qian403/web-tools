// 統一的路由和 SEO 設定
export const routesMeta = [
  {
    path: '/',
    name: 'Home',
    title: '線上工具箱 | Web Tools',
    description: '免費線上工具箱，提供 QR Code 產生器、密碼產生器、進位轉換、繁簡轉換等實用小工具。',
    keywords: '線上工具,免費工具,網頁工具,工具箱,Web Tools'
  },
  {
    path: '/clock',
    name: 'Clock',
    title: '數位時鐘 | Web Tools',
    description: '簡潔的線上數位時鐘，即時顯示目前時間，支援全螢幕顯示。',
    keywords: '數位時鐘,線上時鐘,電子鐘,時間顯示,全螢幕時鐘'
  },
  {
    path: '/password-generator',
    name: 'passwordGenerator',
    title: '密碼產生器 | Web Tools',
    description: '免費線上密碼產生器，可自訂長度、大小寫、數字及特殊符號，產生安全隨機密碼。',
    keywords: '密碼產生器,隨機密碼,密碼生成,安全密碼,Password Generator'
  },
  {
    path: '/text-revealer',
    name: 'TextRevealer',
    title: '文字顯示器 | Web Tools',
    description: '文字放大顯示工具，自動調整字體大小填滿螢幕，適合簡報或展示使用。',
    keywords: '文字放大,大字顯示,簡報工具,文字展示,全螢幕文字'
  },
  {
    path: '/dice-game',
    name: 'DiceGame',
    title: '骰子遊戲 | Web Tools',
    description: '線上擲骰子遊戲，模擬真實骰子隨機結果，可設定投注金額與獲勝機率。',
    keywords: '骰子遊戲,擲骰子,線上骰子,隨機骰子,Dice Game'
  },
  {
    path: '/base-converter',
    name: 'BaseConverter',
    title: '進位轉換器 | Web Tools',
    description: '免費線上進位轉換工具，支援二進位、八進位、十進位、十六進位即時互轉。',
    keywords: '進位轉換,二進位,八進位,十進位,十六進位,進制轉換,Base Converter'
  },
  {
    path: '/system-info',
    name: 'SystemInfo',
    title: '系統資訊 | Web Tools',
    description: '查看您的瀏覽器、作業系統、螢幕解析度及裝置相關資訊。',
    keywords: '系統資訊,瀏覽器資訊,螢幕解析度,User Agent,裝置資訊'
  },
  {
    path: '/qr-code',
    name: 'QrCodeGenerator',
    title: 'QR Code 產生器 | Web Tools',
    description: '免費線上 QR Code 產生器，可自訂顏色、尺寸與容錯等級，支援下載 PNG 及 SVG 格式。',
    keywords: 'QR Code,QR Code產生器,二維碼,條碼產生,QR Code Generator'
  },
  {
    path: '/chinese-converter',
    name: 'ChineseConverter',
    title: '繁簡轉換 | Web Tools',
    description: '免費線上繁體簡體中文轉換工具，支援台灣繁體與中國簡體互轉，包含詞彙轉換。',
    keywords: '繁簡轉換,繁體轉簡體,簡體轉繁體,中文轉換,OpenCC'
  },
  {
    path: '/word-counter',
    name: 'WordCounter',
    title: '字數統計 | Web Tools',
    description: '免費線上字數統計工具，即時統計中英文字數、字元數、標點符號、行數等詳細數據。',
    keywords: '字數統計,字元統計,中文字數,英文字數,Word Counter'
  },
  {
    path: '/regex-tester',
    name: 'RegexTester',
    title: '正則表達式測試 | Web Tools',
    description: '免費線上正則表達式測試工具，即時測試 Regex，支援 flags 設定與匹配結果高亮顯示。',
    keywords: '正則表達式,Regex,正規表示式,正則測試,Regular Expression'
  }
]
