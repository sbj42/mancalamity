import Board from './board';
import BoardUi, {WhoseMove} from './board-ui';
import * as d3 from 'd3';

import RandomAi from './ai/random';
import GreedyAi from './ai/greedy';
import MinimaxAi, {InverseMinimaxAi} from './ai/minimax';

import './index.css';

let southAi = 'user';
let northAi = 'random';
let southWins = 0;
let northWins = 0;
let ties = 0;
let fastMode = false;

function start() {
    const b = new Board(6, 4);
    const bui = new BoardUi(b.pitCount);
    let whoseMove: WhoseMove;
    whoseMove = true;
    // whoseMove = Math.random() < 0.5;

    function move(player: boolean, pitIndex: number) {
        if (player !== whoseMove || b.seedsInPit(player, pitIndex) < 1) {
            return;
        }
        // // tslint:disable-next-line:no-console
        // console.info((player ? 'S' : 'N') + (pitIndex + 1));
        if (!b.move(whoseMove, pitIndex)) {
            whoseMove = !whoseMove;
        }
        if (b.isGameOver()) {
            b.finish();
            whoseMove = 'none';
        }
        ready();
    }

    function ready() {
        bui.render(b);
        bui.setWhoseMove(whoseMove);
        if (whoseMove === 'none') {
            const scoreDiff = (b.seedsInStore(true) - b.seedsInStore(false));
            const winner = scoreDiff > 0 ? 'south' : scoreDiff < 0 ? 'north' : 'nobody';
            if (winner === 'north') {
                northWins ++;
            } else if (winner === 'south') {
                southWins ++;
            } else {
                ties ++;
            }
            d3.select('.status')
                .text(`game over: ${winner} wins`);
            d3.select('.results')
                .text(`north: ${northWins}, south: ${southWins}, tie: ${ties}`
                + ` S/(N+S)=${(southWins / (northWins + southWins) * 100).toFixed(1)}`);
            if (fastMode) {
                setTimeout(start, 0);
            }
            return;
        }
        const player = whoseMove;
        const ai = player === true ? southAi : northAi;
        const mover = player ? 'south' : 'north';
        bui.onClickPit(undefined);
        if (ai === 'user') {
            d3.select('.status')
            .text(`${mover}'s turn`);
            bui.onClickPit(move);
        } else {
            d3.select('.status')
            .text(`${mover}'s turn: AI is thinking`);
            const delay = fastMode ? 0 : 400;
            if (ai === 'foolish') {
                setTimeout(() => {
                    move(player, InverseMinimaxAi(player, b));
                }, delay);
            } else if (ai === 'random') {
                setTimeout(() => {
                    move(player, RandomAi(player, b));
                }, delay);
            } else if (ai === 'greedy') {
                setTimeout(() => {
                    move(player, GreedyAi(player, b));
                }, delay);
            } else if (ai === 'minimax') {
                setTimeout(() => {
                    move(player, MinimaxAi(player, b));
                }, delay);
            }
        }
    }

    ready();
}

function addAis(selection: d3.Selection<HTMLSelectElement, unknown, HTMLElement, any>, prefix: string) {
    selection.append('option')
        .attr('value', 'user')
        .text(`${prefix}: User`);
    selection.append('option')
        .attr('value', 'foolish')
        .text(`${prefix}: Foolish Frank`);
    selection.append('option')
        .attr('value', 'random')
        .text(`${prefix}: Random Rachel`);
    selection.append('option')
        .attr('value', 'greedy')
        .text(`${prefix}: Greedy Greg`);
    selection.append('option')
        .attr('value', 'minimax')
        .text(`${prefix}: Minnie Max`);
}

d3.select('body')
    .append('div')
        .classed('title', true)
        .text('mancalamity');
{
    const controls = d3.select('body')
        .append('div')
            .classed('controls', true);
    {
        const north = controls.append('div')
            .classed('control', true)
            .append('select')
            .on('change', function() {
                northAi = d3.select(this).property('value');
            });
        addAis(north, 'north');
    }
    {
        const south = controls.append('div')
            .classed('control', true)
            .append('select')
            .on('change', function() {
                southAi = d3.select(this).property('value');
            });
        addAis(south, 'south');
    }
    {
        const div = controls.append('div')
            .classed('control', true);
        div.append('input')
            .attr('type', 'checkbox')
            .on('change', function() {
                fastMode = d3.select(this).property('checked');
            });
        div.append('span')
            .text('fast mode (for AI vs AI)');
    }
    controls.append('div')
        .classed('control', true)
        .append('input')
        .attr('type', 'button')
        .attr('value', 'new game')
        .on('click', start);
}
{
    const status = d3.select('body')
        .append('div')
            .classed('status', true);
}
d3.select('body')
    .append('div')
        .classed('main', true);
d3.select('body')
    .append('div')
        .classed('results', true);

start();