import { afterEach, describe, expect, it, vi } from "vitest";
import { captureElementAsImage } from "../packages/core/src/business";

const { html2canvasMock } = vi.hoisted(() => ({
  html2canvasMock: vi.fn()
}));

vi.mock("html2canvas-pro", () => ({
  default: html2canvasMock
}));

describe("captureElementAsImage", () => {
  afterEach(() => {
    html2canvasMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("拒绝空元素", async () => {
    await expect(captureElementAsImage(null)).rejects.toThrow("element required");
    expect(html2canvasMock).not.toHaveBeenCalled();
  });

  it("延迟调用 html2canvas，并按需生成 Blob", async () => {
    const blob = new Blob(["image"], { type: "image/png" });
    const canvas = {
      toBlob: vi.fn((callback: BlobCallback) => callback(blob)),
      toDataURL: vi.fn(() => "data:image/png;base64,image")
    } as unknown as HTMLCanvasElement;
    const element = {} as HTMLElement;
    html2canvasMock.mockResolvedValue(canvas);

    const result = await captureElementAsImage(
      element,
      { scale: 3 },
      { download: false, blob: true }
    );

    expect(html2canvasMock).toHaveBeenCalledWith(element, expect.objectContaining({
      scale: 3,
      backgroundColor: "#ffffff"
    }));
    expect(result).toEqual({ canvas, dataUrl: null, blob });
  });

  it("下载时创建并清理临时链接", async () => {
    const link = {
      click: vi.fn(),
      download: "",
      href: ""
    };
    const body = {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    };
    vi.stubGlobal("document", {
      body,
      createElement: vi.fn(() => link)
    });

    const canvas = {
      toBlob: vi.fn(),
      toDataURL: vi.fn(() => "data:image/png;base64,image")
    } as unknown as HTMLCanvasElement;
    html2canvasMock.mockResolvedValue(canvas);

    const result = await captureElementAsImage(
      {} as HTMLElement,
      {},
      { download: true, downloadName: "poster" }
    );

    expect(link.download).toBe("poster.png");
    expect(link.click).toHaveBeenCalledOnce();
    expect(body.appendChild).toHaveBeenCalledWith(link);
    expect(body.removeChild).toHaveBeenCalledWith(link);
    expect(result.dataUrl).toBe("data:image/png;base64,image");
  });
});