import Board from '../board';

export default function RandomAi(player: boolean, board: Board) {
    const moves = [];
    for (let i = 0; i < board.pitCount; i ++) {
        if (board.seedsInPit(player, i) > 0) {
            moves.push(i);
        }
    }
    return moves[Math.floor(Math.random() * moves.length)];
}