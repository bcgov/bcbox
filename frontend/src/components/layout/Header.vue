<script setup lang="ts">
import LoginButton from './LoginButton.vue';
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
          <LoginButton />
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
#header-branding {
  background-color: #003366;
  font-size: 13px;
  color: white;
  padding: 0.5rem 3rem 0rem 3rem;
  white-space: nowrap;
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;
  @media not print {
    border-bottom: 2px solid #fcba19;
  }
}

#title-branding {
  padding-left: 10px;
  font-size: 20px;
  > h1 {
    font-weight: 600;
  }
}
</style>
