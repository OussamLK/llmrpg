import type { Inventory, PlayerStatus, Enemy, Weapon, Medicine, KeyItem, Ammo } from "../types";


export type GameStateData = {
    inventory: Inventory;
    playerStatus: PlayerStatus;
    round: Round;
    roundCount: number;
};

export type PlayerAction = (
    { type: 'attack'; enemyId: number; } |
    { type: 'move to enemy'; enemyId: number; } |
    'retreat' |
    'escape');

export type Round = CombatRound | StoryRound;


export type CombatRound = {
    type: 'combat round';
    enemies: Enemy[];
    loot?: Loot[];
    turn: Turn;
};

export type StoryRound = {
    type: 'story round';
    gamePrompt: string;
    loot?: Loot; //if loot is defined, the game expects no input. The player just grabs the loot
};
/**
 * @deprecated
 */

export class Buffer<T> {
    private _frames: { id: number; frame: T; }[];
    private _nextAvailableId: number;
    constructor() {
        this._frames = [];
        this._nextAvailableId = 0;
    }
    push(frame: T) {
        this._frames.push({ id: this._nextAvailableId, frame });
        this._nextAvailableId++;
    }
    get(id: number) {
        const frameOb = this._frames.find(f => f.id === id);
        if (!frameOb) {
            return null;
        }
        this._clear(id);
        return frameOb.frame;
    }
    private _clear(upToExclusive: number) {
        this._frames = this._frames.filter(frame => frame.id >= upToExclusive);
    }

}

export type EnemyTurn = number;

export type Turn = 'player' | EnemyTurn | 'win' | 'game over';

export type Loot = Weapon | Medicine | KeyItem | Ammo;

export type DiceRoll = ()=>number