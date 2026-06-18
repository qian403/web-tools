<template>
    <div class="page-container">
        <BackToHome />

        <div class="tool-container">
            <h2 class="tool-title">端口選擇器</h2>
            <p class="tool-description">隨機產生可用的端口號碼，適合開發測試使用。</p>

            <div class="port-range-selector" role="radiogroup" aria-label="端口範圍">
                <button
                    v-for="opt in rangeOptions"
                    :key="opt.value"
                    type="button"
                    class="range-card"
                    :class="{ active: portRange === opt.value }"
                    role="radio"
                    :aria-checked="portRange === opt.value"
                    @click="portRange = opt.value"
                >
                    <span class="range-name">{{ opt.name }}</span>
                    <span class="range-num">{{ opt.min }}–{{ opt.max }}</span>
                </button>
            </div>

            <div class="button-container">
                <Button variant="primary" @click="generatePort" aria-label="產生隨機端口">
                    {{ generatedPort ? '重新產生' : '產生端口' }}
                </Button>
            </div>

            <div class="result" :class="{ empty: !generatedPort }">
                <template v-if="generatedPort">
                    <button
                        type="button"
                        class="port-display"
                        title="點擊複製"
                        @click="copyToClipboard"
                    >{{ generatedPort }}</button>
                    <Button variant="success" size="small" @click="copyToClipboard" aria-label="複製端口到剪貼簿">
                        複製端口
                    </Button>
                </template>
                <span v-else class="result-placeholder">點擊上方按鈕產生端口</span>
            </div>
        </div>
    </div>
</template>

<script>
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

const RANGE_OPTIONS = [
    { value: 'common', name: '常用端口', min: 3000, max: 9999 },
    { value: 'registered', name: '註冊端口', min: 1024, max: 49151 },
    { value: 'dynamic', name: '動態端口', min: 49152, max: 65535 }
]

export default {
    name: 'PortPicker',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            rangeOptions: RANGE_OPTIONS,
            portRange: 'common',
            generatedPort: null
        }
    },
    methods: {
        generatePort() {
            const { min, max } = RANGE_OPTIONS.find(o => o.value === this.portRange)
            this.generatedPort = Math.floor(Math.random() * (max - min + 1)) + min
        },
        async copyToClipboard() {
            if (!this.generatedPort) return
            const text = this.generatedPort.toString()
            try {
                // navigator.clipboard 只在 HTTPS / localhost 可用，區網 IP 用 http 開時為 undefined
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(text)
                } else {
                    this.fallbackCopy(text)
                }
                this.showToast('已複製到剪貼簿！', 'success')
            } catch {
                this.showToast('複製失敗，請手動複製', 'error')
            }
        },
        fallbackCopy(text) {
            const el = document.createElement('textarea')
            el.value = text
            el.style.position = 'fixed'
            el.style.opacity = '0'
            document.body.appendChild(el)
            el.select()
            const ok = document.execCommand('copy')
            document.body.removeChild(el)
            if (!ok) throw new Error('execCommand failed')
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
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.range-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    min-width: 150px;
    flex: 1 1 150px;
    max-width: 200px;
    padding: 1rem;
    background-color: #2d3748;
    border: 2px solid #4a5568;
    border-radius: var(--border-radius);
    color: #e2e8f0;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
}

.range-card:hover {
    border-color: #718096;
    transform: translateY(-2px);
}

.range-card.active {
    border-color: #4299e1;
    background-color: #2b4a6f;
}

.range-name {
    font-size: 1rem;
    font-weight: bold;
}

.range-num {
    font-size: 0.85rem;
    color: #a0aec0;
    font-family: 'Courier New', monospace;
}

.button-container {
    margin-bottom: 2rem;
}

.result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 190px;
    text-align: center;
    background-color: var(--secondary-bg);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    margin-top: var(--spacing-lg);
}

.result.empty {
    background-color: transparent;
    border: 1px dashed #4a5568;
}

.result-placeholder {
    color: #718096;
    font-size: 0.95rem;
}

.port-display {
    display: block;
    width: 100%;
    border: none;
    background: none;
    font-size: 3rem;
    font-weight: bold;
    color: #4299e1;
    margin-bottom: 1rem;
    font-family: 'Courier New', monospace;
    cursor: pointer;
}

.port-display:hover {
    opacity: 0.85;
}
</style>
