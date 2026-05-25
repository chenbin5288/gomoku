import { describe, it, expect } from 'vitest'
import { createBoard, placeStone, getCell, checkWin, isBoardFull } from '../../src/game/board.js'

describe('createBoard', () => {
  it('应该创建指定大小的空棋盘', () => {
    const board = createBoard(15)
    expect(board.size).toBe(15)
    expect(board.cells.length).toBe(15 * 15)
    expect(board.cells.every(cell => cell === 0)).toBe(true)
  })

  it('应该支持不同大小', () => {
    const board19 = createBoard(19)
    expect(board19.size).toBe(19)
    expect(board19.cells.length).toBe(19 * 19)
  })
})

describe('placeStone', () => {
  it('应该在空位落子', () => {
    const board = createBoard(15)
    placeStone(board, 7, 7, 1)
    expect(getCell(board, 7, 7)).toBe(1)
  })

  it('应该返回是否成功', () => {
    const board = createBoard(15)
    expect(placeStone(board, 7, 7, 1)).toBe(true)
    expect(placeStone(board, 7, 7, 2)).toBe(false)
  })
})

describe('checkWin', () => {
  it('应该检测水平五连', () => {
    const board = createBoard(15)
    placeStone(board, 5, 7, 1)
    placeStone(board, 6, 7, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 7, 1)
    placeStone(board, 9, 7, 1)
    expect(checkWin(board, 9, 7)).toBe(true)
  })

  it('应该检测垂直五连', () => {
    const board = createBoard(15)
    placeStone(board, 7, 5, 1)
    placeStone(board, 7, 6, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 7, 8, 1)
    placeStone(board, 7, 9, 1)
    expect(checkWin(board, 7, 9)).toBe(true)
  })

  it('应该检测对角线五连', () => {
    const board = createBoard(15)
    placeStone(board, 5, 5, 1)
    placeStone(board, 6, 6, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 8, 1)
    placeStone(board, 9, 9, 1)
    expect(checkWin(board, 9, 9)).toBe(true)
  })

  it('应该检测反对角线五连', () => {
    const board = createBoard(15)
    placeStone(board, 5, 9, 1)
    placeStone(board, 6, 8, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 6, 1)
    placeStone(board, 9, 5, 1)
    expect(checkWin(board, 9, 5)).toBe(true)
  })

  it('四连不应该判胜', () => {
    const board = createBoard(15)
    placeStone(board, 5, 7, 1)
    placeStone(board, 6, 7, 1)
    placeStone(board, 7, 7, 1)
    placeStone(board, 8, 7, 1)
    expect(checkWin(board, 8, 7)).toBe(false)
  })
})

describe('isBoardFull', () => {
  it('空棋盘不应该满', () => {
    const board = createBoard(3)
    expect(isBoardFull(board)).toBe(false)
  })

  it('满棋盘应该返回 true', () => {
    const board = createBoard(3)
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        placeStone(board, x, y, (x + y) % 2 + 1)
      }
    }
    expect(isBoardFull(board)).toBe(true)
  })
})
