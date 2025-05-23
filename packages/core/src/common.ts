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
 * 数据脱敏函数
 *
 * @param value - 原始数据
 * @param type - 脱敏类型
 * @returns 脱敏后的数据
 */
export function desensitize(
  value: string,
  type: "mobile" | "idcard" | "email" | "bankcard" | "name"
): string {
  if (typeof value !== "string") {
    return value;
  }

  switch (type) {
    case "mobile":
      // 手机号：前三位、后四位保留
      return value.replace(/^(1[3-9]\d)(\d{4})(\d{4})$/, (_, p1, _p2, p3) => `${p1}****${p3}`);

    case "idcard":
      // 身份证号：前6位、后4位保留
      return value.replace(/^(.{6})\d+(.{4})$/, (_, p1, p2) => `${p1}******${p2}`);

    case "email":
      // 邮箱：保留首字母与域名（避免 ReDoS，使用 [^@] 代替 .）
      return value.replace(/^(.)([^@]*)(@[^@]+)$/, (_, first: string, middle: string, domain: string) =>
        `${first}${middle.replace(/./g, "*")}${domain}`);

    case "bankcard":
      // 银行卡：仅保留后4位
      return value
        .replace(/\s+/g, "")
        .replace(/.(?=.{4})/g, "*")
        .replace(/(.{4})/g, "$1 ")
        .trim();

    case "name":
      if (/[\u4E00-\u9FA5]/.test(value)) {
        const len = value.length;
        if (len === 2) {
          return `${value[0]}*`;
        } else if (len >= 3) {
          return value[0] + "*".repeat(len - 2) + value[len - 1];
        } else {
          return "*";
        }
      } else {
        // 英文名脱敏：按单词拆分，每段：
        // - 长度 >=3：保留首尾，中间 *
        // - 长度 ==2：保留首位，末位 *
        // - 长度 ==1：替换为 *
        return value.split(" ").map((part) => {
          const len = part.length;
          if (len >= 3) {
            return part[0] + "*".repeat(len - 2) + part[len - 1];
          } else if (len === 2) {
            return `${part[0]}*`;
          } else if (len === 1) {
            return "*";
          }
          return part;
        }).join(" ");
      }

    default:
      // 默认：保留首尾字符
      return value.replace(/^(.)(.*)(.)$/, (_, first: string, middle: string, last: string) =>
        `${first}${middle.replace(/./g, "*")}${last}`);
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