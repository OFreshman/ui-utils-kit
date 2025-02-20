<template>
  <div>
    <hr />
    <p>html2canvas-pro test</p>
    <button @click="onPrint">打印</button>
    <div class="print">
      <ul ref="printEl">
        <li v-for="i in 20" :key="i">{{ i }}</li>
      </ul>
    </div>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { captureElementAsImage } from "ui-utils-kit";
import { ref } from "vue";

const printEl = ref<HTMLElement | null>(null);

async function onPrint() {
  const res = await captureElementAsImage(printEl.value);
  console.log("res: ", res);
}
</script>

<style scoped lang="scss">
.print {
  width: 300px;
  height: 150px;
  overflow: auto;
  ul {
    padding: 5px;
    width: 100%;
    list-style: none;
  }
  ul li {
    width: 100%;
    height: 20px;
    line-height: 20px;
    border: 1px solid #aaa;
    margin: 5px 0;
    text-align: center;
  }
}
</style>