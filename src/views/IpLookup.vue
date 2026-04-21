<template>
    <div class="page-container">
        <BackToHome />

        <div class="ip-lookup-container">
            <!-- 搜尋框 -->
            <div class="search-box">
                <input
                    v-model="searchIp"
                    type="text"
                    class="search-input"
                    placeholder="IP Address"
                    @keydown.enter="searchCustomIp"
                />
                <Button variant="primary" @click="searchCustomIp" :disabled="isSearching" class="search-btn">
                    {{ isSearching ? 'Loading...' : 'Lookup' }}
                </Button>
            </div>

            <!-- 本機 IP 資訊 -->
            <div class="info-section">
                <h3 class="section-title">My IP Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Your IPv4</div>
                        <div class="info-value" v-if="ipv4Info">
                            <span @click="copyToClipboard(ipv4Info.ip)" class="clickable-value">{{ ipv4Info.ip }}</span>
                        </div>
                        <div class="info-value" v-else>N/A</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Your IPv6</div>
                        <div class="info-value" v-if="ipv6Info">
                            <span @click="copyToClipboard(ipv6Info.ip)" class="clickable-value">{{ ipv6Info.ip }}</span>
                        </div>
                        <div class="info-value" v-else-if="ipv6Loading">Loading...</div>
                        <div class="info-value not-supported" v-else>N/A</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Country / Region</div>
                        <div class="info-value" v-if="myInfo">{{ myInfo.country }} / {{ myInfo.region }}</div>
                        <div class="info-value" v-else>N/A</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">City</div>
                        <div class="info-value" v-if="myInfo">{{ myInfo.city }}</div>
                        <div class="info-value" v-else>N/A</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ISP</div>
                        <div class="info-value" v-if="myInfo">{{ myInfo.isp }}</div>
                        <div class="info-value" v-else>N/A</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">ASN / Organization</div>
                        <div class="info-value" v-if="myInfo">AS{{ myInfo.asn }} / {{ myInfo.asn_organization }}</div>
                        <div class="info-value" v-else>N/A</div>
                    </div>
                </div>
            </div>

            <!-- 查詢結果 -->
            <div v-if="searchResult" class="info-section result-section">
                <h3 class="section-title">Search Results for [IP]</h3>
                <div class="result-layout">
                    <div class="result-map">
                        <iframe
                            :src="`https://www.openstreetmap.org/export/embed.html?bbox=${searchResult.longitude-0.01},${searchResult.latitude-0.01},${searchResult.longitude+0.01},${searchResult.latitude+0.01}&layer=mapnik&marker=${searchResult.latitude},${searchResult.longitude}`"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border: 0;"
                        ></iframe>
                    </div>
                    <div class="result-info">
                        <div class="result-item">
                            <span class="result-label">IP Address:</span>
                            <span class="result-value">
                                <span @click="copyToClipboard(searchResult.ip)" class="clickable-value">{{ searchResult.ip }}</span>
                            </span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Location:</span>
                            <span class="result-value">{{ searchResult.city }}, {{ searchResult.region }}, {{ searchResult.country }}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Timezone:</span>
                            <span class="result-value">{{ searchResult.timezone }}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ISP:</span>
                            <span class="result-value">{{ searchResult.isp }}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Organization:</span>
                            <span class="result-value">{{ searchResult.organization }}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ASN:</span>
                            <span class="result-value">AS{{ searchResult.asn }} - {{ searchResult.asn_organization }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="searchError" class="error-box">
                ⚠️ {{ searchError }}
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BackToHome from '@/components/BackToHome.vue'
import Button from '@/components/Button.vue'

export default {
    name: 'IpLookup',
    components: {
        BackToHome,
        Button
    },
    setup() {
        const ipv4Info = ref(null)
        const ipv6Info = ref(null)
        const ipv6Loading = ref(true)
        const myInfo = ref(null) // 用於存儲基本資訊
        const searchIp = ref('')
        const searchResult = ref(null)
        const isSearching = ref(false)
        const searchError = ref('')

        const fetchIpv4 = async () => {
            try {
                const response = await fetch('https://api.ip.sb/geoip/')
                const data = await response.json()

                // 儲存基本資訊
                myInfo.value = data

                // 判斷是 IPv4 還是 IPv6
                if (data.ip && !data.ip.includes(':')) {
                    ipv4Info.value = data
                } else if (data.ip && data.ip.includes(':')) {
                    ipv6Info.value = data
                }
            } catch (error) {
                console.error('獲取 IP 失敗:', error)
            }
        }

        const fetchIpv6 = async () => {
            try {
                const response = await fetch('https://api-ipv6.ip.sb/geoip/', {
                    signal: AbortSignal.timeout(3000)
                })
                const data = await response.json()

                // 只有當返回的是 IPv6 時才設置
                if (data.ip && data.ip.includes(':')) {
                    ipv6Info.value = data
                    // 如果還沒有基本資訊，使用 IPv6 的資訊
                    if (!myInfo.value) {
                        myInfo.value = data
                    }
                }
            } catch (error) {
                console.error('IPv6 不支援或獲取失敗:', error)
            } finally {
                ipv6Loading.value = false
            }
        }

        const searchCustomIp = async () => {
            if (isSearching.value || !searchIp.value.trim()) return

            searchError.value = ''
            searchResult.value = null
            isSearching.value = true

            try {
                const response = await fetch(`https://api.ip.sb/geoip/${searchIp.value.trim()}`)

                if (!response.ok) {
                    throw new Error('查詢失敗，請檢查 IP 地址是否正確')
                }

                const data = await response.json()
                searchResult.value = data
            } catch (error) {
                console.error('IP 查詢失敗:', error)
                searchError.value = error.message || '查詢失敗，請稍後再試'
            } finally {
                isSearching.value = false
            }
        }

        const copyToClipboard = async (text) => {
            try {
                await navigator.clipboard.writeText(text)
                alert('已複製到剪貼簿！')
            } catch (error) {
                console.error('複製失敗:', error)
                alert('複製失敗，請手動複製')
            }
        }

        onMounted(() => {
            fetchIpv4()
            setTimeout(() => {
                fetchIpv6()
            }, 500)
        })

        return {
            ipv4Info,
            ipv6Info,
            ipv6Loading,
            myInfo,
            searchIp,
            searchResult,
            isSearching,
            searchError,
            searchCustomIp,
            copyToClipboard
        }
    }
}
</script>

<style scoped>
.ip-lookup-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    padding-top: 4rem;
}

