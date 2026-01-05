<template>
    <div class="page-container">
        <BackToHome />

        <div class="tool-container">
            <h2 class="tool-title">繁簡轉換</h2>

            <div class="main-content">
                <div class="input-section">
                    <textarea
                        id="input-text"
                        name="inputText"
                        v-model="inputText"
                        placeholder="請輸入要轉換的文字..."
                        class="text-input"
                        rows="10"
                    ></textarea>
                </div>

                <div class="button-group">
                    <Button variant="primary" @click="toSimplified">
                        繁體 → 簡體
                    </Button>
                    <Button variant="primary" @click="toTraditional">
                        簡體 → 繁體
                    </Button>
                    <Button variant="secondary" @click="copyText" :disabled="!inputText.trim()">
                        複製
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as OpenCC from 'opencc-js'
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'ChineseConverter',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            inputText: '',
            converterToSimplified: null,
            converterToTraditional: null
        }
    },
    mounted() {
        this.converterToSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' })
        this.converterToTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' })
    },
    methods: {
        toSimplified() {
            if (!this.inputText.trim()) return
            this.inputText = this.converterToSimplified(this.inputText)
        },
        toTraditional() {
            if (!this.inputText.trim()) return
            this.inputText = this.converterToTraditional(this.inputText)
        },
        copyText() {
            if (!this.inputText.trim()) return
            navigator.clipboard.writeText(this.inputText)
                .then(() => this.showToast('已複製到剪貼簿', 'success'))
                .catch(() => this.showToast('複製失敗', 'error'))
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
                setTimeout(() => toast.parentNode?.removeChild(toast), 300)
            }, 3000)
        }
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
    max-width: 600px;
    margin: 0 auto;
    box-sizing: border-box;
}

.tool-title {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
    text-align: center;
}

.main-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.text-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 1rem;
    resize: vertical;
    min-height: 200px;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.3s;
}

.text-input:focus {
    outline: none;
    border-color: #4299e1;
}

.text-input::placeholder {
    color: #718096;
}

.button-group {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

@media (max-width: 768px) {
    .tool-container {
        height: auto;
        min-height: 100vh;
        padding: 70px 15px 30px;
        justify-content: flex-start;
    }

    .button-group {
        flex-direction: column;
    }

    .button-group button {
        width: 100%;
    }
}
</style>
