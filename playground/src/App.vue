<template>
  <div>
    <button @click="onPrint">打印</button>
    <div class="print">
      <ul ref="printEl">
        <li v-for="i in 20" :key="i">{{ i }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { captureElementAsImage } from "ui-utils-kit";
import { ref } from "vue";

const printEl = ref<HTMLElement | null>(null);

async function onPrint() {
  const res = await captureElementAsImage(printEl.value);
  console.log("res: ", res);
}
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
.print {
  width: 300px;
  overflow: auto;
  ul {
    width: 100%;
    list-style: none;
  }
  ul li {
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: center;
  }
}
</style>