// https://blog.csdn.net/weixin_41697143/article/details/81049798
// setInterval和setTimeout的性能问题，可以通过上面的文章了解，建议都用 setTimeout

export const timerHelper = {
  timer: {},

  setTimeout(func, howLong: number, key: string): void {
    const timerId = this.timer[key]
    if (timerId) {
      clearTimeout(timerId)
    }
    this.timer[key] = setTimeout(func, howLong)
  }
}
