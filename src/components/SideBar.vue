<template>
  <div>
    <!-- Backdrop for mobile -->
    <div 
      v-if="isOpen"
      @click="closeSidebar"
      class="sidebar-backdrop"
    ></div>

    <!-- Touch area for swipe gesture (mobile only) -->
    <div 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      class="sidebar-touch-area"
    ></div>

    <!-- Sidebar -->
    <aside 
      @touchstart="handleSidebarTouchStart"
      @touchmove="handleSidebarTouchMove"
      @touchend="handleSidebarTouchEnd"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :class="[
        'sidebar',
        {
          'is-open': isOpen,
          'is-collapsed': isCollapsed,
          'is-expanded': !isCollapsed
        }
      ]"
      :style="{ transform: dragging ? `translateX(${dragOffset}px)` : '' }"
    >
      <div class="sidebar-inner">
        <!-- Logo/Header -->
        <div class="sidebar-header">
          <h1 class="sidebar-logo-title">
            <span class="logo-mobile">N4 Dashboard</span>
            <span class="logo-desktop">{{ isCollapsed ? 'N4' : 'N4 Dashboard' }}</span>
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <!-- Monitoreo de Naves Section -->
          <div class="nav-section" :class="{ 'is-expanded': !isCollapsed }">
            <h2 
              class="section-title"
              :class="{ 'desktop-visible': !isCollapsed }"
            >
              Monitoreo de Naves
            </h2>
            <div class="section-divider" :class="{ 'desktop-hidden': !isCollapsed }"></div>
            <ul class="nav-list">
              <li>
                <router-link
                  to="/monitoreo/carga-general"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'nav-link',
                    { 'is-expanded': !isCollapsed }
                  ]"
                  active-class="is-active"
                >
                  <svg class="nav-icon" :class="{ 'with-margin': !isCollapsed }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span class="nav-label" :class="{ 'desktop-visible': !isCollapsed }">Carga General</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Citas Section -->
          <div class="nav-section" :class="{ 'is-expanded': !isCollapsed }">
            <h2 
              class="section-title"
              :class="{ 'desktop-visible': !isCollapsed }"
            >
              Citas
            </h2>
            <div class="section-divider" :class="{ 'desktop-hidden': !isCollapsed }"></div>
            <ul class="nav-list">
              <li>
                <router-link
                  to="/citas/en-proceso"
                  @click="closeSidebarOnMobile"
                  :class="[
                    'nav-link',
                    { 'is-expanded': !isCollapsed }
                  ]"
                  active-class="is-active"
                >
                  <svg class="nav-icon" :class="{ 'with-margin': !isCollapsed }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="nav-label" :class="{ 'desktop-visible': !isCollapsed }">En Proceso</span>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Footer (optional) -->
        <div class="sidebar-footer" :class="{ 'desktop-visible': !isCollapsed }">
          <p class="sidebar-footer-text">© 2026 Carlos Escate</p>
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
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;
}

.sidebar-touch-area {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 2rem;
  z-index: 20;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 16rem;
  background: #111827;
  color: #ffffff;
  z-index: 40;
  transform: translateX(-100%);
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 4rem;
  border-bottom: 1px solid #374151;
}

.sidebar-logo-title {
  margin: 0;
  font-weight: 700;
  color: #818cf8;
  transition: font-size 0.3s ease;
  font-size: 1.25rem;
}

.logo-mobile {
  display: inline;
}

.logo-desktop {
  display: none;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-section {
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-divider {
  display: none;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  padding: 0.5rem 0.75rem;
  color: inherit;
  text-decoration: none;
}

.nav-link:hover {
  background: #1f2937;
}

.nav-link.is-active {
  background: #4f46e5;
}

.nav-link.is-active:hover {
  background: #4338ca;
}

.nav-icon {
  height: 1.25rem;
  width: 1.25rem;
  flex-shrink: 0;
  margin-right: 0.75rem;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  border-top: 1px solid #374151;
  padding: 1rem;
}

.sidebar-footer-text {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

@media (min-width: 1024px) {
  .sidebar-backdrop,
  .sidebar-touch-area {
    display: none;
  }

  .sidebar {
    transform: translateX(0);
    width: 5rem;
  }

  .sidebar.is-expanded {
    width: 16rem;
  }

  .sidebar-logo-title {
    font-size: 1rem;
  }

  .sidebar.is-expanded .sidebar-logo-title {
    font-size: 1.25rem;
  }

  .logo-mobile {
    display: none;
  }

  .logo-desktop {
    display: inline;
  }

  .nav-section {
    padding: 0 0.5rem;
  }

  .nav-section.is-expanded {
    padding: 0 1rem;
  }

  .section-title {
    display: none;
  }

  .section-title.desktop-visible {
    display: block;
  }

  .section-divider {
    display: block;
    border-bottom: 1px solid #374151;
    margin-bottom: 0.5rem;
  }

  .section-divider.desktop-hidden {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }

  .nav-link.is-expanded {
    justify-content: flex-start;
    padding: 0.5rem 0.75rem;
  }

  .nav-icon {
    margin-right: 0;
  }

  .nav-icon.with-margin {
    margin-right: 0.75rem;
  }

  .nav-label {
    display: none;
  }

  .nav-label.desktop-visible {
    display: inline;
  }

  .sidebar-footer {
    display: none;
  }

  .sidebar-footer.desktop-visible {
    display: block;
  }
}
</style>