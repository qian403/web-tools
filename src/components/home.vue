<template>
  <div class="toolbox">
    <div class="toolbox-title">
      <h1>工具箱</h1>
    </div>
    <input v-model="searchQuery" type="text" placeholder="搜尋工具..." class="search-input" />
    <div class="tools-grid">
      <router-link v-for="tool in internalTools" :key="tool.name" :to="tool.path" class="tool-link">
        <div class="tool-button">
          {{ tool.name }}
        </div>
      </router-link>
      <a v-for="tool in externalTools" :key="tool.name" :href="tool.path" target="_blank" class="tool-link">
        <div class="tool-button">
          {{ tool.name }}
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
export default {
  name: 'HomeComponent',
  setup() {
    const searchQuery = ref('');

    const tools = [
      { name: 'Blog', path: 'https://blog.qian30.net', isExternal: true },
      { name: 'clock', path: '/clock', isExternal: false },
      { name: 'password-generator',path: '/password-generator',isExternal: false }
    ];

    const filteredTools = computed(() =>
      tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    const internalTools = computed(() =>
      filteredTools.value.filter(tool => !tool.isExternal)
    );

    const externalTools = computed(() =>
      filteredTools.value.filter(tool => tool.isExternal)
    );

    return {
      searchQuery,
      internalTools,
      externalTools
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

.tools-grid {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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

.tools-grid {
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
