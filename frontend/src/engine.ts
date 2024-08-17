import type { 
    Inventory,
    PlayerStatus,
    Round,
    Weapon,
    Enemy,
    Affordance,
    InventoryAffordance,
    Frame,
    FrameLegacy,
    CombatRound
} from "./types";
import {P, match} from 'ts-pattern';
export type EngineGameStateUpdate = {newGameState: EngineGameState, eventDescription: string} 

export type EngineGameState = {
    inventory: Inventory,
    playerStatus: PlayerStatus,
    round: {count: number, currentRound:Round}
}

export type PlayerAction = (
    {type: 'attack', enemyId: number} |
    {type: 'move to enemy', enemyId: number} |
    'retreat' |
    'escape'
)

export function defaultDiceRoll(difficulty: number):boolean{
    return Math.random() * 100  > difficulty
}

export default class Engine{
    _gameState: EngineGameState
    _requestNewRound: any
    _diceRoll: (difficulty: number)=>boolean
    _frameBuffer: Frame[]
    /**
     * 
     * @param initialGameState 
     * @param requestNewRound 
     * @param diceRoll tells you wether an action with difficulty 0-100 succeeds
     */
    constructor(initialGameState:EngineGameState, requestNewRound: any, diceRoll: (difficulty:number)=>boolean){
        this._gameState = initialGameState
        this._requestNewRound = requestNewRound
        this._diceRoll = diceRoll
        this._frameBuffer = []
    }

    async getCurrentFrame():Promise<Frame>{
        const {inventory, playerStatus, round} = this._gameState;
        const roundDetails = round.currentRound.details
        return match(roundDetails)
            .with({type:'combat round', enemies:P.select()},
                enemies=>{
                const frame: Frame =  {
                    inventory: {...inventory, affordances: this._getInventoryAffordances()},
                    playerStatus,
                    scene: {type: 'combat scene', enemies, affordances: this._getRoundAffordances()}
                }
                return frame
            })
            .with({type:'story round', gamePrompt: P.select()},
                gamePrompt=>{
                   const frame: Frame = {inventory: {...inventory, affordances: this._getInventoryAffordances()},
                    playerStatus,
                    scene: {type: 'story scene', prompt: gamePrompt}}
                    return frame
                })
            .exhaustive()


    }

    /**
     * Used by the UI at the beginning of the game
     * @deprecated
     */
    async currentGameState():Promise<FrameLegacy>{
        const {round, playerStatus, inventory} = this._gameState
        const roundAffordances = this._getRoundAffordances()
        const inventoryAffordances = this._getInventoryAffordances()
        return {playerStatus,
                round: {...round, currentRound: {...round.currentRound, affordances: roundAffordances}},
                inventory: {...inventory, affordances: inventoryAffordances}
            }
    }

    /**
     * Used by UI to notify the engine of a player action
     * @param actionId 
     */
    async actionUpdateId(actionId:number){
        const action = this._getActionById(actionId)
        return await this._actionUpdate(action)

    }
    /**
     * Used by the inventory to notify the engine of an inventory action
     * @param inventoryAction
     */

    async inventoryActionUpdate(inventoryAction:InventoryAffordance):Promise<FrameLegacy>{
        throw("not implemented")
    }
    
    _getRoundAffordances():Affordance[]{
        const roundType = this._gameState.round.currentRound.details.type
        return match(roundType)
            .with('combat round', ()=> this._getAvailableActions().map(action=>this._createCombatAffordance(action)))
            .with('story round', ()=>[])
            .exhaustive()
    }
    
    _getAvailableActions():PlayerAction[]{
        const round = this._gameState.round.currentRound.details
        return match(round)
            .with({type: "combat round", enemies: P.select()}, enemies=>{
                const wpeaonReachableEnemies: Enemy[] = enemies.filter(e=>this._weaponTypeMatchesEnemyPosition(e.id))
                const attackActions:PlayerAction[] = wpeaonReachableEnemies.map(e=>({type:"attack", enemyId: e.id}))
                const distantEnemies = enemies.filter(e=>e.position === 'far')
                const moveToActions: PlayerAction[] = distantEnemies.map(e=>({
                    type: 'move to enemy',
                    enemyId: e.id
                }))
                const actions: PlayerAction[] = [
                    ...attackActions,
                    ...moveToActions,
                    'escape',
                    'retreat'
                ]
                return actions
            })
            .with({type: 'story round'}, ()=>{ return []}
            ).exhaustive()
    }


