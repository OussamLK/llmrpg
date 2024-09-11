import { PlayerInput, Frame, InformationFrame, InputFrame, Inventory, PlayerStatus, InventoryAffordance, Weapon, FrameSequence } from "../types";
import { DiceRoll, Loot, Round, StoryRound } from "./types";
import { GameState } from "./GameState";
import ILLMConnector from "../LLMConnector";
import {match, P} from 'ts-pattern'

export default class StoryState implements GameState{
    private _inventory:Inventory
    private _playerStatus:PlayerStatus
    private _round: StoryRound
    private _diceRoll: DiceRoll
    private _done: boolean
    private llmConnector: ILLMConnector

    constructor(round:Round, diceRoll:DiceRoll, llmConnector:ILLMConnector, playerStatus: PlayerStatus, inventory:Inventory){
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
        if (!this._round.loot){
            const frameSequence = {informationFrames: [], inputFrame: frame}
            return frameSequence
        } 
        else{
            const loot = this._round.loot
            this.addLootItem(loot)
            return {
                informationFrames: [
                    {inventory: this._inventory,
                    playerStatus: this._playerStatus,
                    scene: {type:'event', prompt: `You found ${loot.name}`}}
                ],
                inputFrame: frame
            }
        }

    }

    done = ():boolean=>{
        return this._done
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
            this._inventory.keyItems.push(loot)
       }) 
       .with({type:'medicine'}, loot=>this._inventory.medicine.push(loot))
       .with({type:'ammo', quantity:P.select('quantity'), weaponName:P.select('weaponName')},
            ({quantity, weaponName})=>{
                const weaponEntry = this._inventory.weapons.find(w=>w.name === weaponName)
                if (!weaponEntry)
                    throw(`picking ammo of a wapon you do not have, weapon name is ${weaponName}`)
                if (!weaponEntry.ammo)
                    throw(`picking ammo of a weapon that does not require ammo ${weaponName}`)
                weaponEntry.ammo += quantity;
       })
       .with({type: 'weapon', details: {type: 'distance'}}, weapon=>{
            this._inventory.weapons.push({...weapon, ammo: 0})
       })
       .with({type: 'weapon', details: {type: 'melee'}}, weapon=>{
            this._inventory.weapons.push({...weapon, ammo: null})
       }).exhaustive()
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