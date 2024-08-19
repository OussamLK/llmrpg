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
    PlayerInput
} from "./types";
import {P, match} from 'ts-pattern';


export default class Engine{
    private _gameState: Promise<GameState>
    private _llmConnector: LLMConnector
    private _diceRoll: (difficulty: number)=>boolean
    private _frameBuffer: Buffer<Promise<Frame>>
    /**
     * 
     * @param initialGameState 
     * @param requestNewRound 
     * @param diceRoll tells you wether an action with difficulty 0-100 succeeds
     */
    constructor(initialGameState:Promise<GameState>, llmConnector: LLMConnector, diceRoll: (difficulty:number)=>boolean){
        this._gameState = initialGameState
        this._llmConnector = llmConnector
        this._diceRoll = diceRoll
        this._frameBuffer = new Buffer<Promise<Frame>>()
        this._pushCurrentStateFrames()
    }

    async getFrame(frameId:number):Promise<Frame>{
        const frame = await this._frameBuffer.get(frameId)
        if (!frame) {
            throw(`Asking for an unexisting frame id ${frameId}`)
        }
        return frame
    }

    /**
     * Used by UI to notify the engine of a player action
     */
    reportInput = (input: PlayerInput)=>{
        this._processCurrentStateWithInput(input)
    }

    async _processCurrentStateWithInput(input:PlayerInput){
        const newState = this._getNextStateWithInput(input)
        this._setCurrentState(newState)
        if (! await this._currentStateRequiresInput()) await this._processCurrentStateWithoutInput()
    }

    async _processCurrentStateWithoutInput(){
        console.trace(`Got in`)
        const newState = this._getNextStateWithoutInput()
        console.trace(newState)
        this._setCurrentState(newState)
        if (! await this._currentStateRequiresInput()) await this._processCurrentStateWithoutInput()
    }

    async _getNextStateWithInput(input:PlayerInput):Promise<GameState>{
        console.trace('got here')
        const round = (await this._gameState).round
        if (round.type === 'story round'){
            this._llmConnector.reportEvent(`Player said ${input}`)
            return await this._llmConnector.requestStoryDevelopment()
        }
        else throw("can not deal with combat yet")
    }    

    async _getNextStateWithoutInput():Promise<GameState>{
        const round = (await this._gameState).round
        if (round.type === 'story round'){
            if (round.loot ===null) throw("non loot round do require input!")
            return await this._llmConnector.requestStoryDevelopment()
        }
        else throw(`I can not process combat yet`)
    }

    async _currentStateRequiresInput():Promise<boolean>{
        const round = (await this._gameState).round
        const playerTurn = round.type === 'combat round' && round.turn === 'player'
        const storyPrompt = round.type === 'story round' && (!round.loot)
        const answer = playerTurn || storyPrompt
        console.trace(`state requiest input? ${answer} in state`, JSON.stringify(round))
        return answer
    }

    _setCurrentState(newState:Promise<GameState>){
        console.debug(`setting the new game state`, newState)
        this._gameState = newState
        this._pushCurrentStateFrames()
    }

    _pushCurrentStateFrames(){
        const frame = this._getFrameFromGameState(this._gameState)
        this._frameBuffer.push(frame)
    }

