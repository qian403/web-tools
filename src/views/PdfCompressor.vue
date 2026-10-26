<template>
    <div class="page-container">
        <BackToHome />

        <main class="tool-container">
            <h1 class="tool-title">PDF 壓縮</h1>
            <p class="tool-description">免費線上 PDF 壓縮工具，於瀏覽器本機壓縮，檔案不會上傳到任何伺服器，保護您的隱私。</p>

            <div class="main-content">
                <!-- 上傳 / 檔案資訊 -->
                <div
                    v-if="!file"
                    class="dropzone"
                    :class="{ dragover: isDragging }"
                    role="button"
                    tabindex="0"
                    aria-label="點擊或拖曳 PDF 檔案到此處上傳"
                    @click="triggerFilePicker"
                    @keydown.enter.prevent="triggerFilePicker"
                    @keydown.space.prevent="triggerFilePicker"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop"
                >
                    <div class="dropzone-icon">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M12 18v-6"/>
                            <path d="M9 15l3-3 3 3"/>
                        </svg>
                    </div>
                    <p class="dropzone-title">點擊選擇，或將 PDF 拖曳到此處</p>
                    <p class="dropzone-hint">支援單一 PDF 檔案 · 全程於本機處理</p>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="application/pdf,.pdf"
                        class="sr-only"
                        @change="handleFileChange"
                    />
                </div>

                <template v-else>
                    <!-- 檔案卡片 -->
                    <div class="file-card">
                        <div class="file-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        </div>
                        <div class="file-meta">
                            <span class="file-name" :title="file.name">{{ file.name }}</span>
                            <span class="file-size">{{ formatSize(file.size) }}<template v-if="pageCount"> · {{ pageCount }} 頁</template></span>
                        </div>
                        <button class="file-remove" aria-label="移除檔案" @click="reset" :disabled="isCompressing">✕</button>
                    </div>

                    <!-- 壓縮等級 -->
                    <div class="settings-section">
                        <h3 class="settings-title">壓縮等級</h3>
                        <div class="level-group" role="radiogroup" aria-label="壓縮等級">
                            <button
                                v-for="level in levels"
                                :key="level.value"
                                type="button"
                                role="radio"
                                :aria-checked="selectedLevel === level.value"
                                :class="['level-option', { active: selectedLevel === level.value }]"
                                :disabled="isCompressing"
                                @click="selectLevel(level.value)"
                            >
                                <span class="level-name">{{ level.label }}</span>
                                <span class="level-desc">{{ level.desc }}</span>
                            </button>
                        </div>

                        <div class="setting-item quality-item">
                            <label for="quality-range" class="setting-label">影像品質：{{ Math.round(quality * 100) }}%</label>
                            <input
                                id="quality-range"
                                type="range"
                                min="30"
                                max="95"
                                step="5"
                                :value="Math.round(quality * 100)"
                                class="range-slider"
                                :disabled="isCompressing"
                                @input="onQualityInput"
                            />
                        </div>
                        <p class="settings-note">壓縮會將頁面重新轉為影像，檔案越小、畫質越低。文字內容將無法再被選取。</p>
                    </div>

                    <!-- 動作區 -->
                    <div v-if="!result" class="action-row">
                        <Button variant="primary" class="full-btn" :disabled="isCompressing" @click="compress">
                            {{ isCompressing ? `壓縮中… ${progress}%` : '開始壓縮' }}
                        </Button>
                        <div v-if="isCompressing" class="progress-bar" aria-hidden="true">
                            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                        </div>
                    </div>

                    <!-- 結果區 -->
                    <div v-else class="result-card">
                        <div class="result-sizes">
                            <div class="size-block">
                                <span class="size-label">原始大小</span>
                                <span class="size-value">{{ formatSize(result.originalSize) }}</span>
                            </div>
                            <div class="size-arrow">→</div>
                            <div class="size-block">
                                <span class="size-label">壓縮後</span>
                                <span class="size-value highlight">{{ formatSize(result.compressedSize) }}</span>
                            </div>
                        </div>
                        <div class="result-badge" :class="result.saved > 0 ? 'good' : 'warn'">
                            <template v-if="result.saved > 0">已縮減 {{ result.savedPercent }}%</template>
                            <template v-else>此檔案已相當精簡，壓縮後未能縮小，建議保留原檔</template>
                        </div>
                        <div class="action-buttons">
                            <Button variant="success" @click="download">下載壓縮後 PDF</Button>
                            <Button variant="secondary" @click="reset">壓縮另一個</Button>
                        </div>
                    </div>
                </template>
            </div>
        </main>
    </div>
</template>

<script>
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { jsPDF } from 'jspdf'
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

