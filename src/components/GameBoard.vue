<template>
  <div class="game-board">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  board: Object,
  lastMove: Object
})

const emit = defineEmits(['place'])

const canvas = ref(null)

const CELL_SIZE = 40
const PADDING = 30

function draw() {
  const ctx = canvas.value.getContext('2d')
  const size = props.board.size
  const canvasSize = CELL_SIZE * (size - 1) + PADDING * 2

  canvas.value.width = canvasSize
  canvas.value.height = canvasSize

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  drawGrid(ctx, size)
  drawStones(ctx, props.board, size)
  drawLastMove(ctx, props.lastMove)
}

function drawGrid(ctx, size) {
  ctx.strokeStyle = '#dddddd'
  ctx.lineWidth = 1

  for (let i = 0; i < size; i++) {
    const pos = PADDING + i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(PADDING, pos)
    ctx.lineTo(PADDING + (size - 1) * CELL_SIZE, pos)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(pos, PADDING)
    ctx.lineTo(pos, PADDING + (size - 1) * CELL_SIZE)
    ctx.stroke()
  }

  // 绘制星位标记点
  drawStarPoints(ctx, size)
}

function drawStarPoints(ctx, size) {
  // 根据棋盘大小计算星位坐标（约 1/4、1/2、3/4 处）
  const q = Math.round(size / 4)
  const h = Math.round(size / 2)
  const t = size - 1 - q
  const positions = [q, h, t]

  ctx.fillStyle = '#dddddd'
  for (const row of positions) {
    for (const col of positions) {
      const cx = PADDING + col * CELL_SIZE
      const cy = PADDING + row * CELL_SIZE
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawStones(ctx, board, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = board.cells[y * size + x]
      if (cell !== 0) {
        const cx = PADDING + x * CELL_SIZE
        const cy = PADDING + y * CELL_SIZE
        ctx.fillStyle = cell === 1 ? '#333333' : '#e0e0e0'
        ctx.beginPath()
        ctx.arc(cx, cy, CELL_SIZE * 0.42, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

function drawLastMove(ctx, lastMove) {
  if (!lastMove) return
  const cx = PADDING + lastMove.x * CELL_SIZE
  const cy = PADDING + lastMove.y * CELL_SIZE
  const cell = props.board.cells[lastMove.y * props.board.size + lastMove.x]
  ctx.fillStyle = cell === 1 ? '#ffffff' : '#333333'
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fill()
}

function handleClick(event) {
  const rect = canvas.value.getBoundingClientRect()
  const x = Math.round((event.clientX - rect.left - PADDING) / CELL_SIZE)
  const y = Math.round((event.clientY - rect.top - PADDING) / CELL_SIZE)
  emit('place', { x, y })
}

onMounted(() => {
  canvas.value.addEventListener('click', handleClick)
  draw()
})

watch(() => [props.board, props.lastMove], draw, { deep: true })
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}
</style>
