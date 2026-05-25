/**
 * 创建指定大小的空棋盘
 * @param {number} size - 棋盘大小（默认15）
 * @returns {Object} 棋盘对象，包含 size 和 cells 属性
 */
export function createBoard(size = 15) {
  return {
    size,
    cells: new Array(size * size).fill(0)
  }
}

/**
 * 获取指定位置的棋子颜色
 * @param {Object} board - 棋盘对象
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @returns {number|null} 0=空位, 1=黑棋, 2=白棋, null=越界
 */
export function getCell(board, x, y) {
  if (x < 0 || x >= board.size || y < 0 || y >= board.size) {
    return null
  }
  return board.cells[y * board.size + x]
}

/**
 * 在指定位置落子
 * @param {Object} board - 棋盘对象
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @param {number} color - 棋子颜色（1=黑棋, 2=白棋）
 * @returns {boolean} 是否成功落子
 */
export function placeStone(board, x, y, color) {
  if (getCell(board, x, y) !== 0) {
    return false
  }
  board.cells[y * board.size + x] = color
  return true
}

/**
 * 从指定位置沿某方向连续计数同色棋子
 * @param {Object} board - 棋盘对象
 * @param {number} x - 起始x坐标
 * @param {number} y - 起始y坐标
 * @param {number} dx - x方向步进
 * @param {number} dy - y方向步进
 * @param {number} color - 棋子颜色
 * @returns {number} 连续同色棋子数
 */
function countDirection(board, x, y, dx, dy, color) {
  let count = 0
  let nx = x + dx
  let ny = y + dy
  while (getCell(board, nx, ny) === color) {
    count++
    nx += dx
    ny += dy
  }
  return count
}

/**
 * 检查在指定位置落子后是否获胜（五连或以上）
 * @param {Object} board - 棋盘对象
 * @param {number} x - 最后落子的x坐标
 * @param {number} y - 最后落子的y坐标
 * @returns {boolean} 是否获胜
 */
export function checkWin(board, x, y) {
  const color = getCell(board, x, y)
  if (color === 0) return false

  const directions = [
    [1, 0],  // 水平
    [0, 1],  // 垂直
    [1, 1],  // 对角线 \
    [1, -1]  // 对角线 /
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    count += countDirection(board, x, y, dx, dy, color)
    count += countDirection(board, x, y, -dx, -dy, color)
    if (count >= 5) return true
  }
  return false
}

/**
 * 检查棋盘是否已满
 * @param {Object} board - 棋盘对象
 * @returns {boolean} 是否已满
 */
export function isBoardFull(board) {
  return board.cells.every(cell => cell !== 0)
}
