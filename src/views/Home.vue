<template>
    <div class="toolbox">
        <div class="toolbox-title">
            <h1>工具箱</h1>
        </div>
        <input v-model="searchQuery" type="text" placeholder="搜尋工具或分類..." class="search-input" />
        <div class="categories-container">
            <div v-if="categories.length === 0" class="no-results">
                <p>沒有找到相關的工具</p>
            </div>
            <div v-for="category in categories" :key="category" class="category-section">
                <h2 class="category-title">{{ category }}</h2>
                <div class="tools-grid">
                    <router-link v-for="tool in groupedTools[category].filter(t => !t.isExternal)" :key="tool.name"
                        :to="tool.path" class="tool-link">
                        <div class="tool-button">
                            {{ tool.name }}
                        </div>
                    </router-link>
                    <a v-for="tool in groupedTools[category].filter(t => t.isExternal)" :key="tool.name"
                        :href="tool.path" target="_blank" class="tool-link">
                        <div class="tool-button">
                            {{ tool.name }}
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
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
            }
        ];

        const filteredTools = computed(() => {
            if (!searchQuery.value) return tools;

            const query = searchQuery.value.toLowerCase();
            return tools.filter(tool => {
                // 搜尋工具名稱（中英文）
                const nameMatch = tool.name.toLowerCase().includes(query) ||
                    (tool.nameZh && tool.nameZh.toLowerCase().includes(query));

                // 搜尋分類名稱（中英文）
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

        return {
            searchQuery,
            groupedTools,
            categories
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
    background: linear-gradient(145deg, #0072E3, #66B3FF, #0072E3);
    text-align: center;
    border-radius: 8px;
    transition: transform 0.3s ease;
    background-size: 300% 300%;
    background-position: left center;
    position: relative;
    overflow: hidden;
}

.tool-button:hover {
    transform: scale(1.1);
    z-index: 1;
    animation: backgroundMove 3s ease infinite;
}

@keyframes backgroundMove {
    0% {
        background-position: left center;
    }

    50% {
        background-position: right center;
    }

    100% {
        background-position: left center;
        background-color: #2d3748;
    }
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