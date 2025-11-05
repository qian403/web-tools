<template>
    <div class="page-container">
        <BackToHome />
        <div class="tool-container">
            <h2 class="tool-title">系統資訊</h2>
            <div class="cards-grid">
                <!-- 螢幕資訊卡片 -->
                <div class="info-card">
                    <div class="card-header">
                        <h3 class="card-title">螢幕資訊</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">螢幕解析度</span>
                            <span class="info-value">{{ systemInfo.screen.resolution }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">可用解析度</span>
                            <span class="info-value">{{ systemInfo.screen.availableResolution }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">色彩深度</span>
                            <span class="info-value">{{ systemInfo.screen.colorDepth }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">視窗大小</span>
                            <span class="info-value">{{ systemInfo.screen.windowSize }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">螢幕方向</span>
                            <span class="info-value">{{ systemInfo.screen.orientation }}</span>
                        </div>
                    </div>
                </div>

                <!-- 瀏覽器資訊卡片 -->
                <div class="info-card">
                    <div class="card-header">
                        <h3 class="card-title">瀏覽器資訊</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">瀏覽器</span>
                            <span class="info-value">{{ systemInfo.browser.name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">版本</span>
                            <span class="info-value">{{ systemInfo.browser.version }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">引擎</span>
                            <span class="info-value">{{ systemInfo.browser.engine }} {{ systemInfo.browser.engineVersion
                            }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">語言</span>
                            <span class="info-value">{{ systemInfo.browser.language }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cookie</span>
                            <span class="info-value">{{ systemInfo.browser.cookieEnabled ? '啟用' : '停用' }}</span>
                        </div>
                    </div>
                </div>

                <!-- 作業系統資訊卡片 -->
                <div class="info-card">
                    <div class="card-header">
                        <h3 class="card-title">作業系統</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="info-label">作業系統</span>
                            <span class="info-value">{{ systemInfo.os.name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">版本</span>
                            <span class="info-value">{{ systemInfo.os.version }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">裝置類型</span>
                            <span class="info-value">{{ systemInfo.device.type }}</span>
                        </div>
                    </div>
                </div>

                <!-- User Agent 卡片 - 佔滿整行 -->
                <div class="info-card full-width">
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

        const getOrientation = () => {
            if (window.screen.orientation && window.screen.orientation.type) {
                return window.screen.orientation.type;
            }
            return window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary';
        };

        const getNetworkInfo = () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            if (connection) {
                return {
                    type: connection.effectiveType || '不支援',
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
                    name: result.browser.name || '未知',
                    version: result.browser.version || '未知',
                    engine: result.engine.name || '未知',
                    engineVersion: result.engine.version || '',
                    language: navigator.language || navigator.userLanguage || '未知',
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine
                },
                os: {
                    name: result.os.name || '未知',
                    version: result.os.version || '未知',
                    architecture: result.cpu.architecture || '未知',
                    cpuCores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核心` : '未知',
                    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '未知'
                },
                device: {
                    type: result.device.type || 'Desktop',
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

        const copyToClipboard = async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                copied.value = true;
                showToast('已複製到剪貼簿！', 'success');
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
                fontWeight: 'bold',
                zIndex: '9999',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease',
                backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'
            });

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 10);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(toast);
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
            copyToClipboard
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
    background-color: #2d3748;
    overflow-x: hidden;
}

.tool-container {
    width: 100%;
    max-width: 1400px;
    margin-top: 20px;
    margin-bottom: 40px;
    justify-content: flex-start;
}

.tool-title {
    text-align: center;
    color: white;
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 30px;
}

/* 卡片網格佈局 - 一行三個 */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

/* 卡片樣式 */
.info-card {
    background-color: transparent;
    border-radius: 0;
    padding: 0;
}

/* 佔滿整行的卡片 */
.info-card.full-width {
    grid-column: 1 / -1;
}

/* 卡片標題區 */
.card-header {
    margin-bottom: 16px;
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
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    transition: all 0.2s ease;
    margin-bottom: 8px;
}

.info-row:hover {
    background: rgba(255, 255, 255, 0.15);
}

.info-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
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

/* User Agent 樣式 */
.ua-text {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    padding: 14px;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 13px;
    color: white;
    line-height: 1.6;
    border: 2px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 12px;
    resize: none;
    overflow: hidden;
    word-wrap: break-word;
    white-space: pre-wrap;
    box-sizing: border-box;
}

.button-group {
    display: flex;
    gap: 12px;
}

.action-btn {
    flex: 1;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.copy-btn {
    background-color: #0072E3;
    color: white;
}

.copy-btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 114, 227, 0.4);
}

.refresh-btn {
    background-color: #48bb78;
    color: white;
}

.refresh-btn:hover {
    background-color: #38a169;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

/* 平板尺寸 - 一行兩個 */
@media (max-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }

    .tool-title {
        font-size: 28px;
    }
}

/* 手機尺寸 - 一行一個 */
@media (max-width: 768px) {
    .page-container {
        padding: 12px 4px;
    }

    .tool-container {
        padding: 0 4px;
    }

    .tool-title {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .info-card {
        padding: 16px 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: auto;
    }

    .card-icon {
        font-size: 24px;
    }

    .card-title {
        font-size: 18px;
    }

    .card-header {
        padding: 0 16px;
    }

    .card-content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 10px 16px;
        margin: 0;
    }

    .info-value {
        text-align: left;
        width: 100%;
    }

    .button-group {
        flex-direction: column;
        padding: 0 16px;
    }

    .action-btn {
        width: 100%;
    }

    .ua-text {
        font-size: 10px;
        padding: 12px;
        line-height: 1.5;
        height: auto;
        min-height: auto;
        resize: none;
        box-sizing: border-box;
        margin: 0;
        overflow: hidden;
        word-wrap: break-word;
        white-space: pre-wrap;
    }
}

/* 小手機尺寸優化 */
@media (max-width: 480px) {
    .page-container {
        padding: 10px 4px;
    }

    .tool-container {
        padding: 0 4px;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .info-card {
        padding: 12px 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: auto;
    }

    .card-header {
        gap: 8px;
        margin-bottom: 16px;
        padding: 0 12px;
    }

    .card-content {
        gap: 8px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .info-row {
        padding: 10px 12px;
        margin: 0;
    }

    .info-label {
        font-size: 12px;
    }

    .info-value {
        font-size: 13px;
    }

    .ua-text {
        font-size: 9px;
        padding: 10px;
        line-height: 1.4;
        height: auto;
        min-height: auto;
        resize: none;
        box-sizing: border-box;
        margin: 0;
        overflow: hidden;
        word-wrap: break-word;
        white-space: pre-wrap;
    }

    .button-group {
        padding: 0 12px;
    }
}
</style>
