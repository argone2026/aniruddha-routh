"use client";

import { useMemo, useState } from "react";

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

export default function HeroMiniGame() {
  const [cells, setCells] = useState<CellValue[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");

  const winner = useMemo(() => getWinner(cells), [cells]);
  const isDraw = useMemo(() => !winner && cells.every(Boolean), [winner, cells]);

  function handleCellClick(index: number) {
    if (cells[index] || winner) return;

    const next = [...cells];
    next[index] = turn;
    setCells(next);
    setTurn((prev) => (prev === "X" ? "O" : "X"));
  }

  function resetGame() {
    setCells(Array(9).fill(null));
    setTurn("X");
  }

  return (
    <div className="w-64 md:w-72 rounded-3xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-200 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Mini Tic-Tac-Toe</h3>
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
            className="h-16 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-2xl font-bold"
            aria-label={`Cell ${idx + 1}`}
          >
            {cell}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-indigo-100 min-h-5">
        {winner ? `Winner: ${winner}` : isDraw ? "Draw game" : `Turn: ${turn}`}
      </p>
    </div>
  );
}
