<template>
    <div class="page-container">
        <BackToHome />

        <div class="tool-container">
            <h2 class="tool-title">端口選擇器</h2>
            <p class="tool-description">隨機產生可用的端口號碼，適合開發測試使用。</p>

            <div class="port-range-selector">
                <div class="range-option">
                    <span class="range-label">常用端口 (3000-9999)</span>
                    <label class="switch">
                        <input type="radio" v-model="portRange" value="common" />
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="range-option">
                    <span class="range-label">註冊端口 (1024-49151)</span>
                    <label class="switch">
                        <input type="radio" v-model="portRange" value="registered" />
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="range-option">
                    <span class="range-label">動態端口 (49152-65535)</span>
                    <label class="switch">
                        <input type="radio" v-model="portRange" value="dynamic" />
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>

            <div class="button-container">
                <Button variant="primary" @click="generatePort" aria-label="產生隨機端口">產生端口</Button>
            </div>

            <div v-if="generatedPort" class="result">
                <div class="port-display">{{ generatedPort }}</div>
                <Button variant="success" size="small" @click="copyToClipboard" aria-label="複製端口到剪貼簿">複製端口</Button>
            </div>
        </div>
    </div>
</template>

<script>
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'PortPicker',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            portRange: 'common',
            generatedPort: null
        }
    },
    methods: {
        generatePort() {
            let min, max

            switch (this.portRange) {
                case 'common':
                    min = 3000
                    max = 9999
                    break
                case 'registered':
                    min = 1024
                    max = 49151
                    break
                case 'dynamic':
                    min = 49152
                    max = 65535
                    break
                default:
                    min = 3000
                    max = 9999
            }

            this.generatedPort = Math.floor(Math.random() * (max - min + 1)) + min
        },
        copyToClipboard() {
            if (!this.generatedPort) return

            navigator.clipboard.writeText(this.generatedPort.toString())
                .then(() => {
                    this.showToast('已複製到剪貼簿！', 'success')
                })
                .catch(() => {
                    this.showToast('複製失敗，請手動複製', 'error')
                })
        },
        showToast(message, type = 'info') {
            const toast = document.createElement('div')
            toast.className = `toast toast-${type}`
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
    }
}
</script>

<style scoped>
.tool-description {
    color: #a0aec0;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.25rem;
    line-height: 1.5;
}

.port-range-selector {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
}

.range-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 280px;
}

.range-label {
    font-size: 0.95rem;
    color: #e2e8f0;
}

/* iOS 風格開關 */
.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #4a5568;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

.switch input:checked + .slider {
    background-color: #4299e1;
}

.switch input:checked + .slider:before {
    transform: translateX(16px);
}

.button-container {
    margin-bottom: 2rem;
}

.result {
    text-align: center;
    background-color: var(--secondary-bg);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    margin-top: var(--spacing-lg);
}

.port-display {
    font-size: 3rem;
    font-weight: bold;
    color: #4299e1;
    margin-bottom: 1rem;
    font-family: 'Courier New', monospace;
}
</style>
