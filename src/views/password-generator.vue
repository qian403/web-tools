<template>
    <div class="page-container">
        <!-- 回到首頁按鈕 -->
        <BackToHome />

        <div class="tool-container">
            <h2 class="tool-title">隨機密碼產生器</h2>

            <!-- 密碼長度滑桿 -->
            <div class="form-group">
                <label for="length" class="form-label">密碼長度：{{ passwordLength }}</label>
                <input 
                    type="range" 
                    id="length" 
                    name="passwordLength"
                    v-model="passwordLength" 
                    min="1" 
                    max="64" 
                    aria-label="密碼長度滑桿"
                    aria-valuemin="1"
                    aria-valuemax="64"
                    :aria-valuenow="passwordLength"
                />
            </div>

            <!-- iOS 風格開關 -->
            <div class="switch-container">
                <div class="switch-item">
                    <label for="include-uppercase">包含大寫字母</label>
                    <label class="switch">
                        <input 
                            type="checkbox" 
                            id="include-uppercase" 
                            name="includeUppercase" 
                            v-model="includeUppercase"
                            aria-describedby="uppercase-desc"
                        />
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="switch-item">
                    <label for="include-numbers">包含數字</label>
                    <label class="switch">
                        <input 
                            type="checkbox" 
                            id="include-numbers" 
                            name="includeNumbers" 
                            v-model="includeNumbers"
                            aria-describedby="numbers-desc"
                        />
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="switch-item">
                    <label for="include-symbols">包含特殊符號</label>
                    <label class="switch">
                        <input 
                            type="checkbox" 
                            id="include-symbols" 
                            name="includeSymbols" 
                            v-model="includeSymbols"
                            aria-describedby="symbols-desc"
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>

            <!-- 產生密碼 & 顯示結果 -->
            <div class="button-container">
                <Button variant="primary" @click="generatePassword" aria-label="產生隨機密碼">產生密碼</Button>
            </div>
            <div v-if="generatedPassword" class="result">
                <p>產生的密碼：<strong>{{ generatedPassword }}</strong></p>
                <Button variant="success" size="small" @click="copyToClipboard" aria-label="複製密碼到剪貼簿">複製密碼</Button>
            </div>
        </div>
    </div>
</template>

<script>
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'RandomPasswordGenerator',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            passwordLength: 12,
            includeUppercase: true,
            includeNumbers: true,
            includeSymbols: true,
            generatedPassword: ''
        }
    },
    methods: {
        generatePassword() {
            let chars = 'abcdefghijklmnopqrstuvwxyz'

            if (this.includeUppercase) {
                chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            }
            if (this.includeNumbers) {
                chars += '0123456789'
            }
            if (this.includeSymbols) {
                chars += '!@#$%^&*()_+-=[]{}|;:,.<>/?'
            }

            let password = ''
            for (let i = 0; i < this.passwordLength; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            this.generatedPassword = password
        },
        copyToClipboard() {
            if (!this.generatedPassword) return
            navigator.clipboard.writeText(this.generatedPassword)
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

input[type="range"] {
    width: 200px;
    margin-top: var(--spacing-sm);
}

/* iOS 風格開關容器 */
.switch-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-start;
}

.switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 200px;
}

/* iOS 風格開關本體 */
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

/* 滑動條 */
.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
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

/* 開關選中時的樣式 */
.switch input:checked+.slider {
    background-color: #4299e1;
}

.switch input:checked+.slider:before {
    transform: translateX(16px);
}

.button-container {
    margin-bottom: 2rem;
}

/* 密碼結果顯示區 */
.result {
    text-align: center;
    background-color: var(--secondary-bg);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    margin-top: var(--spacing-lg);
}
</style>