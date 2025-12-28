<template>
    <div class="page-container">
        <BackToHome />

        <div class="tool-container">
            <h2 class="tool-title">QR Code 產生器</h2>

            <div class="main-content">
                <!-- 左側：輸入區域 -->
                <div class="input-section">
                    <div class="form-group">
                        <label for="qr-input" class="form-label">輸入文字或網址</label>
                        <textarea
                            id="qr-input"
                            name="qrInput"
                            v-model="inputText"
                            placeholder="輸入要轉換的文字或網址..."
                            class="qr-input"
                            rows="4"
                            maxlength="2000"
                            @input="autoGenerate"
                        ></textarea>
                        <span class="char-count">{{ inputText.length }} / 2000</span>
                    </div>

                    <!-- 設定選項 -->
                    <div class="settings-section">
                        <h3 class="settings-title">自訂設定</h3>
                        
                        <div class="setting-item">
                            <label for="qr-size" class="setting-label">尺寸：{{ qrSize }}px</label>
                            <input 
                                type="range" 
                                id="qr-size"
                                v-model="qrSize" 
                                min="128" 
                                max="512" 
                                step="32"
                                class="range-slider"
                                @input="autoGenerate"
                            />
                        </div>

                        <div class="setting-item">
                            <span id="error-level-label" class="setting-label">容錯等級</span>
                            <div class="radio-group" role="radiogroup" aria-labelledby="error-level-label">
                                <label 
                                    v-for="level in errorLevels" 
                                    :key="level.value"
                                    :for="`error-level-${level.value}`"
                                    :class="['radio-option', { active: errorLevel === level.value }]"
                                >
                                    <input 
                                        type="radio"
                                        :id="`error-level-${level.value}`"
                                        :value="level.value" 
                                        v-model="errorLevel"
                                        name="errorLevel"
                                        @change="autoGenerate"
                                    />
                                    {{ level.label }}
                                </label>
                            </div>
                        </div>

                        <div class="color-settings">
                            <div class="color-item">
                                <label for="fg-color" class="setting-label">前景色</label>
                                <div class="color-picker-wrapper">
                                    <input 
                                        type="color" 
                                        id="fg-color"
                                        v-model="fgColor"
                                        class="color-picker"
                                        @input="autoGenerate"
                                    />
                                    <span class="color-value">{{ fgColor }}</span>
                                </div>
                            </div>
                            <div class="color-item">
                                <label for="bg-color" class="setting-label">背景色</label>
                                <div class="color-picker-wrapper">
                                    <input 
                                        type="color" 
                                        id="bg-color"
                                        v-model="bgColor"
                                        class="color-picker"
                                        @input="autoGenerate"
                                    />
                                    <span class="color-value">{{ bgColor }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右側：預覽區域 -->
                <div class="preview-section">
                    <div class="preview-card">
                        <div v-if="qrCodeDataUrl" class="qr-preview">
                            <img :src="qrCodeDataUrl" alt="QR Code" class="qr-image" />
                        </div>
                        <div v-else class="qr-placeholder">
                            <div class="placeholder-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                                    <rect x="14" y="14" width="3" height="3"/>
                                    <rect x="18" y="14" width="3" height="3"/>
                                    <rect x="14" y="18" width="3" height="3"/>
                                    <rect x="18" y="18" width="3" height="3"/>
                                </svg>
                            </div>
                            <p>輸入內容後自動產生 QR Code</p>
                        </div>
                    </div>

                    <div v-if="qrCodeDataUrl" class="action-buttons">
                        <Button variant="success" @click="downloadQRCode">
                            下載 PNG
                        </Button>
                        <Button variant="primary" @click="downloadSVG">
                            下載 SVG
                        </Button>
                        <Button variant="secondary" @click="copyToClipboard">
                            複製圖片
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QRCode from 'qrcode'
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'QrCodeGenerator',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            inputText: '',
            qrCodeDataUrl: '',
            qrSize: 256,
            fgColor: '#000000',
            bgColor: '#ffffff',
            errorLevel: 'M',
            debounceTimer: null,
            errorLevels: [
                { value: 'L', label: 'L (7%)' },
                { value: 'M', label: 'M (15%)' },
                { value: 'Q', label: 'Q (25%)' },
                { value: 'H', label: 'H (30%)' }
            ]
        }
    },
    methods: {
        autoGenerate() {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(() => {
                this.generateQRCode()
            }, 100)
        },
        async generateQRCode() {
            if (!this.inputText.trim()) {
                this.qrCodeDataUrl = ''
                return
            }

            try {
                this.qrCodeDataUrl = await QRCode.toDataURL(this.inputText, {
                    width: Number(this.qrSize),
                    margin: 2,
                    errorCorrectionLevel: this.errorLevel,
                    color: {
                        dark: this.fgColor,
                        light: this.bgColor
                    }
                })
            } catch (error) {
                this.showToast('產生 QR Code 失敗', 'error')
            }
        },
        downloadQRCode() {
            if (!this.qrCodeDataUrl) return

            const link = document.createElement('a')
            link.download = `qrcode-${Date.now()}.png`
            link.href = this.qrCodeDataUrl
            link.click()
            this.showToast('已下載 PNG', 'success')
        },
        async downloadSVG() {
            if (!this.inputText.trim()) return

            try {
                const svgString = await QRCode.toString(this.inputText, {
                    type: 'svg',
                    width: Number(this.qrSize),
                    margin: 2,
                    errorCorrectionLevel: this.errorLevel,
                    color: {
                        dark: this.fgColor,
                        light: this.bgColor
                    }
                })
                
                const blob = new Blob([svgString], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.download = `qrcode-${Date.now()}.svg`
                link.href = url
                link.click()
                URL.revokeObjectURL(url)
                this.showToast('已下載 SVG', 'success')
            } catch {
                this.showToast('下載 SVG 失敗', 'error')
            }
        },
        async copyToClipboard() {
            if (!this.qrCodeDataUrl) return

            try {
                const response = await fetch(this.qrCodeDataUrl)
                const blob = await response.blob()
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ])
                this.showToast('已複製到剪貼簿', 'success')
            } catch {
                this.showToast('複製失敗，請手動下載', 'error')
            }
        },
        showToast(message, type = 'info') {
            const toast = document.createElement('div')
            toast.textContent = message

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
                backgroundColor: type === 'success' ? '#4caf50' : type === 'error' ? '#e53e3e' : '#4299e1'
            })

            document.body.appendChild(toast)

            setTimeout(() => {
                toast.style.opacity = '1'
                toast.style.transform = 'translateX(0)'
            }, 100)

            setTimeout(() => {
                toast.style.opacity = '0'
                toast.style.transform = 'translateX(100%)'
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast)
                    }
                }, 300)
            }, 3000)
        }
    },
    beforeUnmount() {
        clearTimeout(this.debounceTimer)
    }
}
</script>

