<template>
    <div class="page-container">
        <BackToHome />

        <main class="tool-container">
            <h1 class="tool-title">PDF 壓縮</h1>
            <p class="tool-description">免費線上 PDF 壓縮工具，於瀏覽器本機壓縮，檔案不會上傳到任何伺服器，保護您的隱私。</p>

            <div class="main-content">
                <!-- 上傳 / 檔案資訊 -->
                <label
                    v-if="!file"
                    class="dropzone"
                    :class="{ dragover: isDragging }"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="handleDragLeave"
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
                        aria-label="選擇或拖曳 PDF 檔案上傳"
                        @change="handleFileChange"
                    />
                </label>

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

                    <!-- 壓縮模式 -->
                    <div class="settings-section">
                        <h3 class="settings-title">壓縮方式</h3>
                        <div class="level-group" role="radiogroup" aria-label="壓縮方式">
                            <button
                                v-for="m in modes"
                                :key="m.value"
                                type="button"
                                role="radio"
                                :aria-checked="mode === m.value"
                                :class="['level-option', { active: mode === m.value }]"
                                :disabled="isCompressing"
                                @click="mode = m.value"
                            >
                                <span class="level-name">{{ m.label }}</span>
                                <span class="level-desc">{{ m.desc }}</span>
                            </button>
                        </div>

                        <div v-if="mode === 'raster'" class="setting-item quality-item">
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

                        <p class="settings-note">{{ modeNote }}</p>
                        <p class="settings-note guarantee">✓ 壓縮後絕不會比原檔大，若無法再縮小將自動保留原檔。</p>
                    </div>

                    <!-- 動作區 -->
                    <div v-if="!result" class="action-row">
                        <Button variant="primary" class="full-btn" :disabled="isCompressing" @click="compress">
                            {{ isCompressing ? `處理中… ${progress}%` : '開始壓縮' }}
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
                                <span class="size-value" :class="{ highlight: result.saved > 0 }">{{ formatSize(result.compressedSize) }}</span>
                            </div>
                        </div>
                        <div class="result-badge" :class="result.saved > 0 ? 'good' : 'warn'">
                            <template v-if="result.saved > 0">已縮減 {{ result.savedPercent }}%（省下 {{ formatSize(result.saved) }}）</template>
                            <template v-else>此檔案已相當精簡，無法再縮小，已為你保留原始檔案</template>
                        </div>
                        <div class="action-buttons">
                            <Button variant="success" @click="download">下載 PDF</Button>
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
import { PDFDocument } from 'pdf-lib'
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
            mode: 'lossless',
            quality: 0.7,
            scale: 1.5,
            result: null,
            modes: [
                { value: 'lossless', label: '無損優化', desc: '保留文字，安全壓縮' },
                { value: 'raster', label: '強力壓縮', desc: '點陣化，適合掃描檔／圖片' }
            ]
        }
    },
    computed: {
        modeNote() {
            return this.mode === 'raster'
                ? '將每頁重新轉為影像，對掃描檔或大量圖片的 PDF 能大幅縮小，但文字會變成圖片、無法再被選取。'
                : '重新整理並壓縮 PDF 內部結構，保留可選取的文字與向量內容，適合一般文件。'
        }
    },
    methods: {
        handleFileChange(e) {
            const f = e.target.files && e.target.files[0]
            if (f) this.setFile(f)
            e.target.value = ''
        },
        handleDragLeave(e) {
            // 滑過內部子元素也會觸發 dragleave，僅在真正離開拖放區時才取消高亮
            if (!e.currentTarget.contains(e.relatedTarget)) this.isDragging = false
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
        onQualityInput(e) {
            this.quality = Number(e.target.value) / 100
        },
        async compress() {
            if (!this.file || this.isCompressing) return
            this.isCompressing = true
            this.progress = 0

            try {
                const originalBytes = new Uint8Array(await this.file.arrayBuffer())
                const originalSize = this.file.size

                const candidate = this.mode === 'raster'
                    ? await this.rasterizeCompress(originalBytes)
                    : await this.losslessCompress(originalBytes)

                // 核心保證：壓縮後絕不大於原檔，否則保留原檔
                let finalBytes = originalBytes
                let finalSize = originalSize
                if (candidate && candidate.size < originalSize) {
                    finalBytes = candidate.bytes
                    finalSize = candidate.size
                }

                const blob = new Blob([finalBytes], { type: 'application/pdf' })
                const saved = originalSize - finalSize
                this.result = {
                    blob,
                    originalSize,
                    compressedSize: finalSize,
                    saved,
                    savedPercent: saved > 0 ? Math.round((saved / originalSize) * 100) : 0
                }
                this.showToast(saved > 0 ? '壓縮完成' : '此檔案已無法再縮小，已保留原檔', saved > 0 ? 'success' : 'info')
            } catch (err) {
                console.error('PDF compress error:', err)
                const encrypted = err && (err.name === 'PasswordException' || /encrypt|password/i.test(err.message || ''))
                this.showToast(encrypted ? '此 PDF 受密碼保護，無法壓縮' : '壓縮失敗，檔案可能已損毀', 'error')
            } finally {
                this.isCompressing = false
            }
        },
        // 無損：以 pdf-lib 重整並啟用物件串流壓縮，保留文字與向量
        async losslessCompress(bytes) {
            const doc = await PDFDocument.load(bytes, { updateMetadata: false })
            const out = await doc.save({ useObjectStreams: true, addDefaultPage: false })
            this.progress = 100
            return { bytes: out, size: out.length }
        },
        // 強力：逐頁點陣化為 JPEG 後以 jsPDF 重建
        async rasterizeCompress(bytes) {
            // 傳入副本，避免 pdf.js 分離（detach）原始 buffer
            const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise
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

            const out = new Uint8Array(doc.output('arraybuffer'))
            return { bytes: out, size: out.length }
        },
        download() {
            if (!this.result) return
            const url = URL.createObjectURL(this.result.blob)
            const link = document.createElement('a')
            const baseName = this.file.name.replace(/\.pdf$/i, '')
            // 有實際縮小才加上 -compressed，保留原檔時沿用原檔名
            link.download = this.result.saved > 0 ? `${baseName}-compressed.pdf` : this.file.name
            link.href = url
            document.body.appendChild(link)
            link.click()
            link.remove()
            // 延後釋放，避免 Safari／Firefox 在下載開始前就被 revoke 中斷
            setTimeout(() => URL.revokeObjectURL(url), 2000)
            this.showToast('已下載 PDF', 'success')
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
.dropzone:focus-within {
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
    grid-template-columns: repeat(2, 1fr);
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

.settings-note.guarantee {
    margin-top: 0.4rem;
    color: #68d391;
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
    background-color: rgba(66, 153, 225, 0.12);
    color: #90cdf4;
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