/* 搜尋框 */
.search-box {
    display: flex;
    gap: 0;
    margin-bottom: 2rem;
}

.search-input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 4px 0 0 4px;
    background-color: #fff;
    color: #333;
    font-size: 0.95rem;
    outline: none;
}

.search-btn {
    border-radius: 0 4px 4px 0 !important;
    padding: 0.875rem 2rem !important;
}

/* 資訊區塊 */
.info-section {
    background: #2c3e50;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #34495e;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    text-align: center;
    min-height: 60px;
}

.info-label {
    font-size: 0.85rem;
    color: #95a5a6;
    font-weight: 500;
}

.info-value {
    font-size: 0.95rem;
    color: #ecf0f1;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    word-break: break-all;
    max-width: 100%;
    overflow-wrap: break-word;
}

.info-value.loading {
    color: #7f8c8d;
}

.info-value.not-supported {
    color: #95a5a6;
}

.clickable-value {
    cursor: pointer;
    transition: color 0.2s;
}

.clickable-value:hover {
    color: #3498db;
    text-decoration: underline;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    opacity: 0.6;
    transition: opacity 0.2s;
    padding: 0;
}

.copy-btn:hover {
    opacity: 1;
}

/* 查詢結果 */
.result-section {
    background: #34495e;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.result-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 2rem;
}

.result-map {
    background: #2c3e50;
    border-radius: 8px;
    overflow: hidden;
    height: 200px;
}

.map-placeholder {
    width: 100%;
    height: 150px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.map-marker {
    font-size: 2rem;
}

.map-text {
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: center;
}

.result-info {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

.result-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
}

.result-label {
    font-size: 0.85rem;
    color: #95a5a6;
    min-width: 120px;
    font-weight: 500;
    text-align: right;
}

.result-value {
    font-size: 0.95rem;
    color: #ecf0f1;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.error-box {
    background: #e74c3c;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

/* 響應式 */
@media (max-width: 768px) {
    .ip-lookup-container {
        padding: 1rem;
        padding-top: 5rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .result-layout {
        grid-template-columns: 1fr;
    }

    .result-map {
        height: 120px;
    }
}
</style>
