const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

/**
 * 设置滚动位置
 */
function move(amount: number): void {
  document.documentElement.scrollTop = amount
  document.body.scrollTop = amount
}

/**
 * 获取当前滚动位置
 */
function position(): number {
  return document.documentElement.scrollTop || document.body.scrollTop || 0
}

/**
 * 平滑滚动到指定位置
 * @param to 滚动目标位置
 * @param duration 滚动持续时间（毫秒）
 * @param callback 滚动结束后的回调函数（可选）
 */
export function scrollTo(to: number, duration: number = 500, callback?: () => void): void {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0

  const animateScroll = () => {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    move(val)

    if (currentTime < duration) {
      requestAnimationFrame(animateScroll)
    } else if (typeof callback === 'function') {
      callback()
    }
  }

  animateScroll()
}
