<script setup lang="ts">
import Login from '../Login.vue';
</script>

<template>
  <header>
    <nav id="header-branding">
      <div class="grid align-items-center justify-content-center">
        <div class="col-fixed">
          <a href="https://www2.gov.bc.ca">
            <img
              src="@/assets/images/bc_logo.svg"
              width="181"
              height="44"
              alt="B.C. Government Logo"
            />
          </a>
        </div>
        <div class="col">
          <div
            id="title-branding"
            class="justify-content-left"
          >
            <h1>BCBox</h1>
          </div>
        </div>
        <div class="col-fixed">
          <Login />
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
#header-branding {
  background-color: #2e57a4;
  font-size: 13px;
  color: white;
  padding: 10px 50px 0px 50px;
  white-space: nowrap;
}

#title-branding {
  padding-left: 10px;
  font-size: 20px;
  > h1 {
    font-weight: 600;
  }
}
</style>
