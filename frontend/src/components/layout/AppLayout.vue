<script setup lang="ts">
import { Header, Footer } from '@/components/layout';
</script>

<template>
  <div class="w-full min-h-screen flex flex-column">
    <!-- Header/Nav -->
    <div class="layout-head">
      <Header />
      <slot name="nav" />
    </div>

    <!-- Main views -->
    <main class="layout-main pt-3 flex-auto">
      <slot name="main" />
    </main>

    <!-- Footer -->
    <footer class="flex-shrink-0">
      <Footer />
    </footer>
  </div>
</template>