<style scoped>
.tool-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
    box-sizing: border-box;
}

.tool-title {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
    text-align: center;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    width: 100%;
    align-items: stretch;
}

/* 輸入區域 */
.input-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    position: relative;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #e2e8f0;
}

.qr-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 1rem;
    resize: none;
    height: 80px;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.3s;
}

.qr-input:focus {
    outline: none;
    border-color: #4299e1;
}

.qr-input::placeholder {
    color: #718096;
}

.char-count {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-size: 0.75rem;
    color: #718096;
}

/* 設定區域 */
.settings-section {
    background-color: #1a202c;
    border-radius: 12px;
    padding: 1rem;
    flex: 1;
}

.settings-title {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    color: #a0aec0;
    border-bottom: 1px solid #4a5568;
    padding-bottom: 0.4rem;
}

.setting-item {
    margin-bottom: 0.75rem;
}

.setting-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: #cbd5e0;
}

.range-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #4a5568;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
}

.range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4299e1;
    cursor: pointer;
    transition: transform 0.2s;
}

.range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

/* 容錯等級選項 */
.radio-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.radio-option {
    padding: 6px 12px;
    border-radius: 6px;
    background-color: #2d3748;
    color: #a0aec0;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.radio-option:hover {
    background-color: #4a5568;
}

.radio-option.active {
    background-color: #4299e1;
    color: white;
    border-color: #63b3ed;
}

.radio-option input {
    display: none;
}

/* 顏色設定 */
.color-settings {
    display: flex;
    gap: 1rem;
}

.color-item {
    flex: 1;
}

.color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #2d3748;
    padding: 6px 10px;
    border-radius: 6px;
}

.color-picker {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
}

.color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
}

.color-value {
    font-size: 0.8rem;
    color: #a0aec0;
    font-family: monospace;
}

/* 預覽區域 */
.preview-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.preview-card {
    background-color: #1a202c;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.qr-preview {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.qr-image {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.qr-placeholder {
    text-align: center;
    color: #718096;
}

.placeholder-icon {
    margin-bottom: 1rem;
    opacity: 0.5;
    color: #4a5568;
}

.qr-placeholder p {
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-buttons button {
    flex: 1;
    min-width: 80px;
}

/* RWD */
@media (max-width: 768px) {
    .tool-container {
        height: auto;
        min-height: 100vh;
        padding: 70px 15px 30px;
        justify-content: flex-start;
    }

    .tool-title {
        font-size: 1.5rem;
    }

    .main-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .preview-card {
        min-height: 250px;
        flex: none;
    }

    .color-settings {
        flex-direction: column;
        gap: 0.75rem;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-buttons button {
        width: 100%;
    }

    .qr-input {
        height: auto;
        min-height: 80px;
        resize: vertical;
    }
}

@media (max-width: 480px) {
    .radio-group {
        gap: 0.4rem;
    }

    .radio-option {
        padding: 5px 10px;
        font-size: 0.8rem;
    }
}
</style>
