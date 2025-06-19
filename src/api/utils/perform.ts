// 类型定义
type AnyFunction = (...args: unknown[]) => unknown;

/**
 * 防抖函数 - 在事件触发后延迟执行，如果在延迟期间再次触发则重新计时
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 * @returns 防抖后的函数
 */
export function debounce<T extends AnyFunction>(
  func: T,
  delay: number,
  immediate = true
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let hasExecuted = false;

  return function (this: unknown, ...args: Parameters<T>) {
    const callNow = immediate && !hasExecuted;

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (callNow) {
      func.apply(this, args);
      hasExecuted = true;
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      hasExecuted = false;
      if (!immediate) {
        func.apply(this, args);
      }
    }, delay);
  };
}

/**
 * 节流函数 - 在指定时间间隔内最多执行一次函数
 * @param func 要执行的函数
 * @param delay 时间间隔（毫秒）
 * @param options 配置选项
 * @returns 节流后的函数
 */
export function throttle<T extends AnyFunction>(
  func: T,
  delay: number,
  options: {
    leading?: boolean; // 是否在延迟开始前执行
    trailing?: boolean; // 是否在延迟结束后执行
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecutedTime = 0;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;

    // 如果是第一次调用且不需要立即执行
    if (lastExecutedTime === 0 && !leading) {
      lastExecutedTime = now;
    }

    const remainingTime = delay - (now - lastExecutedTime);

    if (remainingTime <= 0 || remainingTime > delay) {
      // 立即执行
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastExecutedTime = now;
      func.apply(this, args);
    } else if (!timeoutId && trailing) {
      // 设置延迟执行
      timeoutId = setTimeout(() => {
        lastExecutedTime = leading ? Date.now() : 0;
        timeoutId = null;
        if (lastArgs) {
          func.apply(this, lastArgs);
        }
      }, remainingTime);
    }
  };
}

/**
 * 高级防抖函数 - 支持取消和立即执行
 */
export function advancedDebounce<T extends AnyFunction>(
  func: T,
  delay: number,
  immediate = false
) {
  let timeoutId: NodeJS.Timeout | null = null;
  let hasExecuted = false;

  const debouncedFunction = function (this: unknown, ...args: Parameters<T>) {
    const callNow = immediate && !hasExecuted;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (callNow) {
      func.apply(this, args);
      hasExecuted = true;
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      hasExecuted = false;
      if (!immediate) {
        func.apply(this, args);
      }
    }, delay);
  };

  // 取消防抖
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      hasExecuted = false;
    }
  };

  // 立即执行
  debouncedFunction.flush = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    hasExecuted = false;
    func.apply(this, args);
  };

  return debouncedFunction;
}

/**
 * 高级节流函数 - 支持取消和立即执行
 */
export function advancedThrottle<T extends AnyFunction>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
) {
  const { leading = true, trailing = true } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecutedTime = 0;
  let lastArgs: Parameters<T> | null = null;

  const throttledFunction = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;

    if (lastExecutedTime === 0 && !leading) {
      lastExecutedTime = now;
    }

    const remainingTime = delay - (now - lastExecutedTime);

    if (remainingTime <= 0 || remainingTime > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastExecutedTime = now;
      func.apply(this, args);
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastExecutedTime = leading ? Date.now() : 0;
        timeoutId = null;
        if (lastArgs) {
          func.apply(this, lastArgs);
        }
      }, remainingTime);
    }
  };

  // 取消节流
  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExecutedTime = 0;
    lastArgs = null;
  };

  // 立即执行
  throttledFunction.flush = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExecutedTime = Date.now();
    func.apply(this, args);
  };

  return throttledFunction;
}

/**
 * 用于 Vue 组合式 API 的防抖 Hook
 */
export function useDebounce<T extends AnyFunction>(
  fn: T,
  delay: number,
  immediate = false
) {
  const debouncedFn = advancedDebounce(fn, delay, immediate);

  // Vue 组件卸载时自动清理
  if (typeof window !== 'undefined') {
    try {
      // 动态导入 Vue 的 onBeforeUnmount
      import('vue').then(({ onBeforeUnmount }) => {
        onBeforeUnmount(() => {
          debouncedFn.cancel();
        });
      }).catch(() => {
        // 如果不在 Vue 环境中，忽略错误
      });
    } catch {
      // 忽略导入错误
    }
  }

  return debouncedFn;
}

/**
 * 用于 Vue 组合式 API 的节流 Hook
 */
export function useThrottle<T extends AnyFunction>(
  fn: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
) {
  const throttledFn = advancedThrottle(fn, delay, options);

  // Vue 组件卸载时自动清理
  if (typeof window !== 'undefined') {
    try {
      // 动态导入 Vue 的 onBeforeUnmount
      import('vue').then(({ onBeforeUnmount }) => {
        onBeforeUnmount(() => {
          throttledFn.cancel();
        });
      }).catch(() => {
        // 如果不在 Vue 环境中，忽略错误
      });
    } catch {
      // 忽略导入错误
    }
  }

  return throttledFn;
}

/**
 * 工具函数集合
 */
// export const utils = {
//   debounce,
//   throttle,
//   advancedDebounce,
//   advancedThrottle,
//   useDebounce,
//   useThrottle,

//   /**
//    * 延迟执行
//    */
//   delay: (ms: number): Promise<void> => {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   },

//   /**
//    * 限制函数执行频率
//    */
//   rateLimit: <T extends AnyFunction>(
//     fn: T,
//     maxCalls: number,
//     timeWindow: number
//   ) => {
//     const calls: number[] = [];

//     return function (this: unknown, ...args: Parameters<T>) {
//       const now = Date.now();

//       // 清除超出时间窗口的调用记录
//       while (calls.length > 0 && calls[0] <= now - timeWindow) {
//         calls.shift();
//       }

//       if (calls.length < maxCalls) {
//         calls.push(now);
//         return fn.apply(this, args);
//       }

//       throw new Error(`Rate limit exceeded: ${maxCalls} calls per ${timeWindow}ms`);
//     };
//   },
//   /**
//    * 函数记忆化
//    */
//   memoize: <T extends AnyFunction>(fn: T) => {
//     const cache = new Map();

//     return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
//       const key = JSON.stringify(args);

//       if (cache.has(key)) {
//         return cache.get(key) as ReturnType<T>;
//       }

//       const result = fn.apply(this, args) as ReturnType<T>;
//       cache.set(key, result);
//       return result;
//     };
//   }
// };