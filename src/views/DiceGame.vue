<template>
    <div class="page-container">
        <BackToHome />

        <div class="dice-game-container">
            <h2 class="title">骰子遊戲</h2>

            <!-- 遊戲參數設定 -->
            <div class="game-settings">
                <div class="setting-group">
                    <label>投注金額 ($)</label>
                    <div class="input-container">
                        <input v-model="betAmount" type="number" step="0.01" min="0.01" max="1000000"
                            class="input-field" placeholder="0.00" @input="validateBetInput" />
                        <span class="currency-icon">$</span>
                    </div>
                    <div class="usd-value">US${{ usdValue }}</div>
                </div>

                <div class="setting-group">
                    <div class="slider-container">
                        <div class="result-marker" :style="{ left: `${lastResultPosition}%` }"
                            :class="{ win: gameResult?.win, lose: gameResult && !gameResult.win, visible: !!gameResult }">
                            <div class="result-number">{{ gameResultFormatted }}</div>
                            <div class="result-indicator"></div>
                        </div>

                        <div class="slider-track">
                            <div class="slider-fill" :style="{ '--fill-width': `${rollOver}%` }">
                            </div>
                            <div class="slider-thumb" :style="{ left: `${rollOver}%` }" @mousedown="startDrag"
                                @touchstart="startDrag">
                                <div class="thumb-lines">
                                    <div class="line"></div>
                                    <div class="line"></div>
                                    <div class="line"></div>
                                </div>
                            </div>
                        </div>
                        <div class="slider-labels">
                            <span>2</span>
                            <span>25</span>
                            <span>50</span>
                            <span>75</span>
                            <span>98</span>
                        </div>
                    </div>
                </div>

                <div class="game-params" v-memo="[multiplierFormatted, rollOverFormatted, winChanceFormatted]">
                    <div class="param-item">
                        <span class="label">乘數</span>
                        <span class="value">{{ multiplierFormatted }}</span>
                    </div>
                    <div class="param-item">
                        <span class="label">擲大於</span>
                        <span class="value">{{ rollOverFormatted }}</span>
                    </div>
                    <div class="param-item">
                        <span class="label">獲勝機率</span>
                        <span class="value">{{ winChanceFormatted }}%</span>
                    </div>
                </div>
            </div>



            <button class="bet-button" @click="placeBet" :disabled="isRolling" :class="{ rolling: isRolling }">
                <span v-if="!isRolling">開始投注</span>
                <span v-else class="rolling-text">投注中...</span>
            </button>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import BackToHome from '@/components/BackToHome.vue';

