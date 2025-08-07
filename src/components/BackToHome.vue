<template>
    <div class="back-button" @click="goBack">
        <slot>回到首頁</slot>
    </div>
</template>

<script>
export default {
    name: 'BackToHome',
    methods: {
        goBack() {
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    background-color: #4299e1;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.3s;
    font-size: 14px;
    font-weight: 500;
    user-select: none;
}

.back-button:hover {
    background-color: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
}

.back-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(66, 153, 225, 0.3);
}
</style>