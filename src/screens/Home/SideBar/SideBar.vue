<script setup lang="ts">
import { Avatar, Button, Drawer, Popover, Divider } from 'primevue';
import SideBarTab, { SideBarTabInterface } from './components/SideBarTab.vue';
import { computed, ComputedRef, ref, watch } from 'vue';
import { userOps } from '@/api/auth/auth';
import router from '@/router';
import { RouteLocationAsRelativeGeneric, useRoute } from 'vue-router';
import Icon from '@/components/Icon.vue';
const visible = defineModel<boolean>();

const { username, email } = defineProps<{ username?: string, email?: string }>();

const avatarPopup = ref();
const handleLogout = () => {
  userOps.logout();
  router.push({ name: 'auth' });
};

const tabs: SideBarTabInterface[] = [
  { name: 'overview', icon: 'pi pi-home', route: { name: 'home' } },
  { name: 'todos', icon: 'pi pi-check-square', route: { name: 'todos' } },
  { name: 'note', icon: 'pi pi-pen-to-square', route: { name: 'note' } },
];

const route = useRoute();
const currentTabIndex = computed(() =>
  route.name === 'note_detail' ? 2 : tabs.findIndex(tab => (tab.route as RouteLocationAsRelativeGeneric).name === route.name)
);

</script>

<template>
  <Drawer v-model:visible="visible" :modal="false" :dismissable="false"
    class="w-sidebar! static! px-2 py-4 flex flex-col items-center bg-primary-100!">
    <template #container="{ }"><!-- closeCallback -->
      <Icon class="bg-amber-50 rounded-xl mb-2.5" />
      <div class="w-full relative">
        <div class="w-full h-[35px] absolute bg-primary rounded-md transition-all duration-300"
          :style="{ top: `${currentTabIndex * 45}px` }" />
        <SideBarTab v-bind:key="tab.name" v-for="(tab, index) in tabs" :name="tab.name" :icon="tab.icon"
          :route="tab.route" :is-current="index === currentTabIndex">
        </SideBarTab>
      </div>
      <div class="mt-auto flex flex-col items-center gap-2">
        <div @click="(event) => avatarPopup.toggle(event)">
          <Avatar icon="pi pi-user" size="large" shape="circle" />
          <Popover ref="avatarPopup">
            <div class="p-2 w-90">
              <div class="flex flex-row gap-3 mb-3 overflow-hidden">
                <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
                <div class="overflow-hidden flex-1">
                  <p class="font-bold text-2xl truncate text-ellipsis">{{ username ?? "---" }}</p>
                  <p class="text-lg truncate text-ellipsis">{{ email ?? "---" }}</p>
                </div>
              </div>
              <Button class="w-full block" label="Logout" severity="secondary" @click="handleLogout">
                Logout
              </Button>
            </div>
          </Popover>
        </div>
      </div>
    </template>

  </Drawer>
</template>