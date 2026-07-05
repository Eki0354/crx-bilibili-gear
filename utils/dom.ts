/**
 * 轮询函数，回调函数中包含dom处理逻辑且有延迟加载问题时使用。
 * @param callback 回调函数
 * @returns true | false
 */
export function loopExec(callback: () => boolean | undefined) {
  if (callback()) return;

  // 每 200ms 轮询，直到内部节点就绪
  const intervalId = setInterval(() => {
    if (callback()) clearInterval(intervalId);
  }, 200);

  // 30 秒后安全清理，防止内存泄漏
  setTimeout(() => clearInterval(intervalId), 30_000);
}
