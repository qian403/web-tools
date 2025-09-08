<template>
    <div class="page-container">
        <!-- 回到首頁按鈕 -->
        <BackToHome />

        <div class="base-converter-container">
            
            <div class="header-section">
                <h2 class="title">進制轉換</h2>
            </div>
            <div class="conversion-interface desktop-only">
                <div class="conversion-panel">
                    <div class="base-tabs">
                        <div 
                            v-for="base in baseOptions" 
                            :key="`left-${base.value}`"
                            :class="['tab', { active: leftBase === base.value }]"
                            @click="setLeftBase(base.value)"
                        >
                            {{ base.label }}
                        </div>
                    </div>
                    <div class="input-container">
                        <input 
                            type="text" 
                            id="desktop-left-input"
                            name="desktop-left-input"
                            v-model="leftValue" 
                            :placeholder="getPlaceholder(leftBase)"
                            @input="convertFromLeft"
                            :maxlength="maxInputLength"
                            class="conversion-input"
                        />
                    </div>
                </div>

                <div class="arrow-container">
                    <div class="arrow">⇌</div>
                </div>

                <div class="conversion-panel">
                    <div class="base-tabs">
                        <div 
                            v-for="base in baseOptions" 
                            :key="`right-${base.value}`"
                            :class="['tab', { active: rightBase === base.value }]"
                            @click="setRightBase(base.value)"
                        >
                            {{ base.label }}
                        </div>
                    </div>
                    <div class="input-container">
                        <input 
                            type="text" 
                            id="desktop-right-input"
                            name="desktop-right-input"
                            v-model="rightValue" 
                            :placeholder="getPlaceholder(rightBase)"
                            @input="convertFromRight"
                            :maxlength="maxInputLength"
                            class="conversion-input"
                        />
                    </div>
                </div>
            </div>

            <div class="mobile-conversion-interface mobile-only">
                <div class="mobile-base-selectors">
                    <div class="mobile-base-selector">
                        <select v-model="leftBase" @change="handleLeftBaseChange" id="mobile-left-base" name="mobile-left-base" class="base-select">
                            <option v-for="base in getAvailableBases('left')" :key="base.value" :value="base.value">
                                {{ base.label }}
                            </option>
                        </select>
                    </div>
                    


                    <div class="mobile-base-selector">
                        <select v-model="rightBase" @change="handleRightBaseChange" id="mobile-right-base" name="mobile-right-base" class="base-select">
                            <option v-for="base in getAvailableBases('right')" :key="base.value" :value="base.value">
                                {{ base.label }}
                            </option>
                        </select>
                    </div>
                </div>
                
                
                <div class="mobile-input-section">
                    <div class="mobile-input-container">
                        <input 
                            type="text" 
                            id="mobile-left-input"
                            name="mobile-left-input"
                            v-model="leftValue" 
                            :placeholder="getPlaceholder(leftBase)"
                            @input="convertFromLeft"
                            :maxlength="maxInputLength"
                            class="mobile-conversion-input"
                        />
                    </div>
                </div>



                <div class="mobile-result-section">
                    <div class="mobile-result-container">
                        <div class="mobile-result-value">{{ rightValue || '&nbsp;' }}</div>
                    </div>
                </div>
            </div>

            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<script>
import BackToHome from '@/components/BackToHome.vue'

const BASE_OPTIONS = [
    { value: 10, label: '十進位' },
    { value: 16, label: '十六進位' },
    { value: 8, label: '八進位' },
    { value: 2, label: '二進位' }
]

const ERROR_MESSAGES = {
    INVALID_FORMAT: '請輸入有效的數值格式',
    VALUE_TOO_LARGE: '數值過大，請輸入較小的數值',
    LENGTH_EXCEEDED: '輸入長度超過限制',
    BINARY_INVALID: '二進制只能包含 0 和 1',
    OCTAL_INVALID: '八進制只能包含 0-7',
    DECIMAL_INVALID: '十進制只能包含數字',
    HEX_INVALID: '十六進制只能包含 0-9 和 A-F'
}

const VALIDATION_PATTERNS = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^\d+$/,
    16: /^[0-9A-F]+$/
}

