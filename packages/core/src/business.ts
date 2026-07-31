import type { Options as Html2canvasOptions } from "html2canvas-pro";
import type { CaptureCanvasOptions, CaptureResult, OutputOptions } from "./types/business-type";

/**
 * =====================
 * ==业务相关的工具类函数==
 * =====================
 */


/**
 * 将 DOM 元素转换为图片（canvas），并支持自动下载、返回 Blob 或 Data URL。
 *
 * @param element - 需要捕捉的 DOM 元素。
 * @param canvasConfig - html2canvas 的配置项，例如 scale、backgroundColor 等。
 * @param outputOptions - 输出选项。
 * @returns 返回 Promise，包含 { canvas, dataUrl, blob } 对象。
 */
export async function captureElementAsImage(
  element: HTMLElement | null,
  canvasConfig: CaptureCanvasOptions = {},
  outputOptions: OutputOptions = {}
): Promise<CaptureResult> {
  if (!element) {
    throw new Error("captureElementAsImage element required");
  }

  // 默认的 html2canvas 配置，确保图片清晰；跨域图片仍需正确的 CORS 或代理配置。
  const defaultCanvasConfig: CaptureCanvasOptions = {
    scale: 2, // 提高清晰度
    proxy: "",
    backgroundColor: "#ffffff", // 防止生成的图片背景透明
    useCORS: false,
    allowTaint: false
  };

  // 合并默认输出选项和用户传入的选项
  const finalOutputOptions: OutputOptions = {
    download: true,
    downloadName: "下载图片",
    blob: false,
    dataUrl: false,
    ...outputOptions
  };

  if (finalOutputOptions.download && typeof document === "undefined") {
    throw new Error("captureElementAsImage download requires a browser document");
  }

  // 合并默认配置和用户传入的配置
  const finalCanvasConfig = { ...defaultCanvasConfig, ...canvasConfig };

  // console.log("config: ", finalCanvasConfig);
  let dataUrl: string | null = null;
  let blobResult: Blob | null = null;

  // 延迟加载可选 peer，避免纯工具函数使用者在导入入口时就必须解析它。
  const { default: html2canvas } = await import("html2canvas-pro");

  // 利用 html2canvas 将 DOM 元素渲染成 canvas
  // 考虑到 html-to-image 虽然渲染快（仅web就优先考虑），但是在 ios和android 兼容性较弱，这里使用 html2canvas 进行渲染
  const canvas = await html2canvas(element, finalCanvasConfig as Partial<Html2canvasOptions>);

  // 下载和显式 dataUrl 输出复用同一次序列化。
  if (finalOutputOptions.download || finalOutputOptions.dataUrl) {
    dataUrl = canvas.toDataURL("image/png");
  }

  // 如果需要下载，则生成临时链接并触发下载。
  if (finalOutputOptions.download && dataUrl) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${finalOutputOptions.downloadName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 如果需要 blob 格式，则封装 canvas.toBlob 为 Promise，并等待转换完成
  if (finalOutputOptions.blob) {
    blobResult = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
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

export type { CaptureCanvasOptions, CaptureResult, OutputOptions } from "./types/business-type";