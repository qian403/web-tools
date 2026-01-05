<template>
    <div class="page-container">
        <!-- 回到首頁按鈕 -->
        <BackToHome />

        <div class="base-converter-container">
            
            <div class="header-section">
                <h2 class="title">進制轉換</h2>
                <p class="subtitle">支援二進位、八進位、十進位、十六進位即時互轉，輸入後自動轉換。</p>
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
                        <textarea 
                            id="desktop-left-input"
                            name="desktop-left-input"
                            v-model="leftValue" 
                            :placeholder="getPlaceholder(leftBase)"
                            @input="convertFromLeft"
                            :maxlength="maxInputLength"
                            class="conversion-input"
                            rows="3"
                            spellcheck="false"
                            ref="leftTextarea"
                        ></textarea>
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
                        <textarea 
                            id="desktop-right-input"
                            name="desktop-right-input"
                            v-model="rightValue" 
                            :placeholder="getPlaceholder(rightBase)"
                            @input="convertFromRight"
                            :maxlength="maxInputLength"
                            class="conversion-input"
                            rows="3"
                            spellcheck="false"
                            ref="rightTextarea"
                        ></textarea>
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
                        <textarea 
                            id="mobile-left-input"
                            name="mobile-left-input"
                            v-model="leftValue" 
                            :placeholder="getPlaceholder(leftBase)"
                            @input="convertFromLeft"
                            :maxlength="maxInputLength"
                            class="mobile-conversion-input"
                            rows="3"
                            spellcheck="false"
                            ref="mobileLeftTextarea"
                        ></textarea>
                    </div>
                </div>
                


                <div class="mobile-result-section">
                    <div class="mobile-result-container" ref="mobileResultContainer">
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
    2: /^[01]+(\.[01]+)?$/,
    8: /^[0-7]+(\.[0-7]+)?$/,
    10: /^\d+(\.\d+)?$/,
    16: /^[0-9A-F]+(\.[0-9A-F]+)?$/
}

const PLACEHOLDERS = {
    2: '例如：1010.101',
    8: '例如：777.5',
    10: '例如：255.75',
    16: '例如：FF.A'
}

const TEXTAREA_ADJUST_CONFIG = {
    leftTextarea: { maxHeight: 260 },
    rightTextarea: { maxHeight: 260 },
    mobileLeftTextarea: { maxHeight: 160 }
}