const PLACEHOLDERS = {
    2: '例如：1010',
    8: '例如：777',
    10: '例如：255',
    16: '例如：FF'
}

export default {
    name: 'BaseConverter',
    components: {
        BackToHome
    },
    data() {
        return {
            leftValue: '',
            rightValue: '',
            leftBase: 16,
            rightBase: 10,
            errorMessage: '',
            debounceTimer: null,
            debouncedConversion: null,
            maxInputLength: 20,
            baseOptions: BASE_OPTIONS
        }
    },
    computed: {
        convertedValue() {
            if (!this.leftValue.trim()) return ''
            
            try {
                const decimal = this.parseToDecimal(this.leftValue, this.leftBase)
                if (isNaN(decimal) || decimal > Number.MAX_SAFE_INTEGER) {
                    return ''
                }
                return this.convertFromDecimal(decimal, this.rightBase)
            } catch {
                return ''
            }
        },
        
        availableBases() {
            return this.baseOptions
        }
    },
    methods: {
        getPlaceholder(base) {
            return PLACEHOLDERS[base] || '輸入數值'
        },

        // 修復：添加回 getAvailableBases 方法
        getAvailableBases() {
            return this.baseOptions
        },

        
        setBase(side, base) {
            this[`${side}Base`] = base
            const otherSide = side === 'left' ? 'right' : 'left'
            if (this[`${otherSide}Base`] === base) {
                this[`${otherSide}Base`] = this.getAlternativeBase(base)
            }
            this.updateConversion()
        },

        setLeftBase(base) {
            this.setBase('left', base)
        },

        setRightBase(base) {
            this.setBase('right', base)
        },

        getAlternativeBase(currentBase) {
            const alternatives = this.baseOptions.filter(option => option.value !== currentBase)
            return alternatives[0].value
        },

        handleBaseChange(side) {
            const otherSide = side === 'left' ? 'right' : 'left'
            if (this[`${side}Base`] === this[`${otherSide}Base`]) {
                this[`${otherSide}Base`] = this.getAlternativeBase(this[`${side}Base`])
            }
            this.updateConversion()
        },

        handleLeftBaseChange() {
            this.handleBaseChange('left')
        },

        handleRightBaseChange() {
            this.handleBaseChange('right')
        },


        initDebouncedConversion() {
            if (!this.debouncedConversion) {
                this.debouncedConversion = this.debounce((direction) => {
                    this.performConversion(direction)
                }, 300)
            }
        },

        debounce(func, wait) {
            let timeout
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout)
                    func(...args)
                }
                clearTimeout(timeout)
                timeout = setTimeout(later, wait)
            }
        },

        convertFromLeft() {
            this.initDebouncedConversion()
            this.debouncedConversion('left')
        },

        convertFromRight() {
            this.initDebouncedConversion()
            this.debouncedConversion('right')
        },


        performConversion(direction) {
            this.errorMessage = ''
            
            const inputValue = direction === 'left' ? this.leftValue.trim() : this.rightValue.trim()
            const inputBase = direction === 'left' ? this.leftBase : this.rightBase
            const targetBase = direction === 'left' ? this.rightBase : this.leftBase
            
            if (!inputValue) {
                this.clearTargetValue(direction)
                return
            }

            if (inputValue.length > this.maxInputLength) {
                this.errorMessage = ERROR_MESSAGES.LENGTH_EXCEEDED
                this.clearTargetValue(direction)
                return
            }

            try {
                const decimalValue = this.parseToDecimal(inputValue, inputBase)
                
                if (isNaN(decimalValue)) {
                    throw new Error(ERROR_MESSAGES.INVALID_FORMAT)
                }

                if (decimalValue > Number.MAX_SAFE_INTEGER) {
                    throw new Error(ERROR_MESSAGES.VALUE_TOO_LARGE)
                }

                const result = this.convertFromDecimal(decimalValue, targetBase)
                this.setTargetValue(direction, result)
                
            } catch (error) {
                this.handleConversionError(error, direction)
            }
        },

        clearTargetValue(direction) {
            if (direction === 'left') {
                this.rightValue = ''
            } else {
                this.leftValue = ''
            }
        },

        setTargetValue(direction, value) {
            if (direction === 'left') {
                this.rightValue = value
            } else {
                this.leftValue = value
            }
        },



        handleConversionError(error, direction) {
            let errorMsg = ERROR_MESSAGES.INVALID_FORMAT
            
            if (error.message.includes('二進制')) {
                errorMsg = ERROR_MESSAGES.BINARY_INVALID
            } else if (error.message.includes('八進制')) {
                errorMsg = ERROR_MESSAGES.OCTAL_INVALID
            } else if (error.message.includes('十進制')) {
                errorMsg = ERROR_MESSAGES.DECIMAL_INVALID
            } else if (error.message.includes('十六進制')) {
                errorMsg = ERROR_MESSAGES.HEX_INVALID
            } else if (error.message.includes(ERROR_MESSAGES.VALUE_TOO_LARGE)) {
                errorMsg = ERROR_MESSAGES.VALUE_TOO_LARGE
            }
            
            this.errorMessage = errorMsg
            this.clearTargetValue(direction)
        },

        updateConversion() {
            if (this.leftValue.trim()) {
                this.convertFromLeft()
            } else if (this.rightValue.trim()) {
                this.convertFromRight()
            }
        },

        parseToDecimal(value, fromBase) {
            let cleanValue = value.toUpperCase()
            
            const prefixes = {
                16: '0X',
                2: '0B',
                8: '0O'
            }
            
            if (prefixes[fromBase] && cleanValue.startsWith(prefixes[fromBase])) {
                cleanValue = cleanValue.substring(2)
            }



            const pattern = VALIDATION_PATTERNS[fromBase]
            if (!pattern.test(cleanValue)) {
                const errorMessages = {
                    2: ERROR_MESSAGES.BINARY_INVALID,
                    8: ERROR_MESSAGES.OCTAL_INVALID,
                    10: ERROR_MESSAGES.DECIMAL_INVALID,
                    16: ERROR_MESSAGES.HEX_INVALID
                }
                throw new Error(errorMessages[fromBase])
            }

            return parseInt(cleanValue, fromBase)
        },

        convertFromDecimal(decimalValue, toBase) {
            if (decimalValue === 0) return '0'
            
            let result = ''
            let value = Math.abs(decimalValue)
            
            while (value > 0) {
                const remainder = value % toBase
                if (toBase === 16) {
                    result = (remainder < 10 ? remainder.toString() : String.fromCharCode(65 + remainder - 10)) + result
                } else {
                    result = remainder.toString() + result
                }
                value = Math.floor(value / toBase)
            }
            
            return result
        }
    },
    mounted() {
        this.initDebouncedConversion()
    },
    
    beforeUnmount() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }
        this.debouncedConversion = null
    }
}
</script>

