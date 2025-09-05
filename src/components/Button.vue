<template>
    <button 
        :class="['base-button', variant, size, { disabled: disabled }]"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'BaseButton',
    props: {
        variant: {
            type: String,
            default: 'primary',
            validator: (value) => ['primary', 'secondary', 'success', 'danger'].includes(value)
        },
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large'].includes(value)
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick(event) {
            if (!this.disabled) {
                this.$emit('click', event)
            }
        }
    }
}
</script>

<style scoped>
.base-button {
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    font-family: inherit;
    outline: none;
    user-select: none;
}

.base-button:focus {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
}

/* 尺寸變體 */
.small {
    padding: 10px 16px;
    font-size: 1rem;
}

.medium {
    padding: 14px 28px;
    font-size: 1.125rem;
}

.large {
    padding: 18px 36px;
    font-size: 1.25rem;
}

/* 顏色變體 */
.primary {
    background-color: #0072E3;
    color: white;
}

.primary:hover:not(.disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
}

.secondary {
    background-color: #4a5568;
    color: white;
}

.secondary:hover:not(.disabled) {
    background-color: #2d3748;
    transform: translateY(-1px);
}

.success {
    background-color: #4caf50;
    color: white;
}

.success:hover:not(.disabled) {
    background-color: #43a047;
    transform: translateY(-1px);
}

.danger {
    background-color: #e53e3e;
    color: white;
}

.danger:hover:not(.disabled) {
    background-color: #c53030;
    transform: translateY(-1px);
}

/* 禁用狀態 */
.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.disabled:hover {
    transform: none !important;
}
</style>
