/**
 * 自校正时钟管理器接口
 */
export interface SelfCorrectingClock {
  /** 获取最新的当前时间戳（毫秒） */
  getCurrentTime: () => number;
  /** 停止内部定时器，释放资源 */
  stop: () => void;
}

/**
 * 自校正倒计时管理器接口
 */
export interface SelfCorrectingCountdown {
  /**
   * 获取最新的剩余时间（毫秒）
   * @returns 剩余时间（毫秒）
   */
  getRemainingTime: () => number;

  /**
   * 手动停止倒计时，释放资源
   * @returns 无返回值
   */
  stop: () => void;
}