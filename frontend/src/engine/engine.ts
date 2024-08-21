import LLMConnector from "../LLMConnector";
import type { 
    Frame,
    PlayerInput
} from "../types";
import { GameState, createGameState } from "./GameState";

export default class Engine{
    private _llmConnector: LLMConnector
    private _gameState!: Promise<GameState>
    private _currentFrames!: Promise<Frame[]>
    
    constructor(llmConnector: LLMConnector){
        this._llmConnector = llmConnector
        this._setNewState()
    }

    getFrames = async ():Promise<Frame[]>=>{
        return await this._currentFrames
    }

    /**
     * Used by UI to notify the engine of a player action
     */
    reportInput = async (playerInput: PlayerInput):Promise<void>=>{
        const transitionData = this._gameState.then(state=>state.handleInput(playerInput))
        this._currentFrames = transitionData.then(data=>data.transitionFrames)
        const done = (await transitionData).done
        if (done) this._setNewState()
    }

    private _setNewState = ()=>{
        this._gameState = createGameState(this._llmConnector.requestStoryDevelopment())
        this._currentFrames = this._gameState.then(state=>state.initialFrames())

    }
}