    /**
     * just for testing
     * @returns @deprecated
     */
    private async _createEventFrame(type:string):Promise<Frame>{
        const gameState = await this._gameState
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
                ...gameState.inventory,
                affordances: null //player can not use inventory during events
            }, 
            playerStatus: gameState.playerStatus,
            scene
        }
    }

    private async _getFrameFromGameState(gameState:Promise<GameState>):Promise<Frame>{
        const {inventory, playerStatus, round} = await gameState;
        return match(round)
            .with({type:'combat round', enemies:P.select()},
                async enemies=>{
                const frame: Frame =  {
                    inventory: {...inventory, affordances: await this._getInventoryAffordances()},
                    playerStatus,
                    scene: {type: 'combat scene', enemies, affordances: await this._getRoundAffordances()}
                }
                return frame
            })
            .with({type:'story round', gamePrompt: P.select()},
                async gamePrompt=>{
                   const frame: Frame = {inventory: {...inventory, affordances: await this._getInventoryAffordances()},
                    playerStatus,
                    scene: {type: 'story scene', prompt: gamePrompt}}
                    return frame
                })
            .exhaustive()


    }

    
    private async _getRoundAffordances():Promise<Affordance[]>{
        const gameState = await this._gameState
        const roundType = gameState.round.type
        return match(roundType)
            .with('combat round', async()=> (await this._getAvailableActions()).map(action=>this._createCombatAffordance(action)))
            .with('story round', ()=>[])
            .exhaustive()
    }
    
    private async _getAvailableActions():Promise<PlayerAction[]>{
        const gameState = await this._gameState
        const round = gameState.round
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

    private async _getActionById(actionId:number):Promise<PlayerAction>{
        const action =  (await this._getAvailableActions())[actionId]
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
    private async _attackEnemy(enemyId: number):Promise<GameState>{
        const gameState = await this._gameState
        const round = gameState.round
        {
            //sanity checks
            if (round.type !== 'combat round') throw("Can not attack in non combat rounds")
            const attackPossible = this._weaponTypeMatchesEnemyPosition(enemyId) 
            if(! attackPossible) throw new Error("impossible to attack enemy with current weapon")
            const equipedWeapon = this._getEquipedWeapon()
            if (!equipedWeapon) throw new Error("can not find equiped weapon")
        }

        const attackSucceeded = this._diceRoll((await this._getEquipedWeapon()).details.difficulty)
        if (!attackSucceeded)
                return this._gameState
    
        const damage = (await this._getEquipedWeapon()).damage
        const newEnemies = round.enemies.map(e=>{
            if (e.id !== enemyId) return e
            else return {...e, health: Math.max(0, e.health-damage)}
        })
        const enemiesAlive = newEnemies.filter(e=>e.health > 0)
        if (enemiesAlive.length === 0) return await this._nextGameState()
        
        const newGameState: GameState = {
            ...this._gameState,
        //@ts-ignore
            round: 
                 {
                        type: "combat round",
                        enemies: newEnemies}}
        this._gameState = new Promise((res,rej)=>res(newGameState))
        return newGameState
    }

    private async _weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = await this._getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = await this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               equipedWeapon.details.type === 'melee' && enemy.position === 'close' 

    }
    private async _getEquipedWeapon():Promise<Weapon & {ammo:number | null;}>{
        const gameState = await this._gameState
        const weapon =  gameState.inventory.weapons.find(w=>w.name === gameState.playerStatus.equipedWeapon)
        if (!weapon) {
            console.error(`Can not find equiped weapon,`, this._gameState)
            throw("Can not find equiped weapon")
        }
        return weapon
    }
    private async _getEnemyById(enemyId:number):Promise<Enemy| null>{
        const gameState = await this._gameState
        const round = gameState.round
        if (round.type !== "combat round") {
            console.group(`damageEnemy Error`)
            console.table(round)
            console.groupEnd()
            throw("not in combat mode")
            
        }
        const enemy = round.enemies.find(e=>e.id===enemyId)
        return enemy || null

    }
    private async _getInventoryAffordances():Promise<InventoryAffordance[]>{
        const gameState = await this._gameState
        const {weapons, medicine, keyItems } = gameState.inventory;
        function usableWeapon(weapon: Weapon & {ammo: number | null}){ return weapon.ammo === null || weapon.ammo !== 0}
        const equipedWeapon = gameState.playerStatus.equipedWeapon
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
    private _nextGameState():GameState{
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
    debug(){
        return this._frames
    }
}

export type GameState = {
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

export type Round =  CombatRound | StoryRound


export type CombatRound = {
    type: 'combat round',
    enemies: Enemy[]
    loot?: Loot[]
    turn: Turn
}

export type StoryRound = {
    type : 'story round',
    gamePrompt: string,
    loot?: Loot
}

export type EnemyTurn = number

export type Turn = 'player' | EnemyTurn

export type Loot = Weapon | Medicine | KeyItem | Ammo


