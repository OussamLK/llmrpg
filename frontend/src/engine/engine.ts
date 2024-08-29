import LLMConnector from "../LLMConnector";
import type { 
    InputFrame,
    InformationFrame,
    PlayerInput,
    FrameSequence
} from "../types";
import { GameState, createGameState } from "./GameState";

export default class Engine{
    private _llmConnector: LLMConnector
    private _gameState!: Promise<GameState>
    
    constructor(llmConnector: LLMConnector){
        this._llmConnector = llmConnector
        this._setNewState()
    }
    /**
     * Provides the current state frames to the UI
     */
    getFrames = async ():Promise<FrameSequence>=>{
        const gameState = await this._gameState
        const currentFrames = await gameState.currentFrames()
        return currentFrames.frameSequence
    }

    /**
     * Used by UI to notify the engine of a player action and let it update the state.
     */
    handleInput = async (playerInput: PlayerInput):Promise<void>=>{
        (await this._gameState).handleInput(playerInput)
    }

    private _setNewState = ()=>{
        this._gameState = createGameState(this._llmConnector.requestStoryDevelopment())

    }
}