export default {
    name: 'PdfCompressor',
    components: {
        BackToHome,
        Button
    },
    data() {
        return {
            file: null,
            pageCount: 0,
            isDragging: false,
            isCompressing: false,
            progress: 0,
            selectedLevel: 'balanced',
            quality: 0.7,
            scale: 1.5,
            result: null,
            levels: [
                { value: 'light', label: '高品質', desc: '輕度壓縮', scale: 2, quality: 0.85 },
                { value: 'balanced', label: '建議', desc: '品質與大小平衡', scale: 1.5, quality: 0.7 },
                { value: 'strong', label: '最小檔案', desc: '高度壓縮', scale: 1, quality: 0.5 }
            ]
        }
    },
    methods: {
        triggerFilePicker() {
            this.$refs.fileInput && this.$refs.fileInput.click()
        },
        handleFileChange(e) {
            const f = e.target.files && e.target.files[0]
            if (f) this.setFile(f)
            e.target.value = ''
        },
        handleDrop(e) {
            this.isDragging = false
            const f = e.dataTransfer.files && e.dataTransfer.files[0]
            if (f) this.setFile(f)
        },
        async setFile(f) {
            const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
            if (!isPdf) {
                this.showToast('請選擇 PDF 檔案', 'error')
                return
            }
            this.reset()
            this.file = f
            // 嘗試讀取頁數（失敗不阻斷流程）
            try {
                const buf = await f.arrayBuffer()
                const doc = await pdfjsLib.getDocument({ data: buf }).promise
                this.pageCount = doc.numPages
                doc.destroy()
            } catch {
                this.pageCount = 0
            }
        },
        selectLevel(value) {
            const level = this.levels.find(l => l.value === value)
            if (!level) return
            this.selectedLevel = value
            this.scale = level.scale
            this.quality = level.quality
        },
        onQualityInput(e) {
            this.quality = Number(e.target.value) / 100
        },
        async compress() {
            if (!this.file || this.isCompressing) return
            this.isCompressing = true
            this.progress = 0

            try {
                const buf = await this.file.arrayBuffer()
                const pdf = await pdfjsLib.getDocument({ data: buf }).promise
                const total = pdf.numPages
                let doc = null

                for (let i = 1; i <= total; i++) {
                    const page = await pdf.getPage(i)
                    const viewport = page.getViewport({ scale: this.scale })
                    const base = page.getViewport({ scale: 1 })

                    const canvas = document.createElement('canvas')
                    canvas.width = Math.max(1, Math.floor(viewport.width))
                    canvas.height = Math.max(1, Math.floor(viewport.height))
                    const ctx = canvas.getContext('2d')
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    await page.render({ canvasContext: ctx, viewport }).promise
                    const imgData = canvas.toDataURL('image/jpeg', this.quality)

                    const orientation = base.width > base.height ? 'l' : 'p'
                    if (i === 1) {
                        doc = new jsPDF({ orientation, unit: 'pt', format: [base.width, base.height] })
                    } else {
                        doc.addPage([base.width, base.height], orientation)
                    }
                    doc.addImage(imgData, 'JPEG', 0, 0, base.width, base.height, undefined, 'FAST')

                    page.cleanup()
                    canvas.width = 0
                    canvas.height = 0

                    this.progress = Math.round((i / total) * 100)
                    // 讓畫面有機會重繪進度
                    await new Promise(r => setTimeout(r, 0))
                }

                pdf.destroy()

                const blob = doc.output('blob')
                const saved = this.file.size - blob.size
                this.result = {
                    blob,
                    originalSize: this.file.size,
                    compressedSize: blob.size,
                    saved,
                    savedPercent: saved > 0 ? Math.round((saved / this.file.size) * 100) : 0
                }
                this.showToast('壓縮完成', 'success')
            } catch (err) {
                console.error('PDF compress error:', err)
                this.showToast('壓縮失敗，可能是受密碼保護或損毀的 PDF', 'error')
            } finally {
                this.isCompressing = false
            }
        },
        download() {
            if (!this.result) return
            const url = URL.createObjectURL(this.result.blob)
            const link = document.createElement('a')
            const baseName = this.file.name.replace(/\.pdf$/i, '')
            link.download = `${baseName}-compressed.pdf`
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
            this.showToast('已下載壓縮後 PDF', 'success')
        },
        reset() {
            this.file = null
            this.pageCount = 0
            this.result = null
            this.progress = 0
            this.isDragging = false
        },
        formatSize(bytes) {
            if (bytes === 0) return '0 B'
            const k = 1024
            const units = ['B', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`
        },
        showToast(message, type = 'info') {
            const toast = document.createElement('div')
            toast.textContent = message

            Object.assign(toast.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: '9999',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease',
                backgroundColor: type === 'success' ? '#4caf50' : type === 'error' ? '#e53e3e' : '#4299e1'
            })

            document.body.appendChild(toast)

            setTimeout(() => {
                toast.style.opacity = '1'
                toast.style.transform = 'translateX(0)'
            }, 100)

            setTimeout(() => {
                toast.style.opacity = '0'
                toast.style.transform = 'translateX(100%)'
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast)
                    }
                }, 300)
            }, 3000)
        }
    }
}
</script>

<style scoped>
.tool-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    max-width: 640px;
    margin: 0 auto;
    box-sizing: border-box;
}

.tool-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    text-align: center;
    color: #fff;
}

.tool-description {
    color: #a0aec0;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.25rem;
    line-height: 1.5;
}

.main-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

/* 拖放區 */
.dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 3rem 1.5rem;
    background-color: #1a202c;
    border: 2px dashed #4a5568;
    border-radius: 12px;
    color: #a0aec0;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.25s, background-color 0.25s, transform 0.25s;
}

.dropzone:hover,
.dropzone:focus-visible {
    border-color: #4299e1;
    background-color: #202838;
    outline: none;
}

.dropzone.dragover {
    border-color: #4299e1;
    background-color: #223047;
    transform: scale(1.01);
}

.dropzone-icon {
    color: #4299e1;
    margin-bottom: 0.25rem;
}

.dropzone-title {
    font-size: 1rem;
    font-weight: bold;
    color: #e2e8f0;
}

.dropzone-hint {
    font-size: 0.8rem;
    color: #718096;
}

/* 檔案卡片 */
.file-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: #1a202c;
    border-radius: 12px;
    padding: 0.85rem 1rem;
}

.file-icon {
    color: #4299e1;
    flex-shrink: 0;
}

.file-meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
    text-align: left;
}

.file-name {
    color: #e2e8f0;
    font-weight: bold;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    color: #718096;
    font-size: 0.8rem;
}

.file-remove {
    background: none;
    border: none;
    color: #718096;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    flex-shrink: 0;
}

.file-remove:hover:not(:disabled) {
    background-color: #2d3748;
    color: #e53e3e;
}

.file-remove:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* 設定區 */
.settings-section {
    background-color: #1a202c;
    border-radius: 12px;
    padding: 1rem;
}

.settings-title {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    color: #a0aec0;
    border-bottom: 1px solid #4a5568;
    padding-bottom: 0.4rem;
    text-align: left;
}

.level-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

.level-option {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 0.5rem;
    border-radius: 8px;
    background-color: #2d3748;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    font-family: inherit;
}

.level-option:hover:not(:disabled) {
    background-color: #4a5568;
}

.level-option.active {
    background-color: #4299e1;
    color: white;
    border-color: #63b3ed;
}

.level-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.level-name {
    font-weight: bold;
    font-size: 0.9rem;
}

.level-desc {
    font-size: 0.72rem;
    opacity: 0.85;
}

.quality-item {
    margin-top: 1rem;
}

.setting-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: #cbd5e0;
    text-align: left;
}

.range-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #4a5568;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
}

.range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4299e1;
    cursor: pointer;
    transition: transform 0.2s;
}

.range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

.range-slider:disabled {
    opacity: 0.5;
}

.settings-note {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #718096;
    line-height: 1.5;
    text-align: left;
}

/* 動作區 */
.action-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.full-btn {
    width: 100%;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background-color: #1a202c;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #4299e1;
    border-radius: 4px;
    transition: width 0.2s ease;
}

/* 結果區 */
.result-card {
    background-color: #1a202c;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.result-sizes {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.size-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.size-label {
    font-size: 0.75rem;
    color: #718096;
}

.size-value {
    font-size: 1.15rem;
    font-weight: bold;
    color: #e2e8f0;
}

.size-value.highlight {
    color: #4caf50;
}

.size-arrow {
    color: #4a5568;
    font-size: 1.25rem;
}

.result-badge {
    text-align: center;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: bold;
}

.result-badge.good {
    background-color: rgba(76, 175, 80, 0.15);
    color: #68d391;
}

.result-badge.warn {
    background-color: rgba(229, 62, 62, 0.12);
    color: #fc8181;
    font-weight: normal;
    font-size: 0.82rem;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.action-buttons button {
    flex: 1;
}

/* 無障礙隱藏 */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* RWD */
@media (max-width: 768px) {
    .tool-container {
        min-height: 100vh;
        padding: 70px 15px 30px;
        justify-content: flex-start;
    }

    .tool-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .level-option {
        padding: 0.6rem 0.4rem;
    }

    .level-name {
        font-size: 0.82rem;
    }

    .level-desc {
        font-size: 0.66rem;
    }

    .action-buttons {
        flex-direction: column;
    }
}
</style>
