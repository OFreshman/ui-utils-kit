<template>
  <div>
    <hr />
    <p>html2canvas-pro test</p>
    <button @click="onPrint">打印</button>
    <div class="print">
      <ul ref="printEl">
        <li v-for="i in 20" :key="i">{{ i }}</li>
        <li>
          <img
            width="100%"
            height="100%"
            style="object-fit: cover"
            src="https://oss.xiaohe.ink/images/uni-echarts.png"
            alt=""></li>
        <li>
          <img
            width="100%"
            height="100%"
            style="object-fit: cover"
            src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
            alt="">
        </li>
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
  await captureElementAsImage(printEl.value, {
    proxy: "https://h2c-proxy.netlify.app/api/",
    useCORS: false
  });
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