export default {
    name: 'DiceGame',
    components: {
        BackToHome
    },
    setup() {
    
        const betAmount = ref('1.00');
        const rollOver = ref(50.00);
        const multiplier = ref(2.0000);
        const winChance = ref(50.0000);
        const isRolling = ref(false);
        const gameResult = shallowRef(null); 
        const lastResultPosition = ref(50);
        const animatedRollNumber = ref(50);

        
        let debounceTimer = null;
        let animationFrameId = null;
        let eventListeners = []; 

        
        const MAX_BET_AMOUNT = 1000000; // 最大投注金額
        const MIN_BET_AMOUNT = 0.01; // 最小投注金額
        const MAX_ROLL_OVER = 98; // 最大擲大於值
        const MIN_ROLL_OVER = 2; // 最小擲大於值

    
        const validateNumber = (value, min, max, defaultValue) => {
            const num = parseFloat(value);
            if (isNaN(num) || num < min || num > max) {
                return defaultValue;
            }
            return num;
        };

        const getSafeElement = (element, selector) => {
            try {
                if (!element) return null;
                return element.querySelector(selector);
            } catch (error) {
                console.warn('DOM 元素獲取失敗:', error);
                return null;
            }
        };

        const usdValue = computed(() => {
            const amount = validateNumber(betAmount.value, 0, MAX_BET_AMOUNT, 0);
            return Math.round(amount * 100) / 100;
        });

        const rollOverFormatted = computed(() => {
            const value = validateNumber(rollOver.value, MIN_ROLL_OVER, MAX_ROLL_OVER, 50);
            return value.toFixed(2);
        });

        const multiplierFormatted = computed(() => {
            const value = validateNumber(multiplier.value, 1, 1000, 2);
            return value.toFixed(4);
        });

        const winChanceFormatted = computed(() => {
            const value = validateNumber(winChance.value, 0, 100, 50);
            return value.toFixed(2);
        });

        const gameResultFormatted = computed(() => {
            if (!gameResult.value || typeof gameResult.value.rollNumber !== 'number') {
                return '0.00';
            }
            const value = validateNumber(animatedRollNumber.value, 0, 100, 0);
            return value.toFixed(2);
        });

        const updateGameParams = () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                try {
                    const rollOverValue = validateNumber(rollOver.value, MIN_ROLL_OVER, MAX_ROLL_OVER, 50);
                    const winChanceValue = Math.max(0, Math.min(100, 100 - rollOverValue));

                    const multiplierValue = winChanceValue > 0 ? 99 / winChanceValue : 1;

                    winChance.value = Math.round(winChanceValue * 10000) / 10000;
                    multiplier.value = Math.round(multiplierValue * 10000) / 10000;
                } catch (error) {
                    console.error('遊戲參數更新失敗:', error);
                    winChance.value = 50.0000;
                    multiplier.value = 2.0000;
                }
            }, 16); 
        };

        
        const animateNumber = (startValue, endValue, duration = 800) => {
            try {
                
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }

                const startTime = performance.now();
                const difference = endValue - startValue;

                const updateNumber = (currentTime) => {
                    try {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const baseValue = startValue + (difference * easeProgress);
                        const randomOffset = (Math.random() - 0.5) * 2;
                        const finalValue = Math.max(0, Math.min(100, baseValue + randomOffset));

                        animatedRollNumber.value = finalValue;

                        if (progress < 1) {
                            animationFrameId = requestAnimationFrame(updateNumber);
                        } else {
                            animatedRollNumber.value = endValue;
                            animationFrameId = null;
                        }
                    } catch (error) {
                        console.error('動畫更新失敗:', error);
                        animatedRollNumber.value = endValue;
                        animationFrameId = null;
                    }
                };

                animationFrameId = requestAnimationFrame(updateNumber);
            } catch (error) {
                console.error('動畫初始化失敗:', error);
                animatedRollNumber.value = endValue;
            }
        };

        
        const startDrag = (event) => {
            try {
                event.preventDefault();
                event.stopPropagation();

                const track = event.target?.closest('.slider-track');
                if (!track) {
                    console.warn('無法找到滑塊軌道元素');
                    return;
                }

                const sliderFill = getSafeElement(track, '.slider-fill');
                const sliderThumb = event.target?.closest('.slider-thumb');

                if (sliderFill) {
                    sliderFill.style.transition = 'none';
                }
                if (sliderThumb) {
                    sliderThumb.classList.add('dragging');
                }

                let lastUpdateTime = 0;
                const throttleDelay = 16; 

                const handleMouseMove = (e) => {
                    try {
                        const currentTime = performance.now();
                        if (currentTime - lastUpdateTime < throttleDelay) return;
                        lastUpdateTime = currentTime;

                        const rect = track.getBoundingClientRect();
                        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
                        if (clientX === undefined) return;

                        const clickX = clientX - rect.left;
                        const percentage = (clickX / rect.width) * 96 + 2;
                        const newValue = Math.max(MIN_ROLL_OVER, Math.min(MAX_ROLL_OVER, Math.round(percentage * 100) / 100));

                        rollOver.value = newValue;
                        updateGameParams();
                    } catch (error) {
                        console.error('滑塊拖動處理失敗:', error);
                    }
                };

                const handleMouseUp = () => {
                    try {
                        if (sliderFill) {
                            sliderFill.style.transition = '';
                        }
                        if (sliderThumb) {
                            sliderThumb.classList.remove('dragging');
                        }

                        
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        document.removeEventListener('touchmove', handleMouseMove);
                        document.removeEventListener('touchend', handleMouseUp);
                    } catch (error) {
                        console.error('滑塊拖動結束處理失敗:', error);
                    }
                };

                
                const listeners = [
                    ['mousemove', handleMouseMove],
                    ['mouseup', handleMouseUp],
                    ['touchmove', handleMouseMove],
                    ['touchend', handleMouseUp]
                ];

                listeners.forEach(([event, handler]) => {
                    try {
                        document.addEventListener(event, handler);
                        eventListeners.push({ event, handler });
                    } catch (error) {
                        console.error(`添加事件監聽器失敗: ${event}`, error);
                    }
                });
            } catch (error) {
                console.error('滑塊拖動初始化失敗:', error);
            }
        };

        const placeBet = async () => {
            if (isRolling.value) return;

            isRolling.value = true;

            try {
                
                const currentBetAmount = validateNumber(betAmount.value, MIN_BET_AMOUNT, MAX_BET_AMOUNT, 1.00);

                
                await new Promise(resolve => setTimeout(resolve, 1000));

                const rollNumber = Math.random() * 100;
                const rollOverValue = validateNumber(rollOver.value, MIN_ROLL_OVER, MAX_ROLL_OVER, 50);
                const win = rollNumber > rollOverValue;

                const currentMultiplier = validateNumber(multiplier.value, 1, 1000, 2);
                const currentProfit = win ? (currentBetAmount * (currentMultiplier - 1)) : 0;

                gameResult.value = {
                    rollNumber: Math.round(rollNumber * 100) / 100,
                    win,
                    profit: Math.round(currentProfit * 100) / 100
                };

                
                await nextTick();

                setTimeout(() => {
                    const startValue = lastResultPosition.value;
                    const endValue = gameResult.value.rollNumber;

                    animateNumber(startValue, endValue, 800);
                    lastResultPosition.value = endValue;
                }, 100);

            } catch (error) {
                console.error('投注過程中發生錯誤:', error);
                
                gameResult.value = {
                    rollNumber: 0,
                    win: false,
                    profit: 0,
                    error: '投注失敗，請重試'
                };
            } finally {
                isRolling.value = false;
            }
        };

        
        const validateBetInput = () => {
            try {
                const value = parseFloat(betAmount.value);
                if (isNaN(value) || value < MIN_BET_AMOUNT) {
                    betAmount.value = MIN_BET_AMOUNT.toString();
                } else if (value > MAX_BET_AMOUNT) {
                    betAmount.value = MAX_BET_AMOUNT.toString();
                }
            } catch (error) {
                console.error('輸入驗證失敗:', error);
                betAmount.value = MIN_BET_AMOUNT.toString();
            }
        };

        const cleanup = () => {
            try {
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                    debounceTimer = null;
                }
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }

            
                eventListeners.forEach(({ event, handler }) => {
                    try {
                        document.removeEventListener(event, handler);
                    } catch (error) {
                        console.warn(`移除事件監聽器失敗: ${event}`, error);
                    }
                });
                eventListeners = [];
            } catch (error) {
                console.error('清理函數執行失敗:', error);
            }
        };

        onMounted(() => {
            updateGameParams();
            animatedRollNumber.value = lastResultPosition.value;
        });

        onUnmounted(() => {
            cleanup();
        });

        return {
            betAmount,
            rollOver,
            multiplier,
            winChance,
            isRolling,
            gameResult,
            lastResultPosition,
            animatedRollNumber,
            usdValue,
            rollOverFormatted,
            multiplierFormatted,
            winChanceFormatted,
            gameResultFormatted,
            validateBetInput,
            startDrag,
            placeBet
        };
    }
};
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
}

