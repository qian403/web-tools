<template>
    <div class="page-container">
        <BackToHome />

        <main class="tool-container">
            <h1 class="tool-title">正則表達式測試</h1>
            <p class="tool-description">即時測試正則表達式，支援 flags 設定與匹配結果高亮顯示。</p>

            <div class="main-content">
                <div class="left-panel">
                    <div class="regex-input-group">
                        <label for="regex-input" class="form-label">正則表達式</label>
                        <div class="regex-wrapper">
                            <span class="regex-delimiter">/</span>
                            <input
                                type="text"
                                id="regex-input"
                                name="regexInput"
                                v-model="regexPattern"
                                placeholder="輸入正則表達式..."
                                class="regex-input"
                            />
                            <span class="regex-delimiter">/</span>
                            <input
                                type="text"
                                id="flags-input"
                                name="flagsInput"
                                v-model="flags"
                                placeholder="gi"
                                class="flags-input"
                                maxlength="6"
                            />
                        </div>
                        <div v-if="regexErrorMsg" class="error-message">{{ regexErrorMsg }}</div>
                    </div>

                    <div class="flags-options">
                        <label class="flag-option" :class="{ active: flagG }">
                            <input type="checkbox" v-model="flagG" /> 
                            <span>g</span> 全域
                        </label>
                        <label class="flag-option" :class="{ active: flagI }">
                            <input type="checkbox" v-model="flagI" /> 
                            <span>i</span> 不分大小寫
                        </label>
                        <label class="flag-option" :class="{ active: flagM }">
                            <input type="checkbox" v-model="flagM" /> 
                            <span>m</span> 多行
                        </label>
                    </div>

                    <div class="test-input-group">
                        <label for="test-input" class="form-label">測試文字</label>
                        <textarea
                            id="test-input"
                            name="testInput"
                            v-model="testString"
                            placeholder="輸入要測試的文字..."
                            class="test-input"
                            rows="10"
                        ></textarea>
                    </div>

                    <div class="quick-patterns">
                        <div class="pattern-label">常用範例</div>
                        <div class="pattern-list">
                            <button @click="applyPattern('\\d+', 'g')" class="pattern-btn">數字</button>
                            <button @click="applyPattern('[a-zA-Z]+', 'g')" class="pattern-btn">英文</button>
                            <button @click="applyPattern('[\\u4e00-\\u9fff]+', 'g')" class="pattern-btn">中文</button>
                            <button @click="applyPattern('[\\w.-]+@[\\w.-]+\\.\\w+', 'gi')" class="pattern-btn">Email</button>
                            <button @click="applyPattern('https?://[^\\s]+', 'gi')" class="pattern-btn">URL</button>
                            <button @click="applyPattern('09\\d{2}-?\\d{3}-?\\d{3}', 'g')" class="pattern-btn">台灣手機</button>
                        </div>
                    </div>
                </div>

                <div class="right-panel">
                    <div class="result-header">
                        <span class="result-title">匹配結果</span>
                        <span class="match-count" :class="{ 'has-match': matches.length > 0 }">
                            {{ matches.length }} 個匹配
                        </span>
                    </div>

                    <div class="highlighted-text" v-html="highlightedText"></div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import BackToHome from '@/components/BackToHome.vue'

// 工具函數放在 setup 外部，避免每次渲染重新創建
const escapeHtml = (str) => {
    if (!str) return ''
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
}

