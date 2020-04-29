import * as d3 from 'd3';
import Board from './board';

import './board-ui.css';

const MAIN_WIDTH = 800;
const MAIN_HEIGHT = 400;
const BOARD_PADDING = 5;
const OUTER_PADDING = 5;
const UNIT_PADDING = 10;
const SEED_RADIUS = 20;
const PIT_PADDING = 2;
const COLOR_VARIATION = 20;

function renderSeeds(elem: d3.BaseType, width: number, height: number,
                     player: boolean, seeds: number, baseSpread: number) {
    const circles = d3.select(elem).selectAll('circle').data(d3.range(0, seeds));
    const seedDist = Math.max(seeds, baseSpread) - 1;
    circles.enter().append('circle')
        .attr('class', 'seed')
        .style('fill', () => {
            const o = Math.floor(Math.random() * (COLOR_VARIATION * 2)) - COLOR_VARIATION;
            return `rgb(${121 + o}, ${96 + o}, ${62 + o})`;
        })
        .attr('cx', (seedIndex) => (UNIT_PADDING + (width - UNIT_PADDING * 2) / 2
            + (seedIndex % 2 === 0 ? -10 : 10)))
        .attr('cy', (seedIndex) => (
            UNIT_PADDING + SEED_RADIUS + PIT_PADDING
            + (height - UNIT_PADDING * 2 - SEED_RADIUS * 2 - PIT_PADDING * 2)
            * (player ? seedDist - seedIndex : seedIndex) / seedDist))
        .attr('r', SEED_RADIUS);
}

export type WhoseMove = boolean | 'none';
type OnClickPitFunc = (player: boolean, pitIndex: number) => void;

export default class BoardUi {
    private _svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private _width: number;
    private _height: number;
    private _unitWidth: number;
    private _unitHeight: number;
    private _pitCount: number;
    private _onClickPitFunc?: OnClickPitFunc;

    constructor(pitCount: number) {
        const outerWidth = MAIN_WIDTH;
        const outerHeight = MAIN_HEIGHT;
        this._width = outerWidth - BOARD_PADDING;
        this._height = outerHeight - BOARD_PADDING;
        (d3.select('.main').node() as HTMLElement).innerHTML = '';
        this._svg = d3.select('.main')
            .style('width', outerWidth + 'px')
            .style('height', outerHeight + 'px')
            .append('svg')
            .attr('width', outerWidth)
            .attr('height', outerHeight);
        this._svg.append('rect')
            .attr('class', 'board')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._width)
            .attr('height', this._height)
            .attr('rx', 30)
            .attr('ry', 30);
        this._pitCount = pitCount;
        this._unitWidth = (this._width - OUTER_PADDING * 2) / (2 + pitCount);
        this._unitHeight = (this._height - OUTER_PADDING * 2) / 2;
    }

    setWhoseMove(whoseMove: WhoseMove) {
        for (let pitIndex = 0; pitIndex < this._pitCount; pitIndex ++) {
            d3.select('#pit_0_' + pitIndex)
                .classed('playable', whoseMove === false);
            d3.select('#pit_1_' + pitIndex)
                .classed('playable', whoseMove === true);
        }
    }

    onClickPit(func?: OnClickPitFunc) {
        this._onClickPitFunc = func;
    }

    private _onClickPit(player: boolean, pitIndex: number) {
        if (this._onClickPitFunc) {
            this._onClickPitFunc(player, pitIndex);
        }
    }

    render(board: Board) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const ui = this;
        const unitWidth = this._unitWidth;
        const unitHeight = this._unitHeight;
        this._svg.selectAll('.column').remove();
        const columns = this._svg.selectAll('svg').data(d3.range(0, board.pitCount + 2));
        columns.enter().append('g')
            .classed('column', true)
            .attr('transform', (columnIndex) => (
                `translate(${OUTER_PADDING + columnIndex * unitWidth} ${OUTER_PADDING})`))
            .each(function(columnIndex) {
                if (columnIndex === 0 || columnIndex === board.pitCount + 1) {
                    const seeds = board.seedsInStore(columnIndex !== 0);
                    d3.select(this).append('rect')
                        .classed('store', true)
                        .attr('id', 'store_' + (columnIndex !== 0 ? 1 : 0))
                        .attr('x', UNIT_PADDING)
                        .attr('y', UNIT_PADDING)
                        .attr('width', unitWidth - UNIT_PADDING * 2)
                        .attr('height', unitHeight * 2 - UNIT_PADDING * 2)
                        .attr('rx', 20)
                        .attr('ry', 20);
                    renderSeeds(this, unitWidth, unitHeight * 2, columnIndex !== 0, seeds, board.seedCount / 2);
                } else {
                    const pits = d3.select(this).selectAll('g').data(d3.range(0, 2));
                    pits.enter().append('g')
                        .attr('transform', (player) => `translate(0 ${player * unitHeight})`)
                        .each(function(player) {
                            const pitIndex = player === 1 ? columnIndex - 1 : board.pitCount - columnIndex;
                            const seeds = board.seedsInPit(player === 1, pitIndex);
                            d3.select(this).append('rect')
                                .classed('pit', true)
                                .attr('id', 'pit_' + player + '_' + pitIndex)
                                .attr('x', UNIT_PADDING)
                                .attr('y', UNIT_PADDING)
                                .attr('width', unitWidth - UNIT_PADDING * 2)
                                .attr('height', unitHeight - UNIT_PADDING * 2)
                                .attr('rx', 10)
                                .attr('ry', 10)
                                // tslint:disable-next-line:no-console
                                .on('click', () => ui._onClickPit(player === 1, pitIndex));
                            renderSeeds(this, unitWidth, unitHeight, player === 1, seeds, 10);
                        });
                }
            });
    }
}