<style scoped>
.page-container {
    --primary-color: #4299e1;
    --bg-dark: #1a202c;
    --bg-darker: #2d3748;
    --bg-light: #4a5568;
    --text-light: #e2e8f0;
    --text-muted: #a0aec0;
    --text-placeholder: #718096;
    --error-color: #e53e3e;
    --border-radius: 8px;
    --transition: all 0.3s ease;
    
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-darker);
    color: white;
    overflow: hidden;
}

.base-converter-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
    box-sizing: border-box;
}

.header-section {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text-light);
}



.conversion-interface {
    display: flex;
    align-items: center;
    gap: 2rem;
    width: 100%;
    max-width: 800px;
}

.conversion-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.base-tabs {
    display: flex;
    background-color: var(--bg-dark);
    border-radius: var(--border-radius);
    padding: 4px;
    gap: 4px;
}

.tab {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.9rem;
    color: var(--text-muted);
    transition: var(--transition);
    user-select: none;
}

.tab:hover {
    color: var(--text-light);
    background-color: var(--bg-darker);
}

.tab.active {
    color: white;
    background-color: var(--primary-color);
    font-weight: bold;
}

.input-container {
    position: relative;
}

.conversion-input {
    width: 100%;
    padding: 16px;
    border: 2px solid var(--bg-light);
    border-radius: var(--border-radius);
    background-color: var(--bg-dark);
    color: white;
    font-size: 1.2rem;
    font-family: 'Courier New', monospace;
    transition: border-color 0.3s;
    box-sizing: border-box;
    min-height: 60px;
    line-height: 1.4;
}

