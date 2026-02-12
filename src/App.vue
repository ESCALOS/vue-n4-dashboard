<script setup lang="ts">
import { ref } from 'vue';
import SideBar from './components/SideBar.vue';

const isSidebarCollapsed = ref(true); // Colapsado por defecto

const handleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed;
};
</script>

<template>
  <div class="app-shell">
    <SideBar @collapse="handleSidebarCollapse" />
    
    <!-- Main content area -->
    <div 
      :class="[
        'app-content-wrapper',
        {
          'is-sidebar-collapsed': isSidebarCollapsed,
          'is-sidebar-expanded': !isSidebarCollapsed
        }
      ]"
    >
      <!-- Page content -->
      <main class="app-main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #030712;
}

.app-content-wrapper {
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.app-main-content {
  padding: 1rem;
}

@media (min-width: 640px) {
  .app-main-content {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .app-content-wrapper.is-sidebar-collapsed {
    margin-left: 5rem;
  }

  .app-content-wrapper.is-sidebar-expanded {
    margin-left: 16rem;
  }

  .app-main-content {
    padding: 2rem;
  }
}
</style>
