<template>
  <div
    id="turnstile-container"
    data-sitekey="0x4AAAAAAARCAqkeSv4DeLPk"
    data-callback="javascriptCallback"
  ></div>
</template>

<style lang="scss">
</style>

<script setup lang="ts">
import { onMounted } from 'vue'

window.onloadTurnstileCallback = function () {
  turnstile.render('#turnstile-container', {
    sitekey: '0x4AAAAAAARCAqkeSv4DeLPk',
    callback: function(token: string) {
      console.log(`Challenge Success ${token}`);
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSea-ZXq4OW4ZM5HExd5D4N4XUn6K6vjmnS0bkm15bHR5DmUfA/viewform')
    },
  });
};

onMounted(() => {
  const recaptchaScript = document.createElement('script');
  recaptchaScript.setAttribute('src', 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback');
  document.head.appendChild(recaptchaScript);
});

</script>

