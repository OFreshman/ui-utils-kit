/**
 * DOM 截图配置。常用字段提供明确类型，其余 html2canvas 选项可按原名称传入。
 */
export interface CaptureCanvasOptions {
  scale?: number;
  proxy?: string;
  backgroundColor?: string | null;
  useCORS?: boolean;
  allowTaint?: boolean;
  [key: string]: unknown;
}

/**
 * 输出选项接口。
 */
export interface OutputOptions {
  /** 是否自动下载生成的图片 */
  download?: boolean;
  /** 下载图片的文件名（不含扩展名） */
  downloadName?: string;
  /** 是否返回 Blob 格式的图片数据 */
  blob?: boolean;
  /** 是否返回 Data URL；自动下载时无论此项为何值都会生成 */
  dataUrl?: boolean;
}

/**
 * 捕获结果接口。
 */
export interface CaptureResult {
  /** 生成的 Canvas 元素 */
  canvas: HTMLCanvasElement;
  /** 图片的 Data URL 字符串（若启用了下载或 dataUrl 输出，则存在） */
  dataUrl: string | null;
  /** 图片的 Blob 对象（若启用了 blob 输出，则存在） */
  blob: Blob | null;
}