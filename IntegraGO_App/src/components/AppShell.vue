<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { ref } from "vue";
import FloatingTabBar from "./FloatingTabBar.vue";
withDefaults(defineProps<{ tabs?: boolean; pageClass?: string }>(), {
  tabs: true,
  pageClass: "",
});
const content = ref<InstanceType<typeof IonContent>>();
defineExpose({ scrollToTop: () => content.value?.$el.scrollToTop(0) });
</script>
<template>
  <IonPage :class="pageClass">
    <IonContent ref="content" :scroll-events="false">
      <main class="page-container" :class="{ 'with-tabs': tabs }">
        <slot />
      </main>
    </IonContent>
    <FloatingTabBar v-if="tabs" />
  </IonPage>
</template>
