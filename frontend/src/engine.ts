import LLMConnector from "./LLMConnector";
import type { 
    Inventory,
    PlayerStatus,
    Medicine,
    Ammo,
    KeyItem,
    Weapon,
    Enemy,
    Affordance,
    InventoryAffordance,
    Frame,
    Scene,
    CombatInput,
    InventoryInput,
    StoryInput
} from "./types";
import {P, match} from 'ts-pattern';


export default class Engine{
    private _gameState: EngineGameState
    private _llmConnector: LLMConnector
    private _diceRoll: (difficulty: number)=>boolean
    private _frameBuffer: Buffer<Frame>
    /**
     * 
     * @param initialGameState 
     * @param requestNewRound 
     * @param diceRoll tells you wether an action with difficulty 0-100 succeeds
     */
    constructor(initialGameState:EngineGameState, llmConnector: LLMConnector, diceRoll: (difficulty:number)=>boolean){
        this._gameState = initialGameState
        this._llmConnector = llmConnector
        this._diceRoll = diceRoll
        this._frameBuffer = new Buffer<Frame>()
        //testing
        this._frameBuffer.push(this._createEventFrame("random"))
        this._frameBuffer.push(this._createEventFrame("event"))
        this._frameBuffer.push(this._getFrameFromGameState(this._gameState))
    }

    async getFrame(frameId:number):Promise<Frame>{
        const frame = this._frameBuffer.get(frameId)
        if (!frame) throw("should not be null")
        return frame
    }

    /**
     * Used by UI to notify the engine of a player action
     * @param actionId 
     */
    combatInput(input:CombatInput){
        console.group("combat input")
        console.debug("Got combat input notification from UI")
        console.table(input)
        console.groupEnd()
    }

    storyInput(input: StoryInput){
        console.group("story input")
        console.debug("Got story input notification from UI", input)
        console.table(input)
        console.groupEnd()
    }

    inventoryInput(input: InventoryInput){
        console.group("inventory input")
        console.debug("Got inventory input notification from UI")
        console.table(input)
        console.groupEnd()
    }



    /**
     * just for testing
     * @returns @deprecated
     */
    private _createEventFrame(type:string):Frame{

        const scene: Scene = "random"===type ?
        {
            type: 'random event',
            prompt: "You are about to open a chest",
            probability: 60,
            diceOutcome: 50,
            outcomeMessage: "You found nothing"
        }
                :  
                {
                    type: 'event',
                    prompt: "a normal event"
                }; 
        return {
            inventory :{
                ...this._gameState.inventory,
                affordances: null //player can not use inventory during events
            }, 
            playerStatus: this._gameState.playerStatus,
            scene
        }
    }

    private _getFrameFromGameState(gameState:EngineGameState):Frame{
        const {inventory, playerStatus, round} = gameState;
        const roundDetails = round.details
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

    
    private _getRoundAffordances():Affordance[]{
        const roundType = this._gameState.round.details.type
        return match(roundType)
            .with('combat round', ()=> this._getAvailableActions().map(action=>this._createCombatAffordance(action)))
            .with('story round', ()=>[])
            .exhaustive()
    }
    
    private _getAvailableActions():PlayerAction[]{
        const round = this._gameState.round.details
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


    private _createCombatAffordance(action:PlayerAction):Affordance{
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

    private _getActionById(actionId:number):PlayerAction{
        const action =  this._getAvailableActions()[actionId]
        if (!action)
            throw new Error(`Action ${actionId} not found`)
        return action

    }
    private async _actionUpdate(action:PlayerAction){
        return match(action)
        .with({type:'attack', enemyId: P.select()},
            async (enemyId)=>await this._attackEnemy(enemyId))
        .with({type:'move to enemy', enemyId: P.select()}, enemyId=>this._moveToEnemy(enemyId))
        .with('retreat', ()=>this._retreat())
        .with('escape', ()=>this._escape())
        .exhaustive()

    }
    private async _attackEnemy(enemyId: number):Promise<EngineGameState>{
        const round = this._gameState.round
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
                return this._gameState
    
        const damage = this._getEquipedWeapon().damage
        const newEnemies = round.details.enemies.map(e=>{
            if (e.id !== enemyId) return e
            else return {...e, health: Math.max(0, e.health-damage)}
        })
        const enemiesAlive = newEnemies.filter(e=>e.health > 0)
        if (enemiesAlive.length === 0) return await this._nextGameState()
        
        const newGameState: EngineGameState = {
            ...this._gameState,
            round: 
                 {
                    details: {
                        type: "combat round",
                        enemies: newEnemies},}}
        this._gameState = newGameState
        return newGameState
    }
    private _weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = this._getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               equipedWeapon.details.type === 'melee' && enemy.position === 'close' 

    }
    private _getEquipedWeapon():Weapon & {ammo:number | null;}{
        const weapon =  this._gameState.inventory.weapons.find(w=>w.name === this._gameState.playerStatus.equipedWeapon)
        if (!weapon) {
            console.error(`Can not find equiped weapon,`, this._gameState)
            throw("Can not find equiped weapon")
        }
        return weapon
    }
    private _getEnemyById(enemyId:number):Enemy| null{
        const round = this._gameState.round
        if (round.details.type !== "combat round") {
            console.group(`damageEnemy Error`)
            console.table(round)
            console.groupEnd()
            throw("not in combat mode")
            
        }
        const enemy = round.details.enemies.find(e=>e.id===enemyId)
        return enemy || null

    }
    private _getInventoryAffordances():InventoryAffordance[]{
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
    private _equipItem(itemName:string){
        throw("not implemented")
    }
    private _moveToEnemy(enemyId:number){
        throw("not implemented")

    }
    private _retreat(){
        throw("not implemented")

    }
    private _escape(){
        throw("not implemented")

    }
    private _nextGameState():EngineGameState{
        throw("not yet implemented")
    }

}

export function defaultDiceRoll(difficulty: number):boolean{
    return Math.random() * 100  > difficulty
}

export class Buffer<T>{
    private _frames: {[id:number]:T}
    private _nextAvailableId: number
    constructor(){
        this._frames = []
        this._nextAvailableId = 0
    }
    push(item:T){
        this._frames[this._nextAvailableId] = item;
        this._nextAvailableId++
    }
    get(frameId:number){
        return this._frames[frameId] || null
    }
    private _empty(exceptId:number){
        this._frames = {[exceptId]:this._frames[exceptId]}
    }
}


export type Loot = {
    details: Weapon | Medicine | KeyItem | Ammo
}

export type Round = {
    details: CombatRound | StoryRound
}

export type CombatRound = {
    type: 'combat round',
    enemies: Enemy[]
    loot?: Loot[]
}

export type StoryRound = {
    type : 'story round',
    gamePrompt: string,
    loot?: Loot
}

export type EnemyTurn = number
export type Turn = 'player' | EnemyTurn


export type EngineGameState = {
    inventory: Inventory,
    playerStatus: PlayerStatus,
    round: Round
    roundCount: number
}

export type PlayerAction = (
    {type: 'attack', enemyId: number} |
    {type: 'move to enemy', enemyId: number} |
    'retreat' |
    'escape'
)