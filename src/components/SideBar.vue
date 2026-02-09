<template>
  <div>
    <!-- Backdrop for mobile -->
    <div 
      v-if="isOpen"
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>

    <!-- Touch area for swipe gesture (mobile only) -->
    <div 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      class="lg:hidden fixed top-0 left-0 h-full w-8 z-20"
    ></div>

    <!-- Sidebar -->
    <aside 
      @touchstart="handleSidebarTouchStart"
      @touchmove="handleSidebarTouchMove"
      @touchend="handleSidebarTouchEnd"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :class="[
        'fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-40',
        'w-64 lg:w-auto',
        isCollapsed ? 'lg:w-20' : 'lg:w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      :style="{ transform: dragging ? `translateX(${dragOffset}px)` : '' }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo/Header -->
        <div class="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 
            :class="[
              'font-bold text-indigo-400 transition-all duration-300',
              'text-xl lg:text-base',
              !isCollapsed && 'lg:text-xl'
            ]"
          >
            <span class="lg:hidden">N4 Dashboard</span>
            <span class="hidden lg:inline">{{ isCollapsed ? 'N4' : 'N4 Dashboard' }}</span>
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <!-- Monitoreo de Naves Section -->
          <div class="px-4 lg:px-2 lg:group-hover:px-4 mb-6" :class="!isCollapsed && 'lg:px-4'">
            <h2 
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 lg:hidden"
              :class="!isCollapsed && 'lg:block'"
            >
              Monitoreo de Naves
            </h2>
            <div class="border-b border-gray-700 mb-2 hidden lg:block" :class="!isCollapsed && 'lg:hidden'"></div>
            <ul class="space-y-1">
              <li>
                <router-link
                  to="/monitoreo/carga-general"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'flex items-center rounded-lg hover:bg-gray-800 transition-colors',
                    'px-3 py-2',
                    'lg:justify-center lg:p-3',
                    !isCollapsed && 'lg:px-3 lg:py-2 lg:justify-start'
                  ]"
                  active-class="bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg class="h-5 w-5 shrink-0 mr-3 lg:mr-0" :class="!isCollapsed && 'lg:mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span class="whitespace-nowrap lg:hidden" :class="!isCollapsed && 'lg:inline'">Carga General</span>
                </router-link>
              </li>
              <li>
                <router-link
                  to="/monitoreo/contenedores"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'flex items-center rounded-lg hover:bg-gray-800 transition-colors',
                    'px-3 py-2',
                    'lg:justify-center lg:p-3',
                    !isCollapsed && 'lg:px-3 lg:py-2 lg:justify-start'
                  ]"
                  active-class="bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg class="h-5 w-5 shrink-0 mr-3 lg:mr-0" :class="!isCollapsed && 'lg:mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span class="whitespace-nowrap lg:hidden" :class="!isCollapsed && 'lg:inline'">Contenedores</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Citas Section -->
          <div class="px-4 lg:px-2" :class="!isCollapsed && 'lg:px-4'">
            <h2 
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 lg:hidden"
              :class="!isCollapsed && 'lg:block'"
            >
              Citas
            </h2>
            <div class="border-b border-gray-700 mb-2 hidden lg:block" :class="!isCollapsed && 'lg:hidden'"></div>
            <ul class="space-y-1">
              <li>
                <router-link
                  to="/citas/pendientes"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'flex items-center rounded-lg hover:bg-gray-800 transition-colors',
                    'px-3 py-2',
                    'lg:justify-center lg:p-3',
                    !isCollapsed && 'lg:px-3 lg:py-2 lg:justify-start'
                  ]"
                  active-class="bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg class="h-5 w-5 shrink-0 mr-3 lg:mr-0" :class="!isCollapsed && 'lg:mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="whitespace-nowrap lg:hidden" :class="!isCollapsed && 'lg:inline'">Pendientes</span>
                </router-link>
              </li>
              <li>
                <router-link
                  to="/citas/en-proceso"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'flex items-center rounded-lg hover:bg-gray-800 transition-colors',
                    'px-3 py-2',
                    'lg:justify-center lg:p-3',
                    !isCollapsed && 'lg:px-3 lg:py-2 lg:justify-start'
                  ]"
                  active-class="bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg class="h-5 w-5 shrink-0 mr-3 lg:mr-0" :class="!isCollapsed && 'lg:mr-3'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="whitespace-nowrap lg:hidden" :class="!isCollapsed && 'lg:inline'">En Proceso</span>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Footer (optional) -->
        <div class="border-t border-gray-700 p-4 lg:hidden" :class="!isCollapsed && 'lg:block'">
          <p class="text-xs text-gray-500 text-center">© 2026 Carlos Escate</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isOpen = ref(false);
const isCollapsed = ref(true); // Colapsado por defecto en desktop
const dragging = ref(false);
const dragOffset = ref(0);
const touchStartX = ref(0);

const emit = defineEmits<{
  collapse: [collapsed: boolean]
}>();

onMounted(() => {
  // Emitir el estado inicial del colapso
  if (window.innerWidth >= 1024) {
    emit('collapse', true);
  }
});

const handleMouseEnter = () => {
  if (window.innerWidth >= 1024) {
    isCollapsed.value = false;
    emit('collapse', false);
  }
};

const handleMouseLeave = () => {
  if (window.innerWidth >= 1024) {
    isCollapsed.value = true;
    emit('collapse', true);
  }
};

const closeSidebar = () => {
  isOpen.value = false;
};

const closeSidebarOnMobile = () => {
  // Close sidebar on mobile when a link is clicked
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
};

// Swipe from left edge to open
const handleTouchStart = (e: TouchEvent) => {
  if (window.innerWidth >= 1024 || !e.touches[0]) return;
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e: TouchEvent) => {
  if (window.innerWidth >= 1024 || !e.touches[0]) return;
  const touchX = e.touches[0].clientX;
  const diff = touchX - touchStartX.value;
  
  if (diff > 10 && !isOpen.value) {
    isOpen.value = true;
  }
};

const handleTouchEnd = () => {
  if (window.innerWidth >= 1024) return;
};

// Swipe on sidebar to close
const handleSidebarTouchStart = (e: TouchEvent) => {
  if (window.innerWidth >= 1024 || !isOpen.value || !e.touches[0]) return;
  touchStartX.value = e.touches[0].clientX;
  dragging.value = true;
};

const handleSidebarTouchMove = (e: TouchEvent) => {
  if (window.innerWidth >= 1024 || !isOpen.value || !dragging.value || !e.touches[0]) return;
  const touchX = e.touches[0].clientX;
  const diff = touchX - touchStartX.value;
  
  if (diff < 0) {
    dragOffset.value = diff;
  }
};

const handleSidebarTouchEnd = () => {
  if (window.innerWidth >= 1024 || !dragging.value) return;
  
  if (dragOffset.value < -100) {
    closeSidebar();
  }
  
  dragging.value = false;
  dragOffset.value = 0;
};
</script>

<style scoped>
</style>