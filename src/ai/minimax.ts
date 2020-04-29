import Board from '../board';

function tab(depth: number) {
    let ret = '';
    for (let i = 0; i < 4 - depth; i ++) {
        ret += '    ';
    }
    return ret;
}

function scoreBoard(board: Board, player: boolean,
                    depth: number, alpha: number, beta: number/*, moves: string*/): number {
    if (depth === 0) {
        const b = new Board(board);
        if (b.isGameOver()) {
            b.finish();
        }
        return b.seedsInStore(player) - b.seedsInStore(!player);
    }
    let bestScore = -board.seedCount;
    for (let i = board.pitCount - 1; i >= 0; i --) {
        if (board.seedsInPit(player, i) > 0) {
            const score = scoreMove(board, player, i, depth, alpha, beta/*, moves*/);
            if (bestScore === null || score > bestScore) {
                bestScore = score;
                alpha = Math.max(alpha, score);
                if (beta < alpha) {
                    break;
                }
            }
        }
    }
    // console.info(board.toString());
    // console.info(bestScore);
    return bestScore;
}

// let str = '';

function scoreMove(board: Board, player: boolean, pitIndex: number,
                   depth: number, alpha: number, beta: number/*, moves: string*/): number {
    // moves += ' ' + `${player ? 'S' : 'N'}${pitIndex + 1}`;
    // console.info(`${tab(depth)}testing ${player ? 'S' : 'N'}${pitIndex}`);
    const b = new Board(board);
    let score: number;
    // tslint:disable-next-line:prefer-conditional-expression
    if (b.move(player, pitIndex)) {
        score = scoreBoard(b, player, depth, alpha, beta/*, moves*/);
    } else {
        score = -scoreBoard(b, !player, depth - 1, -beta, -alpha/*, moves*/);
    }
    // str += moves + ' -> ' + score + ' [' + alpha + ',' + beta + ']' + '\n';
    return score;
}

function MinimaxAiBase(player: boolean, board: Board, invert: boolean, depth = 6) {
    let bestScore = null;
    let moves: number[] = [];
    let alpha = -48;
    const beta = 48;
    for (let i = board.pitCount - 1; i >= 0; i --) {
        if (board.seedsInPit(player, i) > 0) {
            let score = scoreMove(board, player, i, depth, alpha, beta);
            if (invert) {
                score = -score;
            }
            if (bestScore === null || score > bestScore) {
                bestScore = score;
                moves = [i];
                alpha = Math.max(alpha, score);
            } else if (score === bestScore) {
                moves.push(i);
            }
        }
    }
    // console.info(str);
    // console.info(moves.map((i) => i + 1));
    return moves[Math.floor(Math.random() * moves.length)];
}

export default function MinimaxAi(player: boolean, board: Board, depth = 8) {
    return MinimaxAiBase(player, board, false, depth);
}

export function InverseMinimaxAi(player: boolean, board: Board, depth = 8) {
    return MinimaxAiBase(player, board, true, depth);
}