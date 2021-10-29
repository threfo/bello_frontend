let cache = {}

module.exports = {
  setValue(key, value) {
    // console.log('setValue', this.fileCount(), key)
    cache[key] = value
  },
  getValue(key) {
    // console.log('getValue', this.fileCount(), key)
    return cache[key]
  },
  fileCount() {
    return Object.keys(cache).length
  },
  removeAll() {
    cache = {}
  }
}
