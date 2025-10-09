<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ButtonLogout from "@/shared/presentation/components/button-logout.vue";

const menuItems = [
  {
    route: '/layout-workshop/profile',
    icon: 'user',
    label: 'side-bar-workshop.profile'
  },
  {
    route: '/layout-workshop/home-workshop',
    icon: 'category',
    label: 'side-bar-workshop.dashboard'
  },
  {
    route: '/layout-workshop/workshop',
    icon: 'tool',
    label: 'side-bar-workshop.workshop'
  },
  {
    route: '/layout-workshop/requests',
    icon: 'clipboard',
    label: 'side-bar-workshop.requests'
  },
  {
    route: '/layout-workshop/manage-technicians/technicians',
    icon: 'users',
    label: 'side-bar-workshop.manageTechnicians'
  },
  {
    route: '/layout-workshop/maintenance-tracking/status-vehicle',
    icon: 'diamonds',
    label: 'side-bar-workshop.statusVehicles'
  },
  {
    route: '/layout-workshop/settings',
    icon: 'settings-bolt',
    label: 'side-bar-workshop.settings'
  },
];


const router = useRouter()
const route = useRoute()
const { t } = useI18n({ useScope: 'global' })


function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}


function go(path: string) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="user-profile">
      <div class="user-avatar">
        <img src="/assets/images/manager_workshop.png" alt="Taller Automotriz" />
      </div>
    </div>


    <nav class="sidebar-nav">
      <ul>
        <li
            v-for="item in menuItems"
            :key="item.route"
            class="nav-item"
            :class="{ active: isActive(item.route) }"
            @click="go(item.route)"
        >
          <svg class="nav-icon">
            <use :href="`/assets/icons/sprite.symbol.svg#${item.icon}`"></use>
          </svg>
          <span>{{ t(item.label) }}</span>
        </li>
      </ul>
    </nav>


    <div class="sidebar-footer">
      <ButtonLogout />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 230px;
  background-color: var(--color-primary);
  color: var(--color-light);
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.5rem 0;
  flex-shrink: 0;
  overflow-y: auto;
}

.user-profile {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-light);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: var(--font-medium);
  font-weight: 500;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
}

.nav-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.875rem;
  fill: currentColor;
  flex-shrink: 0;
}

.nav-item span {
  font-size: 0.95rem;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  margin-bottom: 230px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 80px;
    flex-direction: row;
    padding: 0.5rem 1rem;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .user-profile {
    margin-bottom: 0;
    margin-right: 1rem;
    padding: 0;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    border-width: 2px;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: hidden;
    overflow-x: auto;
  }

  .sidebar-nav ul {
    display: flex;
    gap: 0.5rem;
    padding: 0 1rem;
  }

  .nav-item {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    min-width: fit-content;
  }

  .nav-item span {
    font-size: 0.85rem;
  }

  .nav-icon {
    width: 16px;
    height: 16px;
    margin-right: 0.5rem;
  }

  .sidebar-footer {
    padding: 0.5rem;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .sidebar {
    height: 70px;
    padding: 0.25rem 0.5rem;
  }

  .user-profile {
    margin-right: 0.5rem;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
  }

  .nav-item {
    padding: 0.375rem 0.75rem;
  }

  .nav-item span {
    font-size: 0.8rem;
  }

  .nav-icon {
    width: 14px;
    height: 14px;
    margin-right: 0.375rem;
  }

  .sidebar-footer {
    padding: 0.25rem;
  }
}

/* Sidebar collapsed state for very small screens */
@media (max-width: 320px) {
  .sidebar {
    height: 60px;
  }

  .user-profile {
    display: none;
  }

  .nav-item span {
    display: none;
  }

  .nav-item {
    padding: 0.5rem;
    justify-content: center;
  }

  .nav-icon {
    margin-right: 0;
  }
}
</style>