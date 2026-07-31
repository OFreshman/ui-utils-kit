import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSelfCorrectingClock,
  createSelfCorrectingCountdown,
  desensitize,
  Mutex,
  safeJsonParse
} from "../packages/core/src/common";

describe("common utilities", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("安全解析 JSON，并在失败时返回默认值", () => {
    expect(safeJsonParse<{ count: number }>("{\"count\":2}", { count: 0 }))
      .toEqual([null, { count: 2 }]);

    const [error, value] = safeJsonParse("invalid", { count: 0 });
    expect(error).toBeInstanceOf(Error);
    expect(value).toEqual({ count: 0 });
  });

  it("对常见敏感信息进行脱敏", () => {
    expect(desensitize("13812345678", "mobile")).toBe("138****5678");
    expect(desensitize("alice@example.com", "email")).toBe("a****@example.com");
    expect(desensitize("6222021234567890", "bankcard")).toBe("**** **** **** 7890");
    expect(desensitize("张三", "name")).toBe("张*");
  });

  it("按 FIFO 顺序交接互斥锁", async () => {
    const mutex = new Mutex();
    await mutex.lock();

    let acquired = false;
    const waiting = mutex.lock().then(() => {
      acquired = true;
    });

    expect(mutex.isLocked()).toBe(true);
    expect(mutex.queueLength()).toBe(1);

    mutex.unlock();
    await waiting;
    expect(acquired).toBe(true);
    expect(mutex.queueLength()).toBe(0);
    expect(mutex.isLocked()).toBe(true);

    mutex.unlock();
    expect(mutex.isLocked()).toBe(false);
  });

  it("创建可停止的自校正时钟", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const clock = createSelfCorrectingClock(100);
    expect(clock.getCurrentTime()).toBe(1_000);

    vi.advanceTimersByTime(100);
    expect(clock.getCurrentTime()).toBe(1_100);

    clock.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("倒计时到达目标后停止，并拒绝无效参数", () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);

    const countdown = createSelfCorrectingCountdown(10_250, 100);
    vi.advanceTimersByTime(100);
    expect(countdown.getRemainingTime()).toBe(150);

    vi.advanceTimersByTime(150);
    expect(countdown.getRemainingTime()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    expect(() => createSelfCorrectingClock(0)).toThrow(RangeError);
    expect(() => createSelfCorrectingCountdown(Number.NaN)).toThrow(RangeError);
  });
});