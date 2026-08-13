# Business API

`business` 当前提供 DOM 截图能力。只有使用本模块时才需要安装可选 peer：

```bash
pnpm add html2canvas-pro
```

## `captureElementAsImage`

```ts
function captureElementAsImage(
  element: HTMLElement | null,
  canvasConfig?: CaptureCanvasOptions,
  outputOptions?: OutputOptions
): Promise<CaptureResult>;
```

将 DOM 元素渲染为 Canvas，并按需自动下载、返回 Data URL 或 Blob。

```ts
const result = await captureElementAsImage(
  document.querySelector<HTMLElement>("#poster"),
  {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  },
  {
    download: false,
    dataUrl: true,
    blob: true
  }
);
```

## `CaptureCanvasOptions`

常用字段具有明确类型，其余 `html2canvas-pro` 同名配置也可以传入：

```ts
interface CaptureCanvasOptions {
  scale?: number;
  proxy?: string;
  backgroundColor?: string | null;
  useCORS?: boolean;
  allowTaint?: boolean;
  [key: string]: unknown;
}
```

默认配置：

```ts
{
  scale: 2,
  proxy: "",
  backgroundColor: "#ffffff",
  useCORS: false,
  allowTaint: false
}
```

## `OutputOptions`

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `download` | `true` | 是否创建临时链接并下载 PNG |
| `downloadName` | `"下载图片"` | 下载文件名，不含 `.png` |
| `dataUrl` | `false` | 是否返回 PNG Data URL；下载时也会生成 |
| `blob` | `false` | 是否通过 `canvas.toBlob` 返回 PNG Blob |

## `CaptureResult`

```ts
interface CaptureResult {
  canvas: HTMLCanvasElement;
  dataUrl: string | null;
  blob: Blob | null;
}
```

成功时 `canvas` 始终存在。`dataUrl` 仅在下载或 `dataUrl: true` 时存在；`blob` 仅在 `blob: true` 时存在。

## 错误与运行环境

- `element` 为 `null` 时会在加载截图依赖前抛错。
- 自动下载要求全局 `document`；非浏览器环境请求下载时会提前抛错。
- `canvas.toBlob` 返回 `null` 时 Promise 会拒绝。
- 跨域图片需要资源端正确配置 CORS，或通过 `proxy` 指定自己的代理服务；本库不内置代理。

::: tip 只需要结果，不需要下载
传入 `{ download: false, dataUrl: true }` 或 `{ download: false, blob: true }`，避免创建临时下载链接。
:::
