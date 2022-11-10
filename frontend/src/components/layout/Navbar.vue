<template>
  <div>
    <Toolbar>
      <template #start>
        <ol class="list-none m-0 p-0 flex flex-row align-items-center font-semibold">
          <li class="mr-2"><router-link :to="{ name: 'home' }">Home</router-link></li>
          <li class="mr-2"><router-link :to="{ name: 'myBuckets' }">My Buckets</router-link></li>
          <li class="mr-2"><router-link :to="{ name: 'addBucket' }">Add Bucket</router-link></li>
          <li class="mr-2"><router-link :to="{ name: 'developer' }">Developer</router-link></li>
        </ol>
      </template>
    </Toolbar>
  </div>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
</script>

<style lang="scss" scoped>
.p-toolbar {
  padding: 0px 50px 0px 50px;
}
</style>
