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
                        <div class="mobile-result-value">{{ rightValue }}</div>
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
            maxInputLength: 20, 
            baseOptions: [
                { value: 10, label: '十進位' },
                { value: 16, label: '十六進位' },
                { value: 8, label: '八進位' },
                { value: 2, label: '二進位' }
            ]
        }
    },
    methods: {
        getPlaceholder(base) {
            const placeholders = {
                2: '例如：1010',
                8: '例如：777',
                10: '例如：255',
                16: '例如：FF'
            }
            return placeholders[base] || '輸入數值'
        },



        setLeftBase(base) {
            this.leftBase = base
            if (this.rightBase === base) {
                this.rightBase = this.getAlternativeBase(base)
            }
            this.convertCurrentValue()
        },


        setRightBase(base) {
            this.rightBase = base
            if (this.leftBase === base) {
                this.leftBase = this.getAlternativeBase(base)
            }
            this.convertCurrentValue()
        },



        getAlternativeBase(currentBase) {
            const alternatives = this.baseOptions.filter(option => option.value !== currentBase)
            return alternatives[0].value
        },

        getAvailableBases(side) {
            if (side === 'left') {
                return this.baseOptions.filter(option => option.value !== this.rightBase)
            } else {
                return this.baseOptions.filter(option => option.value !== this.leftBase)
            }
        },

        handleLeftBaseChange() {
            if (this.leftBase === this.rightBase) {
                this.rightBase = this.getAlternativeBase(this.leftBase)
            }
            this.convertFromLeft()
        },

        handleRightBaseChange() {
            if (this.rightBase === this.leftBase) {
                this.leftBase = this.getAlternativeBase(this.rightBase)
            }
            this.convertFromLeft()
        },


        convertFromLeft() {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer)
            }
            
            this.debounceTimer = setTimeout(() => {
                this.performConversion('left')
            }, 300)
        },

        performConversion(direction) {
            this.errorMessage = ''
            
            const inputValue = direction === 'left' ? this.leftValue.trim() : this.rightValue.trim()
            const inputBase = direction === 'left' ? this.leftBase : this.rightBase
            const targetBase = direction === 'left' ? this.rightBase : this.leftBase
            
            if (!inputValue) {
                if (direction === 'left') {
                    this.rightValue = ''
                } else {
                    this.leftValue = ''
                }
                return
            }

            if (inputValue.length > this.maxInputLength) {
                this.errorMessage = '輸入長度超過限制'
                if (direction === 'left') {
                    this.rightValue = ''
                } else {
                    this.leftValue = ''
                }
                return
            }

            try {
                const decimalValue = this.parseToDecimal(inputValue, inputBase)
                
                if (isNaN(decimalValue)) {
                    throw new Error('無效的數值格式')
                }

                if (decimalValue > Number.MAX_SAFE_INTEGER) {
                    throw new Error('數值過大')
                }

                const result = this.convertFromDecimal(decimalValue, targetBase)
                
                if (direction === 'left') {
                    this.rightValue = result
                } else {
                    this.leftValue = result
                }
            } catch (error) {
                let errorMsg = '轉換失敗'
                if (error.message.includes('無效的數值格式')) {
                    errorMsg = '請輸入有效的數值格式'
                } else if (error.message.includes('數值過大')) {
                    errorMsg = '數值過大，請輸入較小的數值'
                } else if (error.message.includes('輸入長度超過限制')) {
                    errorMsg = '輸入長度超過限制'
                } else if (error.message.includes('二進制')) {
                    errorMsg = '二進制只能包含 0 和 1'
                } else if (error.message.includes('八進制')) {
                    errorMsg = '八進制只能包含 0-7'
                } else if (error.message.includes('十進制')) {
                    errorMsg = '十進制只能包含數字'
                } else if (error.message.includes('十六進制')) {
                    errorMsg = '十六進制只能包含 0-9 和 A-F'
                }
                
                this.errorMessage = errorMsg
                if (direction === 'left') {
                    this.rightValue = ''
                } else {
                    this.leftValue = ''
                }
            }
        },

        convertFromRight() {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer)
            }
            

            this.debounceTimer = setTimeout(() => {
                this.performConversion('right')
            }, 300)
        },

        convertCurrentValue() {
            if (this.leftValue.trim() && !this.rightValue.trim()) {
                this.performConversion('left')
            } else if (this.rightValue.trim() && !this.leftValue.trim()) {
                this.performConversion('right')
            } else if (this.leftValue.trim() && this.rightValue.trim()) {
                this.performConversion('left')
            }
        },

        parseToDecimal(value, fromBase) {
            let cleanValue = value.toUpperCase()
            
            if (fromBase === 16 && cleanValue.startsWith('0X')) {
                cleanValue = cleanValue.substring(2)
            } else if (fromBase === 2 && cleanValue.startsWith('0B')) {
                cleanValue = cleanValue.substring(2)
            } else if (fromBase === 8 && cleanValue.startsWith('0O')) {
                cleanValue = cleanValue.substring(2)
            }

            if (fromBase === 2 && !/^[01]+$/.test(cleanValue)) {
                throw new Error('二進制只能包含 0 和 1')
            } else if (fromBase === 8 && !/^[0-7]+$/.test(cleanValue)) {
                throw new Error('八進制只能包含 0-7')
            } else if (fromBase === 10 && !/^\d+$/.test(cleanValue)) {
                throw new Error('十進制只能包含數字')
            } else if (fromBase === 16 && !/^[0-9A-F]+$/.test(cleanValue)) {
                throw new Error('十六進制只能包含 0-9 和 A-F')
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
    beforeUnmount() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }
    }
}
</script>

