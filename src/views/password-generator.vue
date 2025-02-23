<template>
    <div class="page-container">
        <!-- 回到首頁按鈕 -->
        <div class="back-button" @click="goBack">回到首頁</div>

        <div class="password-generator-container">
            <h2 class="title">隨機密碼產生器</h2>

            <!-- 密碼長度滑桿 -->
            <div class="slider-container">
                <label for="length">密碼長度：{{ passwordLength }}</label>
                <input type="range" id="length" v-model="passwordLength" min="1" max="64" />
            </div>

            <!-- iOS 風格開關 -->
            <div class="switch-container">
                <div class="switch-item">
                    <label>包含大寫字母</label>
                    <label class="switch">
                        <input type="checkbox" v-model="includeUppercase" />
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="switch-item">
                    <label>包含數字</label>
                    <label class="switch">
                        <input type="checkbox" v-model="includeNumbers" />
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="switch-item">
                    <label>包含特殊符號</label>
                    <label class="switch">
                        <input type="checkbox" v-model="includeSymbols" />
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>

            <!-- 產生密碼 & 顯示結果 -->
            <button class="generate-btn" @click="generatePassword">產生密碼</button>
            <div v-if="generatedPassword" class="result">
                <p>產生的密碼：<strong>{{ generatedPassword }}</strong></p>
                <button class="copy-btn" @click="copyToClipboard">複製密碼</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RandomPasswordGenerator',
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
        goBack() {
            // 回到首頁
            this.$router.push('/')
        },
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
                    alert('已複製到剪貼簿！')
                })
                .catch(err => {
                    alert('複製失敗：' + err)
                })
        }
    }
}
</script>

<style scoped>
/* 與 Clock.vue 相同的背景、佈局風格 */
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #2d3748;
    color: white;
}

/* 回到首頁按鈕，同 Clock.vue */
.back-button {
    position: fixed;
    top: min(20px, 3vh);
    left: min(20px, 3vw);
    padding: min(10px, 1.5vh) min(20px, 3vw);
    background-color: #4299e1;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.3s;
    font-size: min(16px, 2.5vh);
}

.back-button:hover {
    background-color: #3182ce;
}

/* 主要內容容器 */
.password-generator-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 20px;
}

.title {
    font-size: 2rem;
    margin-bottom: 1rem;
}

/* 密碼長度滑桿區域 */
.slider-container {
    margin-bottom: 1rem;
    text-align: center;
}

.slider-container label {
    display: block;
    margin-bottom: 0.5rem;
}

.slider-container input[type="range"] {
    width: 200px;
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

/* 產生密碼按鈕 */
.generate-btn {
    background-color: #4299e1;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    transition: background-color 0.3s;
    margin-bottom: 1rem;
}

.generate-btn:hover {
    background-color: #3182ce;
}

/* 密碼結果顯示區 */
.result {
    text-align: center;
    background-color: #1a202c;
    padding: 1rem;
    border-radius: 8px;
}

.copy-btn {
    background-color: #4caf50;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    margin-top: 0.5rem;
}

.copy-btn:hover {
    background-color: #43a047;
}
</style>