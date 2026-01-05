<template>
    <div class="page-container" ref="containerRef">
        <BackToHome>返回首頁</BackToHome> <!-- 返回首頁按鈕 -->
        <p class="tool-description">全螢幕文字展示工具，自動調整字體大小填滿畫面，適合簡報、標語或大螢幕展示。</p>

        <!-- 可編輯文字區 -->
        <div class="editor" contenteditable="true" ref="editorRef" @input="onInput"
            :style="{ fontSize: fontSize + 'px' }"></div>

        <div class="hidden-measurer" ref="hiddenRef" :style="{ fontSize: fontSize + 'px' }" v-text="textContent"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import BackToHome from '@/components/BackToHome.vue'

// DOM 參考
const containerRef = ref(null)
const editorRef = ref(null)
const hiddenRef = ref(null)

// 使用者輸入文字
const textContent = ref('')

const fontSize = ref(60)


function onInput(e) {
    textContent.value = e.target.innerText
    nextTick(() => adjustFontSize())
}

onMounted(() => {
    editorRef.value.focus()
    adjustFontSize()
})

async function adjustFontSize() {
    if (!containerRef.value || !hiddenRef.value) return

    const minSize = 10
    const maxSize = 600  // 可再提高以允許更大字體
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

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const contentWidth = hidden.scrollWidth
    const contentHeight = hidden.scrollHeight


    return (contentWidth <= containerWidth && contentHeight <= containerHeight)
}
</script>

<style scoped>
.page-container {
    position: fixed;
    inset: 0;
    /* top:0; left:0; right:0; bottom:0; */
    background-color: #2d3748;
    color: white;
    /* 指定能同時涵蓋中英文字元的字體，如 Noto Sans TC */
    font-family: 'Noto Sans TC', sans-serif;
    overflow: hidden;
}

.tool-description {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    color: #a0aec0;
    font-size: 0.9rem;
    text-align: center;
    max-width: 90%;
    line-height: 1.5;
    z-index: 10;
}



.editor {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 1rem;
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
}

.hidden-measurer {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;

    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    line-height: 1.2;
    text-align: center;

    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
}
</style>