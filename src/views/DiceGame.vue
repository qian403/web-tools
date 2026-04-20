<template>
    <div class="page-container">
        <BackToHome />

        <main class="dice-game-container">
            <h1 class="title">骰子遊戲</h1>
            <p class="game-description">模擬擲骰子遊戲，可設定投注金額與獲勝機率，拖動滑桿調整難度。</p>

            <!-- 餘額與統計 -->
            <div class="stats-container">
                <div class="stat-item balance" @click="openBalanceModal">
                    <span class="stat-label">餘額 (點擊調整)</span>
                    <span class="stat-value">${{ balance.toFixed(2) }}</span>
                </div>
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">勝場</span>
                        <span class="stat-value win-count">{{ totalWins }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">敗場</span>
                        <span class="stat-value lose-count">{{ totalLosses }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">總場數</span>
                        <span class="stat-value">{{ totalWins + totalLosses }}</span>
                    </div>
                </div>
            </div>

            <!-- 遊戲參數設定 -->
            <div class="game-settings">
                <div class="setting-group">
                    <label>投注金額 ($)</label>
                    <div class="input-container">
                        <input
                            v-model="betAmount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            :max="balance"
                            :disabled="isRolling"
                            class="input-field"
                            placeholder="0.00"
                            @input="validateBetInput"
                        />
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
                            <div
                                class="slider-thumb"
                                :class="{ disabled: isRolling }"
                                :style="{ left: `${rollOver}%` }"
                                @mousedown="startDrag"
                                @touchstart="startDrag"
                            >
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



            <div class="button-group">
                <Button
                    variant="primary"
                    size="large"
                    :disabled="isRolling || isAutoMode || betAmount > balance"
                    @click="placeBet"
                >
                    <span v-if="!isRolling">開始投注</span>
                    <span v-else class="rolling-text">投注中...</span>
                </Button>

                <Button
                    variant="secondary"
                    size="large"
                    :disabled="isRolling || balance < betAmount"
                    @click="isAutoMode ? stopAutoRoll() : openAutoModal()"
                >
                    <span v-if="!isAutoMode">自動投注</span>
                    <span v-else>停止 ({{ currentRound }}/{{ autoRounds }})</span>
                </Button>
            </div>

            <!-- 遊戲結果顯示 -->
            <div v-if="gameResult" class="result-display" :class="{ win: gameResult.win, lose: !gameResult.win }">
                <div class="result-title">{{ gameResult.win ? '🎉 獲勝！' : '😢 失敗' }}</div>
                <div class="result-details">
                    <div class="result-item">
                        <span>投注金額：</span>
                        <span>${{ gameResult.betAmount?.toFixed(2) }}</span>
                    </div>
                    <div class="result-item">
                        <span>獲得：</span>
                        <span :class="gameResult.win ? 'profit' : 'loss'">
                            {{ gameResult.win ? '+' : '' }}${{ gameResult.win ? gameResult.profit.toFixed(2) : '0.00' }}
                        </span>
                    </div>
                </div>
            </div>
        </main>

        <!-- 餘額調整彈窗 -->
        <div v-if="showBalanceModal" class="modal-overlay" @click="closeBalanceModal">
            <div class="modal-content" @click.stop>
                <h3 class="modal-title">調整餘額</h3>
                <div class="modal-body">
                    <label for="new-balance">新餘額 ($)</label>
                    <input
                        id="new-balance"
                        v-model="newBalance"
                        type="number"
                        step="0.01"
                        min="0.01"
                        class="modal-input"
                        placeholder="輸入新餘額"
                    />
                </div>
                <div class="modal-actions">
                    <Button variant="secondary" @click="closeBalanceModal">取消</Button>
                    <Button variant="primary" @click="updateBalance">確認</Button>
                </div>
            </div>
        </div>

        <!-- 自動投注設定彈窗 -->
        <div v-if="showAutoModal" class="modal-overlay" @click="closeAutoModal">
            <div class="modal-content" @click.stop>
                <h3 class="modal-title">自動投注設定</h3>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="auto-bet-amount">投注金額 ($)</label>
                        <input
                            id="auto-bet-amount"
                            v-model="betAmount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            :max="balance"
                            class="modal-input"
                            placeholder="投注金額"
                        />
                    </div>
                    <div class="form-group">
                        <label for="auto-rounds">投注次數</label>
                        <input
                            id="auto-rounds"
                            v-model="autoRounds"
                            type="number"
                            min="1"
                            max="1000"
                            class="modal-input"
                            placeholder="投注次數"
                        />
                    </div>
                </div>
                <div class="modal-actions">
                    <Button variant="secondary" @click="closeAutoModal">取消</Button>
                    <Button variant="primary" @click="startAutoRoll">開始</Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import BackToHome from '@/components/BackToHome.vue';
import Button from '@/components/Button.vue';

export default {
    name: 'DiceGame',
    components: {
        BackToHome,
        Button
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
        const balance = ref(100.00); // 初始點數
        const totalWins = ref(0);
        const totalLosses = ref(0);
        const showBalanceModal = ref(false);
        const newBalance = ref('100.00');
        const isAutoMode = ref(false);
        const autoRounds = ref(10);
        const currentRound = ref(0);
        const showAutoModal = ref(false);

        
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
            if (isRolling.value) return; // 投注中禁止拖動

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

            // 檢查餘額
            const currentBetAmount = validateNumber(betAmount.value, MIN_BET_AMOUNT, MAX_BET_AMOUNT, 1.00);
            if (currentBetAmount > balance.value) {
                alert('餘額不足！');
                return;
            }

            isRolling.value = true;

            try {
                // 扣除投注金額
                balance.value = Math.round((balance.value - currentBetAmount) * 100) / 100;

                await new Promise(resolve => setTimeout(resolve, 500));

                const rollNumber = Math.random() * 100;
                const rollOverValue = validateNumber(rollOver.value, MIN_ROLL_OVER, MAX_ROLL_OVER, 50);
                const win = rollNumber > rollOverValue;

                const currentMultiplier = validateNumber(multiplier.value, 1, 1000, 2);
                const currentProfit = win ? (currentBetAmount * currentMultiplier) : 0;

                // 更新統計
                if (win) {
                    totalWins.value++;
                    balance.value = Math.round((balance.value + currentProfit) * 100) / 100;
                } else {
                    totalLosses.value++;
                }

                gameResult.value = {
                    rollNumber: Math.round(rollNumber * 100) / 100,
                    win,
                    profit: Math.round(currentProfit * 100) / 100,
                    betAmount: currentBetAmount
                };

                await nextTick();

                setTimeout(() => {
                    const startValue = lastResultPosition.value;
                    const endValue = gameResult.value.rollNumber;

                    animateNumber(startValue, endValue, 400);
                    lastResultPosition.value = endValue;
                }, 50);

            } catch (error) {
                console.error('投注過程中發生錯誤:', error);
                // 退回投注金額
                balance.value = Math.round((balance.value + currentBetAmount) * 100) / 100;

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
                const maxBet = Math.min(balance.value, MAX_BET_AMOUNT);

                if (isNaN(value) || value < MIN_BET_AMOUNT) {
                    betAmount.value = MIN_BET_AMOUNT.toString();
                } else if (value > maxBet) {
                    betAmount.value = maxBet.toString();
                }
            } catch (error) {
                console.error('輸入驗證失敗:', error);
                betAmount.value = MIN_BET_AMOUNT.toString();
            }
        };

        const openBalanceModal = () => {
            if (isRolling.value) return;
            newBalance.value = balance.value.toFixed(2);
            showBalanceModal.value = true;
        };

        const closeBalanceModal = () => {
            showBalanceModal.value = false;
        };

        const updateBalance = () => {
            try {
                const value = parseFloat(newBalance.value);
                if (isNaN(value) || value < 0.01) {
                    alert('請輸入有效的金額（最小 $0.01）');
                    return;
                }
                balance.value = Math.round(value * 100) / 100;
                closeBalanceModal();
            } catch (error) {
                console.error('更新餘額失敗:', error);
                alert('更新失敗，請重試');
            }
        };

        const openAutoModal = () => {
            if (isRolling.value) return;
            showAutoModal.value = true;
        };

        const closeAutoModal = () => {
            showAutoModal.value = false;
        };

        const startAutoRoll = async () => {
            closeAutoModal();

            if (isAutoMode.value) return;

            isAutoMode.value = true;
            currentRound.value = 0;

            for (let i = 0; i < autoRounds.value; i++) {
                if (!isAutoMode.value) break;

                const currentBetAmount = validateNumber(betAmount.value, MIN_BET_AMOUNT, MAX_BET_AMOUNT, 1.00);
                if (currentBetAmount > balance.value) {
                    alert('餘額不足，自動投注已停止！');
                    break;
                }

                currentRound.value = i + 1;
                await placeBet();
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            isAutoMode.value = false;
            currentRound.value = 0;
        };

        const stopAutoRoll = () => {
            isAutoMode.value = false;
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
            balance,
            totalWins,
            totalLosses,
            showBalanceModal,
            newBalance,
            isAutoMode,
            autoRounds,
            currentRound,
            showAutoModal,
            usdValue,
            rollOverFormatted,
            multiplierFormatted,
            winChanceFormatted,
            gameResultFormatted,
            validateBetInput,
            startDrag,
            placeBet,
            openBalanceModal,
            closeBalanceModal,
            updateBalance,
            openAutoModal,
            closeAutoModal,
            startAutoRoll,
            stopAutoRoll
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
    margin-bottom: 0.5rem;
    text-align: center;
}

.game-description {
    text-align: center;
    color: #a0aec0;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
}

.stats-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1.5rem;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.stat-item {
    background-color: #1a202c;
    padding: 0.75rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #2d3748;
    transition: all 0.3s ease;
}

.stat-item.balance {
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border-color: #4299e1;
    cursor: pointer;
}

.stat-item.balance:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
    border-color: #63b3ed;
}

.stat-label {
    display: block;
    color: #a0aec0;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
}

.stat-value {
    display: block;
    font-weight: bold;
    font-size: 1.2rem;
    color: white;
}

.stat-item.balance .stat-value {
    color: #48bb78;
    font-size: 1.5rem;
}

.win-count {
    color: #48bb78;
}

.lose-count {
    color: #e53e3e;
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

.input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.slider-thumb.disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
    pointer-events: none;
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
    transition: left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease;
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

.rolling-text {
    animation: rolling-text 1s infinite;
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

.result-display {
    margin-top: 1.5rem;
    padding: 1.5rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border: 2px solid;
    animation: slideIn 0.3s ease;
}

.result-display.win {
    border-color: #48bb78;
}

.result-display.lose {
    border-color: #e53e3e;
}

.result-title {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
}

.result-display.win .result-title {
    color: #48bb78;
}

.result-display.lose .result-title {
    color: #e53e3e;
}

.result-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.result-item {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #e2e8f0;
}

.result-item .profit {
    color: #48bb78;
    font-weight: bold;
}

.result-item .loss {
    color: #e53e3e;
    font-weight: bold;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.button-group {
    display: flex;
    gap: 1rem;
    width: 100%;
}

.button-group button {
    flex: 1;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

.modal-content {
    background: linear-gradient(135deg, #1a202c, #2d3748);
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
}

.modal-body {
    margin-bottom: 1.5rem;
}

.modal-body .form-group {
    margin-bottom: 1rem;
}

.modal-body .form-group:last-child {
    margin-bottom: 0;
}

.modal-body label {
    display: block;
    color: #a0aec0;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.modal-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #4a5568;
    border-radius: 8px;
    background-color: #1a202c;
    color: white;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;
}

.modal-input:focus {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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