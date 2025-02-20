/**
 * 输出选项接口
 */
export interface OutputOptions {
  /** 是否自动下载生成的图片 */
  download?: boolean;
  /** 下载图片的文件名（不含扩展名） */
  downloadName?: string;
  /** 是否返回 Blob 格式的图片数据 */
  blob?: boolean;
}

/**
 * 捕获结果接口
 */
export interface CaptureResult {
  /** 生成的 Canvas 元素 */
  canvas: HTMLCanvasElement | null;
  /** 图片的 Data URL 字符串（若启用了下载，则存在） */
  dataUrl: string | null;
  /** 图片的 Blob 对象（若启用了 blob 输出，则存在） */
  blob: Blob | null;
}