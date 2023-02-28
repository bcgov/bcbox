<script setup lang="ts">
import { Header, Footer } from '@/components/layout';
</script>

<template>
  <div class="layout-app">
    <!-- Header/Nav -->
    <div class="layout-head">
      <Header />
      <slot name="nav" />
    </div>

    <!-- Main views -->
    <main class="layout-container">
      <slot name="main" />
    </main>

    <!-- Footer -->
    <footer class="layout-footer">
      <Footer />
    </footer>
  </div>
</template>

<style scoped lang="scss">
.layout-app {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 100vh;
  width: 100%;
  .layout-head {
    flex: 0;
    width: 100%;
  }
  .layout-container {
    flex: 1;
    padding-top: 20px;
    padding-left: 100px;
    padding-right: 100px;
    width: 100%;
  }
  .layout-footer {
    width: 100%;
  }
}
</style>
