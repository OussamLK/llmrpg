import type {GameStateData} from './types'
import StoryState from './StoryState'
import CombatState from './CombatState'
import {match} from 'ts-pattern'
import type { PlayerInput, Frame, InformationFrame, InputFrame, FrameSequence } from '../types'
import LLMConnector from '../LLMConnector'

export interface GameState {
    handleInput: (input: PlayerInput) => Promise<void>;
    currentFrames: ()=>Promise<FrameSequence>;
    done: ()=>boolean
}
export function defaultDiceRoll():number{
    return Math.ceil(Math.random() * 100)
}

export async function createGameState(gameStateDataPromise:Promise<GameStateData>, llmConnector:LLMConnector):Promise<GameState>{
    let gameStateData = await gameStateDataPromise
    return match(gameStateData.round.type)
    .with('combat round', ()=>new CombatState(gameStateData, defaultDiceRoll, llmConnector))
    .with('story round', ()=>new StoryState(gameStateData, defaultDiceRoll, llmConnector))
    .exhaustive()
}
