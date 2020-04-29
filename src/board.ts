export default class Board {
    private _locations: number[];
    private _pitCount: number;
    private _seedCount: number;

    constructor(board: Board);
    constructor(pitCount: number, seedsPerPit: number);
    constructor(pitCount: number | Board, seedsPerPit?: number) {
        if (pitCount instanceof Board) {
            const other = pitCount;
            this._locations = [...other._locations];
            this._pitCount = other._pitCount;
            this._seedCount = other._seedCount;
        } else if (typeof seedsPerPit === 'number') {
            this._locations = [];
            this._pitCount = pitCount;
            this._seedCount = 2 * pitCount * seedsPerPit;
            for (let player = 0; player < 2; player ++) {
                for (let i = 0; i < pitCount; i ++) {
                    this._locations.push(seedsPerPit);
                }
                this._locations.push(0);
            }
        } else {
            throw new Error(`Bad arguments`);
        }
    }

    private _pitLocationIndex(player: boolean, pitIndex: number) {
        if (pitIndex < 0 || pitIndex >= this._pitCount) {
            throw new Error(`Bad pit index ${pitIndex}`);
        }
        return (player ? this._pitCount + 1 : 0) + pitIndex;
    }

    private _storeLocationIndex(player: boolean) {
        return this._pitCount + (player ? this._pitCount + 1 : 0);
    }

    get pitCount() {
        return this._pitCount;
    }

    get seedCount() {
        return this._seedCount;
    }

    seedsInPit(player: boolean, pitIndex: number) {
        return this._locations[this._pitLocationIndex(player, pitIndex)];
    }

    seedsInStore(player: boolean) {
        return this._locations[this._storeLocationIndex(player)];
    }

    move(player: boolean, pitIndex: number) {
        let loc = this._pitLocationIndex(player, pitIndex);
        // remove all seeds from the pit
        let seeds = this._locations[loc];
        this._locations[loc] = 0;
        let side = player;
        let at = pitIndex;
        for (;;) {
            // moving around the board
            at ++;
            loc ++;
            // except for opponent's store
            if (at === this._pitCount && side !== player || at > this._pitCount) {
                at = 0;
                side = !side;
                loc = this._pitLocationIndex(side, at);
            }
            // deposit seeds one by one
            seeds --;
            if (seeds === 0) {
                break;
            }
            this._locations[loc] ++;
        }
        // if the last seed lands in the player's store
        if (at === this._pitCount) {
            this._locations[loc] ++;
            // the player gets another move
            return true;
        }
        // if last seed lands in an empty pit owned by the player
        if (side === player && this._locations[loc] === 0) {
            const captureIndex = this._locations.length - 2 - loc;
            const capture = this._locations[captureIndex];
            // and the opposite pit contains seeds
            if (capture > 0) {
                // both the last seed and the opposite seeds are captured
                this._locations[this._storeLocationIndex(player)] += capture + 1;
                this._locations[captureIndex] = 0;
                return false;
            }
        }
        this._locations[loc] ++;
        return false;
    }

    private _hasNoSeeds(player: boolean) {
        let loc = this._pitLocationIndex(player, 0);
        for (let index = 0; index < this._pitCount; index ++) {
            if (this._locations[loc] > 0) {
                return false;
            }
            loc ++;
        }
        return true;
    }

    isGameOver() {
        return this._hasNoSeeds(false) || this._hasNoSeeds(true);
    }

    private _clearSide(player: boolean) {
        let loc = this._pitLocationIndex(player, 0);
        let seeds = 0;
        for (let index = 0; index < this._pitCount; index ++) {
            seeds += this._locations[loc];
            this._locations[loc] = 0;
            loc ++;
        }
        this._locations[loc] += seeds;
    }

    finish() {
        if (!this.isGameOver()) {
            throw new Error(`Can't finish: the game isn't over`);
        }
        this._clearSide(false);
        this._clearSide(true);
    }

    private _pad(n: number | '') {
        const len = String(this._seedCount).length;
        let ret = String(n);
        while (ret.length < len) {
            ret = ' ' + ret;
        }
        return ret;
    }

    toString() {
        let ret = this._pad(this._locations[this._storeLocationIndex(false)]) + ' |';
        for (let index = 0; index < this._pitCount; index ++) {
            ret += ' ' + this._pad(this._locations[this._pitLocationIndex(false, this._pitCount - 1 - index)]);
        }
        ret += ' |\n' + this._pad('') + ' |';
        for (let index = 0; index < this._pitCount; index ++) {
            ret += ' ' + this._pad(this._locations[this._pitLocationIndex(true, index)]);
        }
        ret += ' | ' + this._pad(this._locations[this._storeLocationIndex(true)]);
        return ret;
    }
}