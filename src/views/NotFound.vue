<template>
    <div class="page-container">
        <main class="not-found-container">
            <div class="content">
                <div class="error-code">
                    <span class="digit">4</span>
                    <span class="zero">
                        <div class="circle"></div>
                    </span>
                    <span class="digit">4</span>
                </div>
                <h1 class="title">頁面走丟了</h1>
                <p class="description">你要找的頁面可能已被移除、名稱已變更，或暫時無法使用。</p>
                <Button variant="primary" size="large" @click="goHome">返回首頁</Button>
            </div>
        </main>
    </div>
</template>

<script>
import Button from '@/components/Button.vue'

export default {
    name: 'NotFound',
    components: { Button },
    methods: {
        goHome() {
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    padding: 20px;
}

.content {
    max-width: 400px;
}

.error-code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.digit {
    font-size: 6rem;
    font-weight: 800;
    color: #4a5568;
    line-height: 1;
}

.zero {
    position: relative;
    width: 5rem;
    height: 5rem;
}

.circle {
    width: 100%;
    height: 100%;
    border: 0.8rem solid #4299e1;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

.title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 0.75rem;
}

.description {
    font-size: 1rem;
    color: #718096;
    margin: 0 0 2rem;
    line-height: 1.6;
}

@media (max-width: 480px) {
    .digit {
        font-size: 4rem;
    }
    
    .zero {
        width: 3.5rem;
        height: 3.5rem;
    }
    
    .circle {
        border-width: 0.5rem;
    }
    
    .title {
        font-size: 1.5rem;
    }
}
</style>
