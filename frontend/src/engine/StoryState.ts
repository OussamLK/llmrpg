import { PlayerInput, Frame, InformationFrame, InputFrame, Inventory, PlayerStatus, InventoryAffordance, Weapon, FrameSequence } from "../types";
import { DiceRoll, GameStateData, StoryRound } from "./types";
import { GameState } from "./GameState";

export default class StoryState implements GameState{
    private _inventory:Inventory
    private _playerStatus:PlayerStatus
    private _round: StoryRound
    private _roundCount: number
    private _diceRoll: DiceRoll

    constructor(gameStateData:GameStateData, diceRoll:DiceRoll){
        if (gameStateData.round.type !== 'story round')
            throw("You are trying to construct a story state from non story data")
        this._inventory = gameStateData.inventory
        this._playerStatus = gameStateData.playerStatus
        this._round = gameStateData.round
        this._roundCount = gameStateData.roundCount
        this._diceRoll= diceRoll
        
    }
    handleInput = async (input: PlayerInput): Promise<void>=>{
        throw("not implemented")
    }
    currentFrames = async (): Promise<{frameSequence: FrameSequence, done: boolean} >=>{
            const frame: InputFrame = {
                inventory: {...this._inventory, affordances: await this._getInventoryAffordances()},
                playerStatus:this._playerStatus,
                scene: {type: 'story scene', prompt: this._round.gamePrompt}
            }
            const frameSequence = {informationFrames: [], inputFrame: frame}
            return {frameSequence, done: false}

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