const MOBILE_RESULT_HEIGHT = {
    base: 110,
    max: 200
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
            maxInputLength: 100,
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
    watch: {
        leftValue() {
            this.adjustTextareaHeight('leftTextarea', TEXTAREA_ADJUST_CONFIG.leftTextarea)
            this.adjustTextareaHeight('mobileLeftTextarea', TEXTAREA_ADJUST_CONFIG.mobileLeftTextarea)
        },
        rightValue() {
            this.adjustTextareaHeight('rightTextarea', TEXTAREA_ADJUST_CONFIG.rightTextarea)
            this.adjustMobileResultHeight()
        }
    },
    methods: {
        getPlaceholder(base) {
            return PLACEHOLDERS[base] || '輸入數值'
        },

        getAvailableBases() {
            return this.baseOptions
        },

        adjustTextareaHeight(refName, options = {}) {
            const { maxHeight = null } = options
            this.$nextTick(() => {
                const ref = this.$refs[refName]
                if (!ref) return

                const elements = Array.isArray(ref) ? ref : [ref]
                elements.forEach((textarea) => {
                    if (!textarea) return
                    textarea.style.height = 'auto'
                    const scrollHeight = textarea.scrollHeight
                    let newHeight = scrollHeight
                    let shouldScroll = false

                    if (maxHeight && scrollHeight > maxHeight) {
                        newHeight = maxHeight
                        shouldScroll = true
                    }

                    textarea.style.height = `${newHeight}px`
                    textarea.style.overflowY = shouldScroll ? 'auto' : 'hidden'
                })
            })
        },

        adjustAllTextareas() {
            Object.keys(TEXTAREA_ADJUST_CONFIG).forEach(refName => {
                this.adjustTextareaHeight(refName, TEXTAREA_ADJUST_CONFIG[refName])
            })
            this.adjustMobileResultHeight()
        },

        adjustMobileResultHeight() {
            this.$nextTick(() => {
                const container = this.$refs.mobileResultContainer
                if (!container) return

                const { base, max } = MOBILE_RESULT_HEIGHT
                const previousOverflow = container.style.overflowY

                container.style.height = `${base}px`
                const scrollHeight = container.scrollHeight

                if (scrollHeight <= base) {
                    container.style.height = `${base}px`
                    container.style.overflowY = 'hidden'
                    return
                }

                const targetHeight = Math.min(scrollHeight, max)
                container.style.height = `${targetHeight}px`
                container.style.overflowY = scrollHeight > max ? 'auto' : 'hidden'

                if (previousOverflow !== container.style.overflowY && container.style.overflowY === 'auto') {
                    container.scrollTop = 0
                }
            })
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
            this.adjustTextareaHeight('leftTextarea', TEXTAREA_ADJUST_CONFIG.leftTextarea)
            this.adjustTextareaHeight('mobileLeftTextarea', TEXTAREA_ADJUST_CONFIG.mobileLeftTextarea)
            this.adjustMobileResultHeight()
        },

        convertFromRight() {
            this.initDebouncedConversion()
            this.debouncedConversion('right')
            this.adjustTextareaHeight('rightTextarea', TEXTAREA_ADJUST_CONFIG.rightTextarea)
            this.adjustMobileResultHeight()
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

            // 小數點轉換
            if (cleanValue.includes('.')) {
                const [integerPart, fractionalPart] = cleanValue.split('.')
                
                const integerDecimal = parseInt(integerPart, fromBase)
                
                let fractionalDecimal = 0
                if (fractionalPart) {
                    for (let i = 0; i < fractionalPart.length; i++) {
                        const digit = parseInt(fractionalPart[i], fromBase)
                        fractionalDecimal += digit / Math.pow(fromBase, i + 1)
                    }
                }
                
                return integerDecimal + fractionalDecimal
            } else {
                return parseInt(cleanValue, fromBase)
            }
        },

        convertFromDecimal(decimalValue, toBase) {
            if (decimalValue === 0) return '0'
            
            const isNegative = decimalValue < 0
            const absValue = Math.abs(decimalValue)
            
            const integerPart = Math.floor(absValue)
            const fractionalPart = absValue - integerPart
            
            let integerResult = ''
            let value = integerPart
            
            if (value === 0) {
                integerResult = '0'
            } else {
                while (value > 0) {
                    const remainder = value % toBase
                    if (toBase === 16) {
                        integerResult = (remainder < 10 ? remainder.toString() : String.fromCharCode(65 + remainder - 10)) + integerResult
                    } else {
                        integerResult = remainder.toString() + integerResult
                    }
                    value = Math.floor(value / toBase)
                }
            }
            
            let fractionalResult = ''
            if (fractionalPart > 0) {
                let frac = fractionalPart
                let precision = 0
                const maxPrecision = 50
                
                while (frac > 0 && precision < maxPrecision) {
                    frac *= toBase
                    const digit = Math.floor(frac)
                    if (toBase === 16) {
                        fractionalResult += (digit < 10 ? digit.toString() : String.fromCharCode(65 + digit - 10))
                    } else {
                        fractionalResult += digit.toString()
                    }
                    frac -= digit
                    precision++
                }
            }
            
            let result = integerResult
            if (fractionalResult) {
                result += '.' + fractionalResult
            }
            
            return isNegative ? '-' + result : result
        }
    },
    mounted() {
        this.initDebouncedConversion()
        this.adjustAllTextareas()
        this.adjustMobileResultHeight()
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

.subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin: 0;
}



.conversion-interface {
    display: flex;
    align-items: stretch;
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
    resize: none;
    overflow-y: hidden;
    overflow-wrap: anywhere;
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
    align-self: stretch;
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
        justify-content: flex-end;
        padding-top: 8vh;
        padding-bottom: 16vh;
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
        width: min(92vw, 260px);
        margin: 0 auto;
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
        margin: 0 auto;
    }
    
    .mobile-conversion-input {
        width: 100%;
        padding: 12px 14px;
        border: 2px solid var(--bg-light);
        border-radius: var(--border-radius);
        background-color: var(--bg-dark);
        color: white;
        font-size: 1.2rem;
        font-family: 'Courier New', monospace;
        box-sizing: border-box;
        min-height: 48px;
        line-height: 1.4;
        resize: none;
        overflow-y: hidden;
        overflow-wrap: anywhere;
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
        height: 110px;
        min-height: 110px;
        max-height: 200px;
        display: flex;
        align-items: flex-start;
        line-height: 1.4;
        box-sizing: border-box;
        overflow-y: hidden;
    }

    .mobile-result-value {
        color: white;
        font-size: 1.2rem;
        font-family: 'Courier New', monospace;
        word-break: break-all;
        width: 100%;
        white-space: pre-wrap;
    }
}

@media (max-width: 480px) {
    .base-converter-container {
        padding: 8px 10px;
        padding-top: 6vh;
        padding-bottom: 18vh;
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
        padding: 12px 14px;
        min-height: 48px;
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
        padding-top: 5vh;
        padding-bottom: 16vh;
    }
    
    .title {
        font-size: 1.2rem;
        margin-bottom: 0.4rem;
    }
    
    .mobile-conversion-input {
        padding: 10px 12px;
        font-size: 15px;
        min-height: 46px;
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
