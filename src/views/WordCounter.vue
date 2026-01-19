<template>
    <div class="page-container">
        <BackToHome />

        <main class="tool-container">
            <h1 class="tool-title">字數統計</h1>
            <p class="tool-description">即時統計中英文字數、字元數、標點符號等詳細數據。</p>

            <div class="main-content">
                <div class="input-section">
                    <textarea
                        id="input-text"
                        name="inputText"
                        v-model="inputText"
                        placeholder="請輸入或貼上要統計的文字..."
                        class="text-input"
                        rows="12"
                    ></textarea>
                    <div class="quick-actions">
                        <Button variant="secondary" size="small" @click="clearText" :disabled="!inputText">
                            清除
                        </Button>
                        <Button variant="secondary" size="small" @click="pasteText">
                            貼上
                        </Button>
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-grid">
                        <div class="stat-card primary">
                            <div class="stat-value">{{ stats.totalChars }}</div>
                            <div class="stat-label">總字元數</div>
                        </div>
                        <div class="stat-card primary">
                            <div class="stat-value">{{ stats.totalCharsNoSpace }}</div>
                            <div class="stat-label">字元數（不含空白）</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.chineseChars }}</div>
                            <div class="stat-label">中文字</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.englishWords }}</div>
                            <div class="stat-label">英文單字</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.englishChars }}</div>
                            <div class="stat-label">英文字母</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.numbers }}</div>
                            <div class="stat-label">數字</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.punctuation }}</div>
                            <div class="stat-label">標點符號</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.spaces }}</div>
                            <div class="stat-label">空白字元</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.lines }}</div>
                            <div class="stat-label">行數</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.paragraphs }}</div>
                            <div class="stat-label">段落數</div>
                        </div>
                    </div>

                    <div class="stats-detail">
                        <h3>扣除標點符號</h3>
                        <div class="detail-row">
                            <span>中文字數：</span>
                            <strong>{{ stats.chineseChars }}</strong>
                        </div>
                        <div class="detail-row">
                            <span>英文字母數：</span>
                            <strong>{{ stats.englishChars }}</strong>
                        </div>
                        <div class="detail-row">
                            <span>中英文合計：</span>
                            <strong>{{ stats.chineseChars + stats.englishChars }}</strong>
                        </div>
                        <div class="detail-row">
                            <span>純文字（不含空白標點）：</span>
                            <strong>{{ stats.pureText }}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { computed, ref } from 'vue'
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'WordCounter',
    components: {
        BackToHome,
        Button
    },
    setup() {
        const inputText = ref('')

        const stats = computed(() => {
            const text = inputText.value

            // 總字元數
            const totalChars = text.length

            // 空白字元（空格、tab、換行）
            const spaces = (text.match(/\s/g) || []).length

            // 不含空白的字元數
            const totalCharsNoSpace = totalChars - spaces

            // 中文字（包含繁簡體）
            const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

            // 英文字母
            const englishChars = (text.match(/[a-zA-Z]/g) || []).length

            // 英文單字
            const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

            // 數字
            const numbers = (text.match(/[0-9]/g) || []).length

            // 標點符號（中英文標點）
            const punctuation = (text.match(/[，。、；：？！""''（）【】《》〈〉「」『』…—～·,.;:?!'"()[\]{}<>@#$%^&*_+=|/\\`~-]/g) || []).length

            // 行數
            const lines = text ? text.split('\n').length : 0

            // 段落數（以空行分隔）
            const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0

            // 純文字（不含空白和標點）
            const pureText = chineseChars + englishChars + numbers

            return {
                totalChars,
                totalCharsNoSpace,
                chineseChars,
                englishChars,
                englishWords,
                numbers,
                punctuation,
                spaces,
                lines,
                paragraphs,
                pureText
            }
        })

        const clearText = () => {
            inputText.value = ''
        }

        const pasteText = async () => {
            try {
                const text = await navigator.clipboard.readText()
                inputText.value = text
            } catch {
                // 剪貼簿存取失敗
            }
        }

        return {
            inputText,
            stats,
            clearText,
            pasteText
        }
    }
}
</script>

<style scoped>
.tool-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 60px 20px 20px;
    max-width: 1000px;
    margin: 0 auto;
    box-sizing: border-box;
}

.tool-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    text-align: center;
}

.tool-description {
    color: #a0aec0;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    flex: 1;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    min-height: 300px;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.3s;
    flex: 1;
}

.text-input:focus {
    outline: none;
    border-color: #4299e1;
}

.text-input::placeholder {
    color: #718096;
}

.quick-actions {
    display: flex;
    gap: 0.5rem;
}

.stats-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.stat-card {
    background-color: #1a202c;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
}

.stat-card.primary {
    background-color: #2b6cb0;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
}

.stat-label {
    font-size: 0.8rem;
    color: #a0aec0;
    margin-top: 0.25rem;
}

.stat-card.primary .stat-label {
    color: #bee3f8;
}

.stats-detail {
    background-color: #1a202c;
    border-radius: 8px;
    padding: 1rem;
}

.stats-detail h3 {
    font-size: 0.9rem;
    color: #a0aec0;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #4a5568;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    font-size: 0.9rem;
}

.detail-row span {
    color: #a0aec0;
}

.detail-row strong {
    color: white;
}

@media (max-width: 768px) {
    .tool-container {
        padding: 70px 15px 30px;
    }

    .main-content {
        grid-template-columns: 1fr;
    }

    .text-input {
        min-height: 200px;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
