<template>
  <div
    class="cf-turnstile"
    data-sitekey="0x4AAAAAAARCAqkeSv4DeLPk"
    data-callback="javascriptCallback"
  ></div>
</template>

<style lang="scss">
</style>

<script setup lang="ts">
import { onMounted } from 'vue'

window.onloadTurnstileCallback = function () {
  turnstile.render('#example-container', {
    sitekey: '0x4AAAAAAARCAqkeSv4DeLPk',
    callback: function(token) {
      console.log(`Challenge Success ${token}`);
    },
  });
};

onMounted(() => {
  const recaptchaScript = document.createElement('script');
  recaptchaScript.setAttribute('src', 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback');
  document.head.appendChild(recaptchaScript);
});

</script>

