export const PATTERN_SCORES = {
  FIVE: 100000,
  OPEN_FOUR: 10000,
  FOUR: 1000,
  OPEN_THREE: 1000,
  THREE: 100,
  OPEN_TWO: 100,
  TWO: 10
}

export function identifyPattern(line) {
  if (line.includes('11111')) return 'FIVE'
  if (line.includes('011110')) return 'OPEN_FOUR'
  if (line.includes('011112') || line.includes('211110')) return 'FOUR'
  if (line.includes('01110')) return 'OPEN_THREE'
  if (line.includes('01112') || line.includes('21110')) return 'THREE'
  if (line.includes('0110')) return 'OPEN_TWO'
  if (line.includes('0112') || line.includes('2110')) return 'TWO'
  return null
}

/**
 * 评估在指定位置落子的攻击价值
 * @param {Object} board - 棋盘对象
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @param {number} color - 棋子颜色（1=黑棋, 2=白棋）
 * @returns {number} 该位置的总评分
 */
export function evaluatePosition(board, x, y, color) {
  if (board.cells[y * board.size + x] !== 0) return 0

  // 临时放置棋子以模拟落子后的局面
  board.cells[y * board.size + x] = color

  let totalScore = 0
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]

  for (const [dx, dy] of directions) {
    const line = extractLine(board, x, y, dx, dy, color)
    const pattern = identifyPattern(line)
    if (pattern) {
      totalScore += PATTERN_SCORES[pattern]
    }
  }

  // 撤销临时放置
  board.cells[y * board.size + x] = 0

  return totalScore
}

/**
 * 从(x,y)沿(dx,dy)方向提取一条9字符的线段
 * '1'=己方棋子, '0'=空位, '2'=对手棋子或边界
 * @param {Object} board - 棋盘对象
 * @param {number} x - 中心x坐标
 * @param {number} y - 中心y坐标
 * @param {number} dx - x方向步进
 * @param {number} dy - y方向步进
 * @param {number} color - 己方棋子颜色
 * @returns {string} 9字符的线段字符串
 */
function extractLine(board, x, y, dx, dy, color) {
  let line = ''
  for (let i = -4; i <= 4; i++) {
    const nx = x + dx * i
    const ny = y + dy * i
    const cell = board.cells[ny * board.size + nx]
    if (cell === undefined || nx < 0 || nx >= board.size || ny < 0 || ny >= board.size) {
      line += '2'
    } else if (cell === 0) {
      line += '0'
    } else if (cell === color) {
      line += '1'
    } else {
      line += '2'
    }
  }
  return line
}