export default {
    name: 'RegexTester',
    components: {
        BackToHome
    },
    setup() {
        const regexPattern = ref('')
        const testString = ref('')
        const flags = ref('g')

        const flagG = ref(true)
        const flagI = ref(false)
        const flagM = ref(false)

        // 使用 immediate: false 避免初始化時重複觸發
        watch([flagG, flagI, flagM], () => {
            let f = ''
            if (flagG.value) f += 'g'
            if (flagI.value) f += 'i'
            if (flagM.value) f += 'm'
            flags.value = f
        })

        watch(flags, (newFlags) => {
            flagG.value = newFlags.includes('g')
            flagI.value = newFlags.includes('i')
            flagM.value = newFlags.includes('m')
        })

        // 合併 regex 驗證與錯誤訊息，避免重複創建 RegExp
        const regexResult = computed(() => {
            if (!regexPattern.value) {
                return { regex: null, error: '' }
            }
            try {
                const regex = new RegExp(regexPattern.value, flags.value)
                return { regex, error: '' }
            } catch (e) {
                const msg = e.message
                let error = '正則表達式語法錯誤'
                if (msg.includes('at end of pattern')) error = '正則表達式不完整'
                else if (msg.includes('Unterminated character class')) error = '字元類別未閉合，缺少 ]'
                else if (msg.includes('Unterminated group')) error = '群組未閉合，缺少 )'
                else if (msg.includes('Invalid group')) error = '無效的群組語法'
                else if (msg.includes('Nothing to repeat')) error = '量詞前缺少內容'
                else if (msg.includes('Invalid escape')) error = '無效的跳脫字元'
                return { regex: null, error }
            }
        })

        const regexErrorMsg = computed(() => regexResult.value.error)

        const matches = computed(() => {
            const { regex } = regexResult.value
            if (!regex || !testString.value) return []
            
            const results = []
            // 確保有 g flag 才能正確迭代所有匹配
            const globalFlags = flags.value.includes('g') ? flags.value : flags.value + 'g'
            const r = new RegExp(regexPattern.value, globalFlags)
            
            let match
            // 防止無限迴圈（空字串匹配）
            let lastIndex = -1
            while ((match = r.exec(testString.value)) !== null) {
                if (r.lastIndex === lastIndex) {
                    r.lastIndex++
                    continue
                }
                lastIndex = r.lastIndex
                
                results.push({
                    value: match[0],
                    index: match.index
                })
                if (!flags.value.includes('g')) break
                // 限制最大匹配數量，防止性能問題
                if (results.length >= 1000) break
            }
            
            return results
        })

        const highlightedText = computed(() => {
            if (!testString.value) {
                return '<span class="placeholder">匹配結果將顯示在這裡</span>'
            }
            
            const matchList = matches.value
            if (!regexResult.value.regex || matchList.length === 0) {
                return escapeHtml(testString.value)
            }

            let result = ''
            let lastIndex = 0
            
            for (const match of matchList) {
                result += escapeHtml(testString.value.slice(lastIndex, match.index))
                result += `<mark>${escapeHtml(match.value)}</mark>`
                lastIndex = match.index + match.value.length
            }
            result += escapeHtml(testString.value.slice(lastIndex))
            
            return result
        })

        const applyPattern = (pattern, f) => {
            regexPattern.value = pattern
            flags.value = f
        }

        return {
            regexPattern,
            testString,
            flags,
            regexErrorMsg,
            flagG,
            flagI,
            flagM,
            matches,
            highlightedText,
            applyPattern
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
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #e2e8f0;
}

.regex-input-group {
    margin-bottom: 1rem;
}

.regex-wrapper {
    display: flex;
    align-items: center;
    background-color: #1a202c;
    border: 2px solid #4a5568;
    border-radius: 8px;
    padding: 0 12px;
    transition: border-color 0.3s;
}

.regex-wrapper:focus-within {
    border-color: #4299e1;
}

.regex-delimiter {
    color: #718096;
    font-size: 1.1rem;
    font-family: monospace;
}

.regex-input {
    flex: 1;
    padding: 10px 8px;
    border: none;
    background: transparent;
    color: #68d391;
    font-size: 1rem;
    font-family: monospace;
    outline: none;
}

.flags-input {
    width: 40px;
    padding: 10px 4px;
    border: none;
    background: transparent;
    color: #f6ad55;
    font-size: 1rem;
    font-family: monospace;
    outline: none;
    text-align: center;
}

.error-message {
    color: #1a202c;
    background-color: #feb2b2;
    font-size: 0.85rem;
    font-weight: bold;
    margin-top: 0.5rem;
    padding: 8px 12px;
    border-radius: 6px;
}

.flags-options {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.flag-option {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #718096;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
}

.flag-option.active {
    background-color: rgba(66, 153, 225, 0.2);
    color: #e2e8f0;
}

.flag-option span {
    color: #f6ad55;
    font-family: monospace;
    font-weight: bold;
}

.flag-option input {
    display: none;
}

.test-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 150px;
    box-sizing: border-box;
    font-family: monospace;
    transition: border-color 0.3s;
    line-height: 1.5;
}

.test-input:focus {
    outline: none;
    border-color: #4299e1;
}

.quick-patterns {
    margin-top: 1.5rem;
}

.pattern-label {
    font-size: 0.85rem;
    color: #a0aec0;
    margin-bottom: 0.75rem;
}

.pattern-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.pattern-btn {
    padding: 6px 12px;
    border: 1px solid #4a5568;
    border-radius: 6px;
    background-color: transparent;
    color: #a0aec0;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.pattern-btn:hover {
    background-color: #4a5568;
    color: white;
    border-color: #4a5568;
}

.right-panel {
    background-color: #1a202c;
    border-radius: 8px;
    padding: 1rem;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #4a5568;
}

.result-title {
    font-size: 0.9rem;
    color: #e2e8f0;
}

.match-count {
    font-size: 0.85rem;
    color: #718096;
}

.match-count.has-match {
    color: #68d391;
    font-weight: bold;
}

.highlighted-text {
    background-color: #2d3748;
    padding: 1rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-break: break-all;
    min-height: 80px;
    max-height: 200px;
    overflow-y: auto;
    line-height: 1.6;
}

.highlighted-text :deep(mark) {
    background-color: #ecc94b;
    color: #1a202c;
    padding: 1px 3px;
    border-radius: 3px;
    font-weight: 500;
}

.highlighted-text :deep(.placeholder) {
    color: #718096;
    font-style: italic;
}

@media (max-width: 768px) {
    .tool-container {
        padding: 70px 15px 30px;
    }

    .main-content {
        grid-template-columns: 1fr;
    }

    .flags-options {
        gap: 0.5rem;
    }

    .flag-option {
        font-size: 0.8rem;
    }

    .test-input {
        min-height: 120px;
    }

    .highlighted-text {
        max-height: 150px;
    }
}
</style>
