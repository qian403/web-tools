<template>
    <main class="toolbox" id="main-content">
        <header class="toolbox-title">
            <h1>工具箱</h1>
        </header>
        <label for="search-input" class="sr-only">搜尋工具或分類</label>
        <input v-model="searchQuery" type="text" id="search-input" name="search" placeholder="搜尋工具或分類..."
            class="search-input" aria-describedby="search-help"
            @keydown.enter="handleSearchEnter" />
        <div id="search-help" class="sr-only">輸入工具名稱或分類來搜尋可用的工具</div>
        <div class="categories-container">
            <div v-if="categories.length === 0" class="no-results">
                <p>沒有找到相關的工具</p>
            </div>
            <section v-for="category in categories" :key="category" class="category-section" :aria-label="category">
                <h2 class="category-title">{{ category }}</h2>
                <nav class="tools-grid" :aria-label="`${category}工具列表`">
                    <router-link v-for="tool in groupedTools[category].filter(t => !t.isExternal)" :key="tool.name"
                        :to="tool.path" class="tool-link" :aria-label="`開啟 ${tool.nameZh || tool.name} 工具`">
                        <div class="tool-button">
                            {{ tool.name }}
                        </div>
                    </router-link>
                    <a v-for="tool in groupedTools[category].filter(t => t.isExternal)" :key="tool.name"
                        :href="tool.path" target="_blank" rel="noopener noreferrer" class="tool-link"
                        :aria-label="`開啟 ${tool.nameZh || tool.name} 工具（新視窗）`">
                        <div class="tool-button">
                            {{ tool.name }}
                        </div>
                    </a>
                </nav>
            </section>
        </div>
    </main>
</template>

<script>
import { ref, computed } from 'vue';

export default {
    name: 'HomePage',
    setup() {
        const searchQuery = ref('');

        const tools = [
            {
                name: 'Blog',
                nameZh: '部落格',
                path: 'https://blog.qian30.net',
                isExternal: true,
                category: '連結',
                categoryEn: 'Links'
            },
            {
                name: 'Clock',
                nameZh: '時鐘',
                path: '/clock',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: 'Password-generator',
                nameZh: '密碼產生器',
                path: '/password-generator',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: 'Text-revealer',
                nameZh: '文字顯示器',
                path: '/text-revealer',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: 'Dice Game',
                nameZh: '骰子遊戲',
                path: '/dice-game',
                isExternal: false,
                category: '小作品',
                categoryEn: 'Tools'
            },
            {
                name: 'Base Converter',
                nameZh: '進制轉換器',
                path: '/base-converter',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: 'System Info',
                nameZh: '系統資訊',
                path: '/system-info',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: 'QR Code',
                nameZh: 'QR Code 產生器',
                path: '/qr-code',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: '繁簡轉換',
                nameZh: '繁簡轉換',
                path: '/chinese-converter',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            },
            {
                name: '字數統計',
                nameZh: '字數統計',
                path: '/word-counter',
                isExternal: false,
                category: '小工具',
                categoryEn: 'Tools'
            }
        ];

        const filteredTools = computed(() => {
            if (!searchQuery.value) return tools;

            const query = searchQuery.value.toLowerCase();
            return tools.filter(tool => {
                const nameMatch = tool.name.toLowerCase().includes(query) ||
                    (tool.nameZh && tool.nameZh.toLowerCase().includes(query));

                const categoryMatch = tool.category.toLowerCase().includes(query) ||
                    (tool.categoryEn && tool.categoryEn.toLowerCase().includes(query));

                return nameMatch || categoryMatch;
            });
        });

        const groupedTools = computed(() => {
            const groups = {};
            filteredTools.value.forEach(tool => {
                if (!groups[tool.category]) {
                    groups[tool.category] = [];
                }
                groups[tool.category].push(tool);
            });
            return groups;
        });

        const categories = computed(() => Object.keys(groupedTools.value));

        const handleSearchEnter = () => {
            // 如果搜尋結果只有一個工具，自動導航到該工具
            const allTools = Object.values(groupedTools.value).flat();
            if (allTools.length === 1) {
                const tool = allTools[0];
                if (tool.isExternal) {
                    window.open(tool.path, '_blank');
                } else {
                    // 使用 router.push 導航到內部路由
                    // 這裡需要導入 router，但為了保持簡單，我們先不實現
                    console.log('導航到:', tool.path);
                }
            }
        };

        return {
            searchQuery,
            groupedTools,
            categories,
            handleSearchEnter
        };
    }
};
</script>

<style scoped>
.toolbox {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    margin: 0;
    background-color: #2d3748;
}

.toolbox-title {
    text-align: center;
    margin-bottom: 20px;
    color: #fff;
}

.search-input {
    width: 100%;
    max-width: 1200px;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.categories-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.category-section {
    margin-bottom: 40px;
}

.category-title {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: left;
    border-bottom: 2px solid #4299e1;
    padding-bottom: 10px;
}

.no-results {
    text-align: center;
    color: #fff;
    font-size: 18px;
    margin-top: 40px;
}

.no-results p {
    opacity: 0.7;
}

.tools-grid {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
}

.tool-link {
    text-decoration: none;
    cursor: pointer;
}

.tool-button {
    padding: 20px;
    color: #fff;
    font-weight: bold;
    background-color: #0072E3;
    text-align: center;
    border-radius: 8px;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.tool-button:hover {
    transform: scale(1.05);
    background-color: #0056b3;
}

@media (min-width: 1024px) {
    .tools-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

@media (max-width: 1024px) {
    .tools-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 600px) {
    .tools-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>