<template>
    <div class="page-container">
        <BackToHome />
        <div class="tool-container">
            <h2 class="tool-title">系統資訊</h2>
            <div class="cards-grid">
                <!-- 螢幕資訊卡片 -->
                <div class="info-card screen-card">
                    <div class="card-header">
                        <h3 class="card-title">螢幕資訊</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row" @click="copyField(systemInfo.screen.resolution)">
                            <span class="info-label">螢幕解析度</span>
                            <span class="info-value">{{ systemInfo.screen.resolution }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.screen.availableResolution)">
                            <span class="info-label">可用解析度</span>
                            <span class="info-value">{{ systemInfo.screen.availableResolution }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.screen.colorDepth)">
                            <span class="info-label">色彩深度</span>
                            <span class="info-value">{{ systemInfo.screen.colorDepth }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.screen.pixelRatio)">
                            <span class="info-label">像素比</span>
                            <span class="info-value">{{ systemInfo.screen.pixelRatio }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.screen.windowSize)">
                            <span class="info-label">視窗大小</span>
                            <span class="info-value">{{ systemInfo.screen.windowSize }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.screen.orientation)">
                            <span class="info-label">螢幕方向</span>
                            <span class="info-value">{{ systemInfo.screen.orientation }}</span>
                        </div>
                    </div>
                </div>

                <!-- 瀏覽器資訊卡片 -->
                <div class="info-card browser-card">
                    <div class="card-header">
                        <h3 class="card-title">瀏覽器資訊</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row" @click="copyField(systemInfo.browser.name)">
                            <span class="info-label">瀏覽器</span>
                            <span class="info-value">{{ systemInfo.browser.name }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.browser.version)">
                            <span class="info-label">版本</span>
                            <span class="info-value">{{ systemInfo.browser.version }}</span>
                        </div>
                        <div class="info-row"
                            @click="copyField(`${systemInfo.browser.engine} ${systemInfo.browser.engineVersion}`)">
                            <span class="info-label">引擎</span>
                            <span class="info-value">{{ systemInfo.browser.engine }} {{ systemInfo.browser.engineVersion
                                }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.browser.language)">
                            <span class="info-label">語言</span>
                            <span class="info-value">{{ systemInfo.browser.language }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cookie</span>
                            <span class="info-value">
                                <span :class="systemInfo.browser.cookieEnabled ? 'status-enabled' : 'status-disabled'">
                                    {{ systemInfo.browser.cookieEnabled ? '✓ 啟用' : '✗ 停用' }}
                                </span>
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">網路狀態</span>
                            <span class="info-value">
                                <span :class="systemInfo.browser.onLine ? 'status-enabled' : 'status-disabled'">
                                    {{ systemInfo.browser.onLine ? '✓ 在線' : '✗ 離線' }}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 作業系統資訊卡片 -->
                <div class="info-card os-card">
                    <div class="card-header">
                        <h3 class="card-title">作業系統</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row" @click="copyField(systemInfo.os.name)">
                            <span class="info-label">作業系統</span>
                            <span class="info-value">{{ systemInfo.os.name }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.os.version)">
                            <span class="info-label">版本</span>
                            <span class="info-value">{{ systemInfo.os.version }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.os.architecture)">
                            <span class="info-label">架構</span>
                            <span class="info-value">{{ systemInfo.os.architecture }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.os.cpuCores)">
                            <span class="info-label">CPU 核心</span>
                            <span class="info-value">{{ systemInfo.os.cpuCores }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.device.type)">
                            <span class="info-label">裝置類型</span>
                            <span class="info-value">{{ systemInfo.device.type }}</span>
                        </div>
                        <div class="info-row" @click="copyField(systemInfo.os.memory)"
                            v-if="systemInfo.os.memory !== '未知'">
                            <span class="info-label">記憶體</span>
                            <span class="info-value">{{ systemInfo.os.memory }}</span>
                        </div>
                    </div>
                </div>

                <!-- User Agent 卡片 - 佔滿整行 -->
                <div class="info-card full-width ua-card">
                    <div class="card-header">
                        <h3 class="card-title">User Agent</h3>
                    </div>
                    <div class="card-content">
                        <textarea class="ua-text" readonly :value="systemInfo.userAgent"></textarea>
                        <div class="button-group">
                            <button @click="copyToClipboard(systemInfo.userAgent)" class="action-btn copy-btn">
                                {{ copied ? '已複製' : '複製 UA' }}
                            </button>
                            <button @click="refreshInfo" class="action-btn refresh-btn">
                                重新整理
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import BackToHome from '@/components/BackToHome.vue';
import { UAParser } from 'ua-parser-js';

export default {
    name: 'SystemInfo',
    components: {
        BackToHome
    },
    setup() {
        const systemInfo = ref({
            screen: {
                resolution: '',
                availableResolution: '',
                colorDepth: '',
                pixelRatio: '',
                windowSize: '',
                orientation: ''
            },
            browser: {
                name: '',
                version: '',
                engine: '',
                engineVersion: '',
                language: '',
                cookieEnabled: false,
                onLine: false
            },
            os: {
                name: '',
                version: '',
                architecture: '',
                cpuCores: '',
                memory: ''
            },
            device: {
                type: '',
                vendor: '',
                model: ''
            },
            network: {
                type: '',
                downlink: '',
                saveData: false,
                rtt: ''
            },
            userAgent: ''
        });

        const copied = ref(false);

        // 改進方向檢測
        const getOrientation = () => {
            if (window.screen.orientation && window.screen.orientation.type) {
                const type = window.screen.orientation.type;
                const orientationMap = {
                    'portrait-primary': '直向（主要）',
                    'portrait-secondary': '直向（次要）',
                    'landscape-primary': '橫向（主要）',
                    'landscape-secondary': '橫向（次要）'
                };
                return orientationMap[type] || type;
            }
            return window.innerWidth > window.innerHeight ? '橫向（主要）' : '直向（主要）';
        };

        // 改進網路資訊檢測
        const getNetworkInfo = () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            if (connection) {
                const typeMap = {
                    'slow-2g': '慢速 2G',
                    '2g': '2G',
                    '3g': '3G',
                    '4g': '4G',
                    '5g': '5G'
                };
                return {
                    type: typeMap[connection.effectiveType] || connection.effectiveType || '未知',
                    downlink: connection.downlink ? `${connection.downlink} Mbps` : '不支援',
                    saveData: connection.saveData || false,
                    rtt: connection.rtt ? `${connection.rtt} ms` : '不支援'
                };
            }

            return {
                type: '不支援',
                downlink: '不支援',
                saveData: false,
                rtt: '不支援'
            };
        };

        // 改進裝置類型檢測
        const getDeviceType = (uaResult) => {
            const type = uaResult.device.type;
            if (type) {
                const typeMap = {
                    'mobile': '手機',
                    'tablet': '平板',
                    'smarttv': '智慧電視',
                    'wearable': '穿戴裝置',
                    'embedded': '嵌入式裝置',
                    'console': '遊戲主機'
                };
                return typeMap[type] || type;
            }

            // 如果 UAParser 無法識別，使用其他方法判斷
            const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);

            if (isTablet) return '平板';
            if (isMobile) return '手機';
            return '桌面電腦';
        };

        // 改進作業系統名稱顯示
        const formatOSName = (name) => {
            const osMap = {
                'Windows': 'Windows',
                'Mac OS': 'macOS',
                'iOS': 'iOS',
                'Android': 'Android',
                'Linux': 'Linux',
                'Ubuntu': 'Ubuntu',
                'Debian': 'Debian',
                'Fedora': 'Fedora',
                'ChromeOS': 'Chrome OS'
            };
            return osMap[name] || name;
        };

        const updateSystemInfo = () => {
            const parser = new UAParser(navigator.userAgent);
            const result = parser.getResult();

            const networkInfo = getNetworkInfo();

            systemInfo.value = {
                screen: {
                    resolution: `${window.screen.width} × ${window.screen.height}`,
                    availableResolution: `${window.screen.availWidth} × ${window.screen.availHeight}`,
                    colorDepth: `${window.screen.colorDepth} bits`,
                    pixelRatio: `${window.devicePixelRatio}x`,
                    windowSize: `${window.innerWidth} × ${window.innerHeight}`,
                    orientation: getOrientation()
                },
                browser: {
                    name: result.browser.name || '未知瀏覽器',
                    version: result.browser.version || '未知版本',
                    engine: result.engine.name || '未知引擎',
                    engineVersion: result.engine.version || '',
                    language: navigator.languages ? navigator.languages.join(', ') : (navigator.language || '未知'),
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine
                },
                os: {
                    name: formatOSName(result.os.name) || '未知系統',
                    version: result.os.version || '未知版本',
                    architecture: result.cpu.architecture || '未知架構',
                    cpuCores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核心` : '未知',
                    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '未知'
                },
                device: {
                    type: getDeviceType(result),
                    vendor: result.device.vendor || '未知',
                    model: result.device.model || '未知'
                },
                network: networkInfo,
                userAgent: navigator.userAgent
            };
        };

        const refreshInfo = () => {
            updateSystemInfo();
            showToast('資訊已更新', 'success');
        };

        // 新增：複製單個欄位
        const copyField = async (text) => {
            if (!text || text === '未知' || text === '不支援') return;

            try {
                await navigator.clipboard.writeText(text);
                showToast('已複製', 'success');
            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('複製失敗', 'error');
            }
        };

        const copyToClipboard = async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                copied.value = true;
                showToast('已複製到剪貼簿', 'success');
                setTimeout(() => {
                    copied.value = false;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                showToast('複製失敗', 'error');
            }
        };

        const showToast = (message, type = 'info') => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;

            Object.assign(toast.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                zIndex: '9999',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            });

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 2000);
        };

        const handleResize = () => {
            systemInfo.value.screen.windowSize = `${window.innerWidth} × ${window.innerHeight}`;
            systemInfo.value.screen.orientation = getOrientation();
        };

        onMounted(() => {
            updateSystemInfo();
            window.addEventListener('resize', handleResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
        });

        return {
            systemInfo,
            copied,
            refreshInfo,
            copyToClipboard,
            copyField
        };
    }
};
</script>

<style scoped>
.page-container {
    display: block;
    min-height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    padding: 8px 0 80px 0;
    margin: 0;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    overflow-x: hidden;
}

.tool-container {
    width: 100%;
    max-width: 1400px;
    margin: 20px auto 40px;
    padding: 0 20px;
}

.tool-title {
    text-align: center;
    color: white;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 40px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 卡片網格佈局 - 一行三個 */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

/* 卡片樣式 - Glassmorphism 效果 */
.info-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.info-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* 佔滿整行的卡片 */
.info-card.full-width {
    grid-column: 1 / -1;
}

/* 卡片標題區 */
.card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 資訊行 */
.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
}

.info-row:hover {
    background: rgba(255, 255, 255, 0.1);
}

.info-row:active {
    background: rgba(255, 255, 255, 0.08);
}

.info-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
}

.info-value {
    color: white;
    font-size: 14px;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
}

/* 狀態指示器 */
.status-enabled {
    color: #10b981;
    font-weight: 600;
}

.status-disabled {
    color: #ef4444;
    font-weight: 600;
}

/* User Agent 樣式 */
.ua-text {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    padding: 16px;
    border-radius: 10px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 16px;
    resize: none;
    overflow: hidden;
    word-wrap: break-word;
    white-space: pre-wrap;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.ua-text:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(0, 0, 0, 0.3);
}

.button-group {
    display: flex;
    gap: 16px;
}

.action-btn {
    flex: 1;
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.copy-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.copy-btn:hover {
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.refresh-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.refresh-btn:hover {
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.action-btn:active {
    opacity: 0.9;
}

/* 平板尺寸 - 一行兩個 */
@media (max-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .tool-title {
        font-size: 32px;
    }

    .tool-container {
        padding: 0 16px;
    }
}

/* 手機尺寸 - 一行一個 */
@media (max-width: 768px) {
    .page-container {
        padding: 8px 0 60px 0;
    }

    .tool-container {
        padding: 0 12px;
        margin-top: 12px;
    }

    .tool-title {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .info-card {
        padding: 16px;
        border-radius: 12px;
    }

    .card-header {
        margin-bottom: 12px;
        padding-bottom: 10px;
    }

    .card-title {
        font-size: 17px;
    }

    .info-row {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
    }

    .info-row:hover {
        padding-right: 12px;
    }

    .info-label {
        font-size: 13px;
        min-width: 80px;
    }

    .info-value {
        text-align: right;
        font-size: 13px;
    }

    .button-group {
        flex-direction: row;
        gap: 10px;
    }

    .action-btn {
        padding: 11px 18px;
        font-size: 14px;
    }

    .ua-text {
        font-size: 11px;
        padding: 12px;
        line-height: 1.5;
        margin-bottom: 12px;
    }
}

/* 小手機尺寸優化 */
@media (max-width: 480px) {
    .page-container {
        padding: 8px 0 50px 0;
    }

    .tool-container {
        padding: 0 8px;
    }

    .tool-title {
        font-size: 22px;
        margin-bottom: 16px;
    }

    .cards-grid {
        gap: 12px;
    }

    .info-card {
        padding: 14px;
        border-radius: 10px;
    }

    .card-header {
        margin-bottom: 10px;
        padding-bottom: 8px;
    }

    .card-title {
        font-size: 16px;
    }

    .info-row {
        padding: 9px 10px;
        gap: 6px;
    }

    .info-label {
        font-size: 12px;
        min-width: 70px;
    }

    .info-value {
        font-size: 12px;
    }

    .ua-text {
        font-size: 10px;
        padding: 10px;
        line-height: 1.4;
        margin-bottom: 10px;
    }

    .button-group {
        gap: 8px;
    }

    .action-btn {
        padding: 10px 16px;
        font-size: 13px;
    }
}
</style>
