<script setup lang="ts">
import { ref } from 'vue';
import SideBar from './components/SideBar.vue';

const isSidebarCollapsed = ref(true); // Colapsado por defecto

const handleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed;
};
</script>

<template>
  <div class="min-h-screen bg-gray-950">
    <SideBar @collapse="handleSidebarCollapse" />
    
    <!-- Main content area -->
    <div 
      :class="[
        'min-h-screen transition-all duration-300',
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      ]"
    >
      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
