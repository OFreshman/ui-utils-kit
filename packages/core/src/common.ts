import type { SelfCorrectingClock, SelfCorrectingCountdown } from "./types/common-type";

/**
 * =====================
 * =======公共函数=======
 * =====================
 */


/**
 * 安全地解析 JSON 字符串。
 *
 * @param jsonString - 要解析的 JSON 字符串。
 * @param defaultValue - 解析失败时返回的默认值。
 * @returns 一个元组，第一个元素为错误对象（若无错误则为 null），第二个元素为解析结果或默认值。
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): [Error | null, T] {
  try {
    const parsed = JSON.parse(jsonString) as T;
    return [null, parsed];
  } catch (error) {
    console.error("JSON 解析错误:", error);
    return [error instanceof Error ? error : new Error(String(error)), defaultValue];
  }
}


/**
 * 对敏感信息进行脱敏处理
 *
 * @param value - 原始字符串（如手机号、身份证号）
 * @param type - 数据类型，可选值为 "mobile"（手机号）或 "idcard"（身份证号）
 * @returns 脱敏后的字符串
 */
export function desensitize(value: string, type: "mobile" | "idcard"): string {
  if (typeof value !== "string") {
    return "";
  }

  switch (type) {
    case "mobile":
      // 手机号脱敏：保留前3位和后4位，中间4位替换为星号
      // 示例：13812345678 => 138****5678
      return value.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");

    case "idcard":
      // 身份证号脱敏：保留前6位和后4位，中间位数替换为星号
      // 示例：110105199001011234 => 110105********1234
      return value.replace(/^(\d{6})\d+(\d{4})$/, (_, p1, p2) => {
        const middleLength = value.length - p1.length - p2.length;
        const masked = "*".repeat(middleLength);
        return `${p1}${masked}${p2}`;
      });

    default:
      return value;
  }
}


/**
 * 模拟互斥锁（Mutex）机制，用于控制异步操作对共享资源的访问
 */
export class Mutex {

  /**
   * 锁的状态：true 表示已锁定，false 表示未锁定
   */
  #locked = false;

  /**
   * 等待获取锁的 Promise resolve 函数队列
   */
  #queue: Array<() => void> = [];

  /**
   * 获取锁。如果当前已锁定，则将请求加入队列，等待解锁后依次获取。
   * @returns Promise<void> - 当获取到锁时，Promise 被 resolve。
   */
  public lock(): Promise<void> {
    if (this.#locked) {
      // 已锁定，将请求加入队列
      return new Promise((resolve) => {
        this.#queue.push(resolve);
      });
    }

    // 未锁定，立即获取锁
    this.#locked = true;
    return Promise.resolve();
  }

  /**
   * 释放锁。如果有等待队列，则唤醒队列中的下一个请求；否则将锁状态设为未锁定。
   */
  public unlock(): void {
    if (this.#queue.length > 0) {
      // 唤醒队列中的下一个请求
      const nextResolve = this.#queue.shift();
      nextResolve?.();
    } else {
      // 没有等待请求，释放锁
      this.#locked = false;
    }
  }

  /**
   * 查询当前锁的状态
   * @returns boolean - true 表示已锁定，false 表示未锁定
   */
  public isLocked(): boolean {
    return this.#locked;
  }

  /**
   * 获取当前等待队列的长度
   * @returns number - 等待队列中的请求数量
   */
  public queueLength(): number {
    return this.#queue.length;
  }

}

/**
 * 创建零漂移的自校正实时时钟
 * @param interval 更新间隔（毫秒），默认 1000
 */
export function createSelfCorrectingClock(
  interval: number = 1000
): SelfCorrectingClock {
  let currentTime: number = Date.now();
  let expected: number = Date.now() + interval;
  let timerId: ReturnType<typeof setTimeout>;

  const step = (): void => {
    const drift: number = Date.now() - expected; // 计算漂移 :contentReference[oaicite:3]{index=3}
    currentTime = Date.now();
    expected += interval;
    // 下次延迟 = 理想间隔 - 本次漂移，保证校正 :contentReference[oaicite:4]{index=4}
    const timeout = Math.max(0, interval - drift);
    timerId = setTimeout(step, timeout);
  };

  timerId = setTimeout(step, interval); // 初始启动 :contentReference[oaicite:5]{index=5}
  return {
    getCurrentTime: () => currentTime,
    stop: () => clearTimeout(timerId) // 内部清除，无须外部管理 :contentReference[oaicite:6]{index=6}
  };
}


/**
 * 创建零漂移的自校正倒计时器
 * @param targetTimestamp 目标时间戳（毫秒）
 * @param interval 更新间隔（毫秒），默认值为 1000
 * @returns 自校正倒计时管理器实例，包含获取剩余时间和停止定时器的方法
 */
export function createSelfCorrectingCountdown(
  targetTimestamp: number,
  interval: number = 1000
): SelfCorrectingCountdown {
  let remaining: number = Math.max(targetTimestamp - Date.now(), 0);
  let expected: number = Date.now() + interval;
  let timerId: ReturnType<typeof setTimeout>;

  const step = (): void => {
    const drift: number = Date.now() - expected;
    remaining = Math.max(targetTimestamp - Date.now(), 0);
    if (remaining === 0) {
      return;
    }
    expected += interval;
    const timeout = Math.max(0, interval - drift);
    timerId = setTimeout(step, timeout);
  };

  timerId = setTimeout(step, interval);

  return {
    getRemainingTime: (): number => remaining,
    stop: (): void => clearTimeout(timerId)
  };
}