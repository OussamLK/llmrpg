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
    
    constructor(llmConnector: ILLMConnector, gameOverInterruptHandler: (msg:string)=>void){
        this._llmConnector = llmConnector
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
        const gameState:GameState = await match(newStoryDevelopment)
        .with(
            {type: P.string}, 
            async round=> await createGameState(round, this._llmConnector, this.playerStatus, this.inventory, this.gameOverInterruptHandler)
            )
        .with(P.array(), async lootItems=>{
            this.loot(lootItems);
            return await this._setNewState()
        }).exhaustive()
        return gameState

    }

    private async loot(items:Loot[]){
        this.addLootItems(items);
        this._gameState = this._setNewState()
        const lootFrames : InformationFrame[] = items.map(item=>({
            inventory: this.inventory,
            playerStatus: this.playerStatus,
            scene:{type:'event', prompt: `You found a ${item.name}`}}))
        await this._gameState
                .then(s=>s.currentFrames())
                .then(frames=>this.currentFrames=Promise.resolve({informationFrames:[...lootFrames, ...frames.informationFrames], inputFrame: frames.inputFrame}))
            console.debug("state is done, current frames are now: ", await this.getFrames())
        
    }


    private addLootItems(loot:Loot[]){
        const copy = structuredClone(loot)
        copy.sort((a,b)=>a.type === 'weapon' && b.type !== 'weapon' ? -1 : 1 )
        copy.forEach(item=>this.addLootItem(item))
    }
    /**
     * Always call weapons first when adding so that ammo can be added later
     */
    private addLootItem(loot:Loot){
       match(loot)
       .with({type:'key item'}, loot=>{
            this.inventory.keyItems.push(loot)
       }) 
       .with({type:'medicine'}, loot=>this.inventory.medicine.push(loot))
       .with({type:'ammo', quantity:P.select('quantity'), weaponName:P.select('weaponName')},
            ({quantity, weaponName})=>{
                const weaponEntry = this.inventory.weapons.find(w=>w.name === weaponName)
                if (!weaponEntry)
                    throw(`picking ammo of a wapon you do not have, weapon name is ${weaponName}`)
                if (!weaponEntry.ammo)
                    throw(`picking ammo of a weapon that does not require ammo ${weaponName}`)
                weaponEntry.ammo += quantity;
       })
       .with({type: 'weapon', details: {type: 'distance'}}, weapon=>{
            this.inventory.weapons.push({...weapon, ammo: 0})
       })
       .with({type: 'weapon', details: {type: 'melee'}}, weapon=>{
            this.inventory.weapons.push({...weapon, ammo: null})
       }).exhaustive()
    }

}



