import type {GameStateData, Round} from './types'
import StoryState from './StoryState'
import CombatState from './CombatState'
import {match} from 'ts-pattern'
import type { PlayerInput, Frame, InformationFrame, InputFrame, FrameSequence, Inventory, PlayerStatus } from '../types'
import LLMConnector from '../LLMConnector'

export interface GameState {
    handleInput: (input: PlayerInput) => Promise<void>;
    currentFrames: ()=>Promise<FrameSequence>;
    done: ()=>boolean
}
export function defaultDiceRoll():number{
    return Math.ceil(Math.random() * 100)
}

export async function createGameState(
        round:Round,
        llmConnector:LLMConnector,
        playerStatus: PlayerStatus,
        inventory: Inventory,
        gameOverInterruptHandler: (msg:string)=>void
    )
            :Promise<GameState>{
    return match(round.type)
    .with('combat round', ()=>new CombatState(round, defaultDiceRoll, llmConnector, playerStatus, inventory, gameOverInterruptHandler))
    .with('story round', ()=>new StoryState(round, defaultDiceRoll, llmConnector, playerStatus, inventory))
    .exhaustive()
}
