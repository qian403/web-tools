<template>
    <div class="page-container" ref="containerRef">
        <BackToHome>返回首頁</BackToHome>

        <!-- 可編輯文字區 -->
        <div 
            class="editor" 
            contenteditable="true" 
            ref="editorRef" 
            @input="onInput"
            :style="{ fontSize: fontSize + 'px' }"
        ></div>

        <div class="hidden-measurer" ref="hiddenRef" :style="{ fontSize: fontSize + 'px' }" v-text="textContent"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import BackToHome from '@/components/BackToHome.vue'

const containerRef = ref(null)
const editorRef = ref(null)
const hiddenRef = ref(null)
const textContent = ref('')
const fontSize = ref(60)
let debounceTimer = null

function onInput(e) {
    textContent.value = e.target.innerText
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        adjustFontSize()
    }, 50)
}

onMounted(() => {
    editorRef.value.focus()
    adjustFontSize()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    clearTimeout(debounceTimer)
    window.removeEventListener('resize', handleResize)
})

function handleResize() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        adjustFontSize()
    }, 100)
}

async function adjustFontSize() {
    if (!containerRef.value || !hiddenRef.value) return

    const minSize = 10
    const maxSize = 600
    let low = minSize
    let high = maxSize
    let bestFit = low

    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        fontSize.value = mid
        await nextTick()

        if (fitsInContainer()) {
            bestFit = mid
            low = mid + 1
        } else {
            high = mid - 1
        }
    }

    fontSize.value = bestFit
}

function fitsInContainer() {
    const container = containerRef.value
    const hidden = hiddenRef.value
    const containerWidth = container.clientWidth - 32
    const containerHeight = container.clientHeight - 80
    return hidden.scrollWidth <= containerWidth && hidden.scrollHeight <= containerHeight
}
</script>

<style scoped>
.page-container {
    position: fixed;
    inset: 0;
    background-color: #2d3748;
    color: white;
    font-family: 'Noto Sans TC', system-ui, sans-serif;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
}

.editor {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 60px 1rem 1rem;
    outline: none;
    line-height: 1.2;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    caret-color: white;
    -webkit-user-select: text;
    user-select: text;
}

.hidden-measurer {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
    width: calc(100% - 32px);
    box-sizing: border-box;
    padding: 1rem;
    line-height: 1.2;
    text-align: center;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
}

@media (max-width: 768px) {
    .editor {
        padding: 60px 1rem 1rem;
    }
}
</style>
