import { match, P } from "ts-pattern";
import ILLMConnector from "../LLMConnector";
import type { 
    InputFrame,
    InformationFrame,
    PlayerInput,
    FrameSequence,
    PlayerStatus,
    Inventory,
    Frame
} from "../types";
import { GameState, createGameState } from "./GameState";
import { Loot } from "./types";

export default class Engine{
    private _llmConnector: ILLMConnector
    private _gameState!: Promise<GameState>
    private playerStatus: PlayerStatus
    private inventory: Inventory
    private currentFrames: Promise<FrameSequence>
    private gameOverInterruptHandler: (message:string)=>void
    
    constructor(story:string, keyDevelopments:string[], llmConnector: ILLMConnector, gameOverInterruptHandler: (msg:string)=>void){
        this._llmConnector = llmConnector
        llmConnector.initStory(story, keyDevelopments)
        const {inventory, playerStatus} = this._llmConnector.initialState()
        this.playerStatus = playerStatus
        this.inventory = inventory
        this._gameState = this._setNewState()
        this.currentFrames = this._gameState.then(state=>state.currentFrames())
        this.gameOverInterruptHandler = gameOverInterruptHandler
    }
    /**
     * Provides the current state frames to the UI
     */
    getFrames = async ():Promise<FrameSequence>=>{
        return structuredClone(await this.currentFrames)
    }

    /**
     * Used by UI to notify the engine of a player action and let it update the state.
     */
    handleInput = async (playerInput: PlayerInput):Promise<void>=>{
        const gameState = await this._gameState
        await gameState.handleInput(playerInput)
        if (gameState.done()){
            const oldFrames = (await gameState.currentFrames()).informationFrames
            this._gameState = this._setNewState()
            await this._gameState
                .then(s=>s.currentFrames())
                .then(frames=>this.currentFrames=Promise.resolve({informationFrames:[...oldFrames, ...frames.informationFrames], inputFrame: frames.inputFrame}))
            console.debug("state is done, current frames are now: ", await this.getFrames())
        }
        else {
            this.currentFrames = gameState.currentFrames()
        }
    }

    private _setNewState = async ():Promise<GameState>=>{
        const newStoryDevelopment = await this._llmConnector.requestStoryDevelopment()
        return await createGameState(newStoryDevelopment, this._llmConnector, this.playerStatus, this.inventory, this.gameOverInterruptHandler)

    }


}



