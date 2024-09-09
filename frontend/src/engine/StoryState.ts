import { PlayerInput, Frame, InformationFrame, InputFrame, Inventory, PlayerStatus, InventoryAffordance, Weapon, FrameSequence } from "../types";
import { DiceRoll, GameStateData, Round, StoryRound } from "./types";
import { GameState } from "./GameState";
import LLMConnector from "../LLMConnector";

export default class StoryState implements GameState{
    private _inventory:Inventory
    private _playerStatus:PlayerStatus
    private _round: StoryRound
    private _diceRoll: DiceRoll
    private _done: boolean
    private llmConnector: LLMConnector

    constructor(round:Round, diceRoll:DiceRoll, llmConnector:LLMConnector, playerStatus: PlayerStatus, inventory:Inventory){
        if (round.type !== 'story round')
            throw("You are trying to construct a story state from non story data")
        this._inventory = inventory
        this._playerStatus = playerStatus
        this._round = round
        this._diceRoll= diceRoll
        this._done = false
        this.llmConnector = llmConnector
        
    }

    handleInput = async (input: PlayerInput): Promise<void>=>{
        if (typeof input !== 'string')
            throw('story input has to be a string')
        this.llmConnector.reportPlayerInput(input)
        this._done = true
    }

    currentFrames = async (): Promise<FrameSequence>=>{
        const frame: InputFrame = {
            inventory: {...this._inventory, affordances: await this._getInventoryAffordances()},
            playerStatus:this._playerStatus,
            scene: {type: 'story scene', prompt: this._round.gamePrompt}
        }
        const frameSequence = {informationFrames: [], inputFrame: frame}
        return frameSequence

    }

    done = ():boolean=>{
        return this._done
    }

    private async _getInventoryAffordances():Promise<InventoryAffordance[]>{
        const {weapons, medicine, keyItems } = this._inventory;
        function usableWeapon(weapon: Weapon & {ammo: number | null}){ return weapon.ammo === null || weapon.ammo !== 0}
        const equipedWeapon = this._playerStatus.equipedWeapon
        const weaponAffordances: InventoryAffordance[] = weapons.map(
            w=>{
                if (usableWeapon(w) && w.name === equipedWeapon) return {itemName:w.name, prompts: ["discard"]}
                else if (usableWeapon(w)) return {itemName:w.name, prompts:["equip", "discard"]}
                else return {itemName: w.name, prompts: ['discard']}})
        const medicieAffordances: InventoryAffordance[] = medicine.map(m=>({itemName:m.name, prompts:['use', 'discard']})) 
        const keyItemsAffordances: InventoryAffordance[] = keyItems.map(m=>({itemName:m.name, prompts:[]}))
        return [...weaponAffordances, ...medicieAffordances, ...keyItemsAffordances]
    }

}