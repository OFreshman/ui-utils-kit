import html2canvas from "html2canvas-pro";
import type { Options as Html2canvasOptions } from "html2canvas-pro";
import type { CaptureResult, OutputOptions } from "./types/business-type.ts";

/**
 * =====================
 * ==业务相关的工具类函数==
 * =====================
 */


/**
 * 将 DOM 元素转换为图片（canvas），并支持自动下载或返回 Blob 格式数据。
 *
 * @param element - 需要捕捉的 DOM 元素。
 * @param canvasConfig - html2canvas 的配置项，例如 scale、backgroundColor 等。
 * @param outputOptions - 输出选项。
 * @returns 返回 Promise，包含 { canvas, dataUrl, blob } 对象。
 */
export async function captureElementAsImage(
  element: HTMLElement | null,
  canvasConfig: Partial<Html2canvasOptions> = {},
  outputOptions: OutputOptions = { download: true, downloadName: "下载图片", blob: false }
): Promise<CaptureResult> {
  if (!element) {
    throw new Error("captureElementAsImage element required");
  }

  // 默认的 html2canvas 配置，确保图片清晰且处理跨域问题
  const defaultCanvasConfig: Partial<Html2canvasOptions> = {
    scale: 2, // 提高清晰度
    proxy: "",
    backgroundColor: "#ffffff", // 防止生成的图片背景透明
    useCORS: false, // 允许跨域图片
    allowTaint: false // 允许污染 canvas
  };

  // 合并默认输出选项和用户传入的选项
  const defaultOutputOptions: OutputOptions = {
    download: true,
    downloadName: "下载图片",
    blob: false,
    ...outputOptions
  };

  // 合并默认配置和用户传入的配置
  const finalCanvasConfig = { ...defaultCanvasConfig, ...canvasConfig };

  console.log("config: ", finalCanvasConfig);
  let canvas: HTMLCanvasElement | null = null;
  let dataUrl: string | null = null;
  let blobResult: Blob | null = null;

  // 利用 html2canvas 将 DOM 元素渲染成 canvas
  // debugger
  canvas = await html2canvas(element, finalCanvasConfig);

  // 如果需要下载，则生成 data URL 并触发下载
  if (defaultOutputOptions.download) {
    dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${defaultOutputOptions.downloadName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 如果需要 blob 格式，则封装 canvas.toBlob 为 Promise，并等待转换完成
  if (defaultOutputOptions.blob) {
    blobResult = await new Promise<Blob>((resolve, reject) => {
      canvas!.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("canvas 转 Blob 失败！"));
        }
      }, "image/png", 1.0);
    });
  }

  return { canvas, dataUrl, blob: blobResult };
}