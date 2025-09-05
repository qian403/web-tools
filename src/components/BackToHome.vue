<template>
    <Button 
        variant="secondary" 
        size="small" 
        class="back-button" 
        @click="goBack"
    >
        <slot>回到首頁</slot>
    </Button>
</template>

<script>
import Button from './Button.vue'

export default {
    name: 'BackToHome',
    components: {
        Button
    },
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
    z-index: 10;
}
</style>