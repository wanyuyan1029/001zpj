const COLORS = [
  '#e84a5f',
  '#2a9d8f',
  '#f6bd60',
  '#457b9d',
  '#7c3aed',
  '#f28482',
  '#06b6d4',
  '#84a59d',
  '#f59e0b',
  '#3b82f6'
]

const DEFAULT_OPTIONS = [
  { id: 1, name: '火锅', percent: 30, color: COLORS[0] },
  { id: 2, name: '烧烤', percent: 20, color: COLORS[1] },
  { id: 3, name: '日料', percent: 25, color: COLORS[2] },
  { id: 4, name: '家常菜', percent: 25, color: COLORS[3] }
]

Page({
  data: {
    canvasSize: 320,
    options: DEFAULT_OPTIONS,
    totalPercent: 100,
    isValid: true,
    isSpinning: false,
    lastResult: '',
    rotation: 0,
    spinDuration: 0
  },

  onReady() {
    this.drawWheel()
  },

  onShow() {
    this.drawWheel()
  },

  addOption() {
    if (this.data.isSpinning) return

    const nextIndex = this.data.options.length
    const options = this.data.options.concat({
      id: Date.now(),
      name: `选项${nextIndex + 1}`,
      percent: 0,
      color: COLORS[nextIndex % COLORS.length]
    })

    this.updateOptions(options)
  },

  removeOption(event) {
    if (this.data.isSpinning || this.data.options.length <= 2) return

    const index = Number(event.currentTarget.dataset.index)
    const options = this.data.options.filter((_, optionIndex) => optionIndex !== index)
    this.updateOptions(options)
  },

  onNameInput(event) {
    const index = Number(event.currentTarget.dataset.index)
    const value = event.detail.value
    const options = this.data.options.map((item, optionIndex) => (
      optionIndex === index ? { ...item, name: value } : item
    ))

    this.updateOptions(options)
  },

  onPercentInput(event) {
    const index = Number(event.currentTarget.dataset.index)
    const percent = this.normalizePercent(event.detail.value)
    const options = this.data.options.map((item, optionIndex) => (
      optionIndex === index ? { ...item, percent } : item
    ))

    this.updateOptions(options)
  },

  startSpin() {
    if (!this.data.isValid || this.data.isSpinning) return

    const selected = this.pickWeightedOption()
    if (!selected) {
      wx.showToast({ title: '请至少设置一个有效百分比', icon: 'none' })
      return
    }

    const targetAngle = this.getTargetAngle(selected.index)
    const currentRotation = this.data.rotation % 360
    const rounds = 6 + Math.floor(Math.random() * 3)
    const finalRotation = this.data.rotation + rounds * 360 + targetAngle - currentRotation

    this.setData({
      isSpinning: true,
      lastResult: '',
      spinDuration: 4200,
      rotation: finalRotation
    })

    setTimeout(() => {
      this.setData({
        isSpinning: false,
        lastResult: selected.option.name || `选项${selected.index + 1}`,
        spinDuration: 0,
        rotation: finalRotation % 360
      })
      wx.showToast({ title: `抽中：${this.data.lastResult}`, icon: 'none' })
    }, 4300)
  },

  updateOptions(options) {
    const totalPercent = this.sumPercent(options)
    const isValid = options.length >= 2 &&
      totalPercent === 100 &&
      options.some(item => Number(item.percent) > 0) &&
      options.every(item => String(item.name || '').trim())

    this.setData({ options, totalPercent, isValid }, () => {
      this.drawWheel()
    })
  },

  normalizePercent(value) {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue) || numberValue < 0) return 0
    return Math.min(100, Math.round(numberValue * 100) / 100)
  },

  sumPercent(options) {
    const total = options.reduce((sum, item) => sum + Number(item.percent || 0), 0)
    return Math.round(total * 100) / 100
  },

  pickWeightedOption() {
    const options = this.data.options
    const random = Math.random() * 100
    let cursor = 0

    for (let index = 0; index < options.length; index += 1) {
      cursor += Number(options[index].percent || 0)
      if (random <= cursor) {
        return { option: options[index], index }
      }
    }

    return { option: options[options.length - 1], index: options.length - 1 }
  },

  getTargetAngle(index) {
    const options = this.data.options
    let startAngle = 0

    for (let optionIndex = 0; optionIndex < index; optionIndex += 1) {
      startAngle += Number(options[optionIndex].percent || 0) * 3.6
    }

    const segmentAngle = Number(options[index].percent || 0) * 3.6
    const middleAngle = startAngle + segmentAngle / 2

    return 360 - middleAngle
  },

  drawWheel() {
    const ctx = wx.createCanvasContext('wheelCanvas', this)
    const size = this.data.canvasSize
    const radius = size / 2
    const innerRadius = 38
    const options = this.data.options
    let startAngle = -90

    ctx.clearRect(0, 0, size, size)
    ctx.setFillStyle('#ffffff')
    ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2)
    ctx.fill()

    options.forEach((item, index) => {
      const segmentAngle = Number(item.percent || 0) * 3.6
      if (segmentAngle <= 0) return

      const endAngle = startAngle + segmentAngle
      const startRad = this.degToRad(startAngle)
      const endRad = this.degToRad(endAngle)
      const middleRad = this.degToRad(startAngle + segmentAngle / 2)

      ctx.beginPath()
      ctx.moveTo(radius, radius)
      ctx.arc(radius, radius, radius - 10, startRad, endRad)
      ctx.closePath()
      ctx.setFillStyle(item.color || COLORS[index % COLORS.length])
      ctx.fill()

      ctx.save()
      ctx.translate(radius, radius)
      ctx.rotate(middleRad)
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(14)
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.fillText(this.fitText(item.name || `选项${index + 1}`), radius * 0.58, 0)
      ctx.restore()

      startAngle = endAngle
    })

    ctx.beginPath()
    ctx.setFillStyle('#ffffff')
    ctx.arc(radius, radius, innerRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.setStrokeStyle('rgba(24, 33, 47, 0.1)')
    ctx.setLineWidth(2)
    ctx.stroke()

    ctx.draw()
  },

  degToRad(deg) {
    return deg * Math.PI / 180
  },

  fitText(text) {
    const trimmed = String(text).trim()
    return trimmed.length > 6 ? `${trimmed.slice(0, 6)}…` : trimmed
  }
})
