import type {GameStateData} from './types'
import StoryState from './StoryState'
import CombatState from './CombatState'
import {match} from 'ts-pattern'
import type { PlayerInput, Frame, InformationFrame, InputFrame, FrameSequence } from '../types'

export interface GameState {
    handleInput: (input: PlayerInput) => Promise<void>;
    currentFrames: ()=>Promise<  {frameSequence: FrameSequence, done: boolean}>;
}
export function defaultDiceRoll():number{
    return Math.ceil(Math.random() * 100)
}

export async function createGameState(gameStateDataPromise:Promise<GameStateData>):Promise<GameState>{
    let gameStateData = await gameStateDataPromise
    return match(gameStateData.round.type)
    .with('combat round', ()=>new CombatState(gameStateData, defaultDiceRoll))
    .with('story round', ()=>new StoryState(gameStateData, defaultDiceRoll))
    .exhaustive()
}