    _createCombatAffordance(action:PlayerAction):Affordance{
        return match(action)
            .with({type: 'attack', enemyId: P.select()},
                enemyId=>{
                    const affordance: Affordance = {type:'enemy', enemyId, prompt: "attack", description: `Attack enemy ${enemyId}`}
                    return affordance
                })
            .with('escape', ()=>{
                const affordance: Affordance = {type: 'independent', prompt: 'escape', description: "Escape combat!"}
                return affordance
            
            })
            .with('retreat', ()=>{
                const affordance : Affordance ={type: 'independent', prompt: 'retreat', description: "Retreat from enemies"}
                return affordance
            })
            .with({type: 'move to enemy', enemyId: P.select()}, enemyId=>{
                const affordance :Affordance ={type: 'enemy',enemyId, prompt: 'move to', description: `Get close to enemy ${enemyId}`}
                return affordance
            })
            .exhaustive()
    }

    _getActionById(actionId:number):PlayerAction{
        const action =  this._getAvailableActions()[actionId]
        if (!action)
            throw new Error(`Action ${actionId} not found`)
        return action

    }
    async _actionUpdate(action:PlayerAction){
        return match(action)
        .with({type:'attack', enemyId: P.select()},
            async (enemyId)=>await this._attackEnemy(enemyId))
        .with({type:'move to enemy', enemyId: P.select()}, enemyId=>this._moveToEnemy(enemyId))
        .with('retreat', ()=>this._retreat())
        .with('escape', ()=>this._escape())
        .exhaustive()

    }
    async _attackEnemy(enemyId: number):Promise<EngineGameStateUpdate>{
        const round = this._gameState.round.currentRound
        {
            //sanity checks
            if (round.details.type !== 'combat round') throw("Can not attack in non combat rounds")
            const attackPossible = this._weaponTypeMatchesEnemyPosition(enemyId) 
            if(! attackPossible) throw new Error("impossible to attack enemy with current weapon")
            const equipedWeapon = this._getEquipedWeapon()
            if (!equipedWeapon) throw new Error("can not find equiped weapon")
        }

        const attackSucceeded = this._diceRoll(this._getEquipedWeapon().details.difficulty)
        if (!attackSucceeded)
                return {
            newGameState: this._gameState,
            eventDescription: "action failed"
        }
        const damage = this._getEquipedWeapon().damage
        const newEnemies = round.details.enemies.map(e=>{
            if (e.id !== enemyId) return e
            else return {...e, health: Math.max(0, e.health-damage)}
        })
        const enemiesAlive = newEnemies.filter(e=>e.health > 0)
        if (enemiesAlive.length === 0) return await this._requestNewRound()
        
        const newGameState: EngineGameState = {
            ...this._gameState,
            round: {
                ...this._gameState.round,
                currentRound: {
                    details: {
                        type: "combat round",
                        enemies: newEnemies}}}}
        this._gameState = newGameState
        return {newGameState, eventDescription: "action succeeded"}
    }
    getEnemyById(enemyId:number):Enemy| null{
        const round = this._gameState.round.currentRound
        if (round.details.type !== "combat round") {
            console.group(`damageEnemy Error`)
            console.table(round)
            console.groupEnd()
            throw("not in combat mode")
            
        }
        const enemy = round.details.enemies.find(e=>e.id===enemyId)
        return enemy || null

    }
    _weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = this.getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               equipedWeapon.details.type === 'melee' && enemy.position === 'close' 

    }
    _getInventoryAffordances():InventoryAffordance[]{
        const {weapons, medicine, keyItems } = this._gameState.inventory;
        function usableWeapon(weapon: Weapon & {ammo: number | null}){ return weapon.ammo === null || weapon.ammo !== 0}
        const equipedWeapon = this._gameState.playerStatus.equipedWeapon
        const weaponAffordances: InventoryAffordance[] = weapons.map(
            w=>{
                if (usableWeapon(w) && w.name === equipedWeapon) return {itemName:w.name, prompts: ["discard"]}
                else if (usableWeapon(w)) return {itemName:w.name, prompts:["equip", "discard"]}
                else return {itemName: w.name, prompts: ['discard']}})
        const medicieAffordances: InventoryAffordance[] = medicine.map(m=>({itemName:m.name, prompts:['use', 'discard']})) 
        const keyItemsAffordances: InventoryAffordance[] = keyItems.map(m=>({itemName:m.name, prompts:[]}))
        return [...weaponAffordances, ...medicieAffordances, ...keyItemsAffordances]
    }
    _equipItem(itemName:string){
        throw("not implemented")
    }
    _moveToEnemy(enemyId:number){
        throw("not implemented")

    }
    _retreat(){
        throw("not implemented")

    }
    _escape(){
        throw("not implemented")

    }
    _getEquipedWeapon():Weapon & {ammo:number | null;}{
        const weapon =  this._gameState.inventory.weapons.find(w=>w.name === this._gameState.playerStatus.equipedWeapon)
        if (!weapon) {
            console.error(`Can not find equiped weapon,`, this._gameState)
            throw("Can not find equiped weapon")
        }
        return weapon
    }

}