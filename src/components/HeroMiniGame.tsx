"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CellValue = "X" | "O" | null;

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(cells: CellValue[]) {
  for (const [a, b, c] of WIN_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

function getAvailableMoves(cells: CellValue[]): number[] {
  return cells
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null) as number[];
}

function evaluateBoard(cells: CellValue[]): number {
  const winner = getWinner(cells);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  return 0;
}

function minimax(cells: CellValue[], depth: number, isMaximizing: boolean): number {
  const score = evaluateBoard(cells);

  if (score === 10) return score - depth;
  if (score === -10) return score + depth;

  const available = getAvailableMoves(cells);
  if (available.length === 0) return 0;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of available) {
      const next = [...cells];
      next[move] = "O";
      const moveScore = minimax(next, depth + 1, false);
      maxScore = Math.max(maxScore, moveScore);
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of available) {
      const next = [...cells];
      next[move] = "X";
      const moveScore = minimax(next, depth + 1, true);
      minScore = Math.min(minScore, moveScore);
    }
    return minScore;
  }
}

function findBestAIMove(cells: CellValue[]): number {
  const available = getAvailableMoves(cells);
  if (available.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const next = [...cells];
    next[move] = "O";
    const moveScore = minimax(next, 0, false);
    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }

  return bestMove;
}

export default function HeroMiniGame() {
  const [cells, setCells] = useState<CellValue[]>(Array(9).fill(null));
  const [isAIThinking, setIsAIThinking] = useState(false);

  const winner = useMemo(() => getWinner(cells), [cells]);
  const isDraw = useMemo(() => !winner && cells.every(Boolean), [winner, cells]);
  const userHasMoved = useMemo(() => cells.some((c) => c === "X"), [cells]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (cells[index] || winner || isAIThinking) return;

      const next = [...cells];
      next[index] = "X";
      setCells(next);
    },
    [cells, winner, isAIThinking]
  );

  // AI move effect
  useEffect(() => {
    if (isAIThinking || winner || isDraw) return;

    const hasX = cells.some((c) => c === "X");
    const hasO = cells.some((c) => c === "O");

    // AI's turn: X just played, now O plays
    if (hasX && !hasO) {
      // Initial board: user plays first
      return;
    }

    const xCount = cells.filter((c) => c === "X").length;
    const oCount = cells.filter((c) => c === "O").length;

    // It's AI's turn when X count > O count and no winner yet
    if (xCount > oCount && xCount <= 5) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const available = getAvailableMoves(cells);
        if (available.length > 0) {
          const aiMove = findBestAIMove(cells);
          const next = [...cells];
          next[aiMove] = "O";
          setCells(next);
        }
        setIsAIThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [cells, winner, isDraw, isAIThinking]);

  function resetGame() {
    setCells(Array(9).fill(null));
  }

  return (
    <div className="w-64 md:w-72 rounded-3xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-200 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Tic-Tac-Toe</h3>
        <button
          onClick={resetGame}
          className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cells.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={isAIThinking || !!winner || isDraw}
            className="h-16 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-50 transition-colors flex items-center justify-center text-2xl font-bold"
            aria-label={`Cell ${idx + 1}`}
          >
            {cell}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-indigo-100 min-h-5">
        {winner === "X"
          ? "You won! 🎉"
          : winner === "O"
            ? "AI won 🤖"
            : isDraw
              ? "Draw game"
              : isAIThinking
                ? "AI thinking..."
                : !userHasMoved
                  ? "Your turn"
                  : "AI's turn"}
      </p>
    </div>
  );
}