<style scoped>
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #2d3748;
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
    color: #e2e8f0;
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
    background-color: #1a202c;
    border-radius: 8px;
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
    color: #a0aec0;
    transition: all 0.3s ease;
    user-select: none;
}

.tab:hover {
    color: #e2e8f0;
    background-color: #2d3748;
}

.tab.active {
    color: white;
    background-color: #4299e1;
    font-weight: bold;
}

.input-container {
    position: relative;
}

.conversion-input {
    width: 100%;
    padding: 16px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 1.2rem;
    font-family: 'Courier New', monospace;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.conversion-input:focus {
    outline: none;
    border-color: #4299e1;
}

.conversion-input::placeholder {
    color: #718096;
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
    color: #4299e1;
    font-weight: bold;
    user-select: none;
}

.error-message {
    background-color: #e53e3e;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-top: 1rem;
    max-width: 600px;
    font-size: 0.9rem;
}

/* 桌面端和移動端顯示控制 */
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
        border: 2px solid #4a5568;
        border-radius: 8px;
        background-color: #1a202c;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        box-sizing: border-box;
    }
    
    .base-select:focus {
        outline: none;
        border-color: #4299e1;
    }
    
    
    /* 輸入和結果區域 */
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
        border: 2px solid #4a5568;
        border-radius: 8px;
        background-color: #1a202c;
        color: white;
        font-size: 1.2rem;
        font-family: 'Courier New', monospace;
        box-sizing: border-box;
        min-height: 50px;
    }
    
    .mobile-conversion-input:focus {
        outline: none;
        border-color: #4299e1;
    }
    
    .mobile-conversion-input::placeholder {
        color: #718096;
        font-family: inherit;
    }
    
    .mobile-result-container {
        padding: 16px;
        border: 2px solid #4a5568;
        border-radius: 8px;
        background-color: #2d3748;
        min-height: 50px;
        display: flex;
        align-items: center;
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
        font-size: 16px; /* 防止 iOS 縮放 */
        padding: 14px;
        min-height: 48px;
    }
    
    .base-select {
        font-size: 16px; /* 防止 iOS 縮放 */
        padding: 12px;
        min-height: 44px; /* iOS 推薦的最小觸控區域 */
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