.dice-game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 20px;
    max-width: 600px;
    margin: 0 auto;
}

.title {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.game-settings {
    width: 100%;
    max-width: 400px;
    margin-bottom: 2rem;
}

.setting-group {
    margin-bottom: 1.5rem;
}

.setting-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-field {
    width: 100%;
    padding: 12px 40px 12px 12px;
    border: 1px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
}

.input-field:focus {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.currency-icon {
    position: absolute;
    right: 12px;
    color: #48bb78;
    font-weight: bold;
    font-size: 1.1rem;
}

.usd-value {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #a0aec0;
    text-align: right;
}

.slider-container {
    position: relative;
    margin-top: 0.5rem;
    padding-top: 25px;
}

.slider-track {
    position: relative;
    height: 20px;
    background: #2d3748;
    border-radius: 10px;
    overflow: visible;
    margin-bottom: 0.5rem;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slider-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: #e53e3e;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.slider-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: var(--fill-width, 0%);
    height: 100%;
    width: calc(100% - var(--fill-width, 0%));
    background: #48bb78;
    border-radius: 0 10px 10px 0;
}


.slider-thumb {
    position: absolute;
    top: -8px;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #4299e1, #3182ce);
    border-radius: 6px;
    cursor: grab;
    transform: translateX(-50%);
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255, 255, 255, 0.1);
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    pointer-events: auto;
}

.slider-thumb:hover {
    cursor: grabbing;
    transform: translateX(-50%) scale(1.05);
}

.slider-thumb:active {
    cursor: grabbing;
    transform: translateX(-50%) scale(1.1);
}

.slider-thumb.dragging {
    transition: none !important;
    transform: translateX(-50%) scale(1.1);
}



.thumb-lines {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.line {
    width: 6px;
    height: 1px;
    background: white;
    border-radius: 1px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 遊戲結果標記 */
.result-marker {
    position: absolute;
    top: -20px;
    transform: translateX(-50%);
    z-index: 5;
    opacity: 0;
    transition: left 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease;
    pointer-events: none;
}

.result-marker.visible {
    opacity: 1;
}

.result-number {
    background: #1a202c;
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: bold;
    white-space: nowrap;
    text-align: center;
    margin-bottom: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-indicator {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid #1a202c;
    margin: 0 auto;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.result-marker.win .result-number {
    color: #48bb78;
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border-color: rgba(72, 187, 120, 0.3);
}

.result-marker.lose .result-number {
    color: #e53e3e;
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border-color: rgba(229, 62, 62, 0.3);
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #a0aec0;
    font-size: 0.875rem;
}

.game-params {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
}

.param-item {
    background-color: #1a202c;
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
}

.param-item .label {
    display: block;
    color: #a0aec0;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
}

.param-item .value {
    display: block;
    font-weight: bold;
    font-size: 1.1rem;
    color: white;
}

.bet-button {
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    font-size: 1.1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
    min-width: 150px;
    position: relative;
    overflow: hidden;
}

.bet-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(66, 153, 225, 0.3);
}

.bet-button:active:not(:disabled) {
    transform: translateY(0);
}

.bet-button.rolling {
    background: linear-gradient(135deg, #48bb78, #38a169);
    animation: rolling-pulse 1s infinite;
}

.rolling-text {
    animation: rolling-text 1s infinite;
}

@keyframes rolling-pulse {

    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
    }

    50% {
        box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
    }
}

@keyframes rolling-text {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.bet-button:disabled {
    background: #4a5568;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 響應式設計 */
@media (max-width: 480px) {
    .dice-game-container {
        padding: 0 15px;
    }

    .title {
        font-size: 1.5rem;
    }

    .game-settings {
        max-width: 100%;
    }
}
</style>