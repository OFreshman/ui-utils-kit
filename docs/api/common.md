# Common API

从 `ui-utils-kit/common` 导入纯工具：

```ts
import { Mutex, safeJsonParse } from "ui-utils-kit/common";
```

## `safeJsonParse`

```ts
function safeJsonParse<T>(
  jsonString: string,
  defaultValue: T
): [Error | null, T];
```

解析成功返回 `[null, value]`；解析失败返回 `[error, defaultValue]`，不会把解析错误抛给调用者。

```ts
const [error, settings] = safeJsonParse(
  localStorage.getItem("settings") ?? "",
  { theme: "light" }
);
```

## `desensitize`

```ts
function desensitize(
  value: string,
  type: "mobile" | "idcard" | "email" | "bankcard" | "name"
): string;
```

| 类型 | 行为示例 |
| --- | --- |
| `mobile` | `13812345678` → `138****5678` |
| `idcard` | 保留前 6 位和后 4 位 |
| `email` | 保留首字符和域名 |
| `bankcard` | 仅保留后 4 位，并按四位分组 |
| `name` | 按中文姓名或英文单词规则脱敏 |

不符合对应格式的手机号、身份证号或邮箱通常保持原样。

## `Mutex`

Promise 互斥锁，用于让共享同一个实例的异步任务按 FIFO 顺序进入临界区。

### `runExclusive`

```ts
const mutex = new Mutex();

const result = await mutex.runExclusive(async () => {
  return await updateSharedResource();
});
```

任务成功、失败或同步抛错时都会自动释放锁，推荐优先使用。

### `lock` / `unlock`

```ts
await mutex.lock();
try {
  await updateSharedResource();
} finally {
  mutex.unlock();
}
```

### 状态方法

- `isLocked()`：当前是否持有锁或正在把锁交给等待者。
- `queueLength()`：正在等待获取锁的任务数。

::: warning 作用域
这不是跨标签页、Worker、进程或分布式锁。只有共享同一个 `Mutex` 实例的任务会互相等待。
:::

## `createSelfCorrectingClock`

```ts
interface SelfCorrectingClock {
  getCurrentTime(): number;
  stop(): void;
}

function createSelfCorrectingClock(
  interval?: number
): SelfCorrectingClock;
```

创建会修正下一次调度延迟的时钟，以减少普通 `setInterval` 的累计漂移。`interval` 默认 `1000`，必须是大于 `0` 的有限数字。

## `createSelfCorrectingCountdown`

```ts
interface SelfCorrectingCountdown {
  getRemainingTime(): number;
  stop(): void;
}

function createSelfCorrectingCountdown(
  targetTimestamp: number,
  interval?: number
): SelfCorrectingCountdown;
```

根据目标时间戳持续重算剩余毫秒数，到达 `0` 后停止调度。`targetTimestamp` 必须是有限数字，`interval` 默认 `1000` 且必须大于 `0`。