.conversion-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.conversion-input::placeholder {
    color: var(--text-placeholder);
    font-family: inherit;
}


.arrow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.arrow {
    font-size: 2rem;
    color: var(--primary-color);
    font-weight: bold;
    user-select: none;
}

.error-message {
    background-color: var(--error-color);
    color: white;
    padding: 1rem;
    border-radius: var(--border-radius);
    text-align: center;
    margin-top: 1rem;
    max-width: 600px;
    font-size: 0.9rem;
}


.desktop-only {
    display: flex;
}

.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .page-container {
        overflow: auto;
    }
    
    .desktop-only {
        display: none;
    }
    
    .mobile-only {
        display: block;
    }
    
    .base-converter-container {
        padding: 10px 15px;
        min-height: 100vh;
        height: auto;
        justify-content: center;
        padding-top: 20vh;
        padding-bottom: 10vh;
    }
    
    .header-section {
        margin-bottom: 1rem;
    }
    
    .title {
        font-size: 1.5rem;
        margin-bottom: 0.3rem;
    }
    
    /* 移動端界面樣式 */
    .mobile-conversion-interface {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        max-width: 100%;
    }
    
    /* 進制選擇區域 */
    .mobile-base-selectors {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
    }
    
    .mobile-base-selector {
        flex: 1;
    }
    
    .base-select {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--bg-light);
        border-radius: var(--border-radius);
        background-color: var(--bg-dark);
        color: white;
        font-size: 1rem;
        cursor: pointer;
        box-sizing: border-box;
    }
    
    .base-select:focus {
        outline: none;
        border-color: var(--primary-color);
    }
    
    
    .mobile-input-section,
    .mobile-result-section {
        width: 100%;
    }
    
    .mobile-input-container,
    .mobile-result-container {
        width: 100%;
        box-sizing: border-box;
    }
    
    .mobile-conversion-input {
        width: 100%;
        padding: 16px;
        border: 2px solid var(--bg-light);
        border-radius: var(--border-radius);
        background-color: var(--bg-dark);
        color: white;
        font-size: 1.2rem;
        font-family: 'Courier New', monospace;
        box-sizing: border-box;
        height: 60px;
        line-height: 1.4;
    }
    
    .mobile-conversion-input:focus {
        outline: none;
        border-color: var(--primary-color);
    }
    
    .mobile-conversion-input::placeholder {
        color: var(--text-placeholder);
        font-family: inherit;
    }
    
    .mobile-result-container {
        padding: 16px;
        border: 2px solid var(--bg-light);
        border-radius: var(--border-radius);
        background-color: var(--bg-darker);
        height: 60px;
        display: flex;
        align-items: center;
        line-height: 1.4;
        box-sizing: border-box;
    }
    
    .mobile-result-value {
        color: white;
        font-size: 1.2rem;
        font-family: 'Courier New', monospace;
        word-break: break-all;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .base-converter-container {
        padding: 8px 10px;
        padding-top: 15vh;
        padding-bottom: 8vh;
    }
    
    .title {
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
    }
    
    .mobile-conversion-interface {
        gap: 0.6rem;
    }
    
    .mobile-conversion-input {
        font-size: 16px; 
        padding: 14px;
        height: 60px;
    }
    
    .base-select {
        font-size: 16px; /* 防止 iOS 縮放 */
        padding: 12px;
        min-height: 44px; 
    }
    
    .mobile-result-value {
        font-size: 1.1rem;
    }
}

@media (max-width: 360px) {
    .base-converter-container {
        padding: 6px 8px;
        padding-top: 12vh;
        padding-bottom: 6vh;
    }
    
    .title {
        font-size: 1.2rem;
        margin-bottom: 0.4rem;
    }
    
    .mobile-conversion-input {
        padding: 12px;
        font-size: 15px;
        height: 60px;
    }
    
    .base-select {
        padding: 10px;
        font-size: 15px;
    }
    
    .mobile-result-value {
        font-size: 1rem;
    }
}
</style>
