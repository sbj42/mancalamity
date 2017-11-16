import Board from '../board';

function scoreMove(board: Board, player: boolean, pitIndex: number): number {
    const b = new Board(board);
    if (b.move(player, pitIndex)) {
        let bestScore = -board.seedCount;
        for (let i = 0; i < board.pitCount; i ++) {
            if (b.seedsInPit(player, i) > 0) {
                const score = scoreMove(b, player, i);
                if (bestScore === null || score > bestScore) {
                    bestScore = score;
                }
            }
        }
        return bestScore;
    }
    if (b.isGameOver()) {
        b.finish();
    }
    return b.seedsInStore(player) - b.seedsInStore(!player);
}

export default function GreedyAi(player: boolean, board: Board) {
    let bestScore = null;
    let moves: number[] = [];
    for (let i = 0; i < board.pitCount; i ++) {
        if (board.seedsInPit(player, i) > 0) {
            const score = scoreMove(board, player, i);
            if (bestScore === null || score > bestScore) {
                bestScore = score;
                moves = [i];
            } else if (score === bestScore) {
                moves.push(i);
            }
        }
    }
    return moves[Math.floor(Math.random() * moves.length)];
}