<script setup lang="ts">
import { Avatar, Button, Drawer, Popover } from 'primevue';
import SideBarTab, { SideBarTabInterface } from './components/SideBarTab.vue';
import { computed, ComputedRef, ref, watch } from 'vue';
import { userOps } from '@/api/auth';
import router from '@/router';
import { RouteLocationAsRelativeGeneric, useRoute } from 'vue-router';
const visible = defineModel<boolean>();

const { username } = defineProps<{ username: string }>();

const avatarPopup = ref();
const handleLogout = () => {
  userOps.logout();
  router.push({ name: 'auth' });
};

const tabs: SideBarTabInterface[] = [
  { name: 'search', icon: 'pi pi-search', route: { name: 'search' } },
  { name: 'overview', icon: 'pi pi-home', route: { name: 'home' } },
  { name: 'note', icon: 'pi pi-pen-to-square', route: { name: 'note' } },
];

const route = useRoute();
const currentTabIndex = computed(() =>
  tabs.findIndex(tab => (tab.route as RouteLocationAsRelativeGeneric).name === route.name)
);

</script>

<template>
  <Drawer v-model:visible="visible" :modal="false" :dismissable="false"
    class="w-sidebar! static! px-2 py-4 flex flex-col items-center bg-primary-100!">
    <template #container="{ }"><!-- closeCallback -->
      <h2 class="text-lg text-center font-bold">Todo-Note</h2>
      <div class="w-full relative">
        <div class="w-full h-[35px] absolute bg-primary rounded-md transition-all duration-300"
          :style="{ top: `${currentTabIndex * 35}px` }" />
        <SideBarTab v-bind:key="tab.name" v-for="(tab, index) in tabs" :name="tab.name" :icon="tab.icon"
          :route="tab.route" :is-current="index === currentTabIndex">
        </SideBarTab>
      </div>
      <div class="mt-auto flex flex-col items-center gap-2">
        <p class="font-bold">{{ username }}</p>
        <div @click="(event) => avatarPopup.toggle(event)">
          <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
          <Popover ref="avatarPopup">
            <div class="p-2">
              <Button class="block" label="Logout" severity="secondary" @click="handleLogout">Logout</Button>
            </div>
          </Popover>
        </div>
      </div>
    </template>

  </Drawer>
</template>