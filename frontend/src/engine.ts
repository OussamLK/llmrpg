import { 
    GameState,
    GameEvent,
    PlayerAction,
    EnvironmentEvent,
    Weapon,
    Enemy
} from "./types";
import {P, match} from 'ts-pattern';
export type EngineGameStateUpdate = {newGameState: GameState, eventDescription: string} 

export function defaultDiceRoll(difficulty: number):boolean{
    return Math.random() * 100  > difficulty
}

export default class Engine{
    gameState: GameState
    requestNewRound: any
    diceRoll: (difficulty: number)=>boolean
    /**
     * 
     * @param initialGameState 
     * @param requestNewRound 
     * @param diceRoll tells you wether an action with difficulty 0-100 succeeds
     */
    constructor(initialGameState:GameState, requestNewRound: any, diceRoll: (difficulty:number)=>boolean){
        this.gameState = initialGameState
        this.requestNewRound = requestNewRound
        this.diceRoll = diceRoll
    }
    async update(event:GameEvent){
        return match(event).with(
            {type: 'action', details: P.select()},
            async (action)=>await this.actionUpdate(action) 
        ).with(
            {type: 'environment', details: P.select()},
            (event)=>this.environmentUpdate(event)
        ).exhaustive()
    }
    async actionUpdate(action:PlayerAction){
        return match(action)
        .with({type:'attack', enemyId: P.select('enemyId'), damage:P.select('damage') },
            async ({enemyId, damage})=>await this._damageEnemy(enemyId, damage))
        .with({type:'equip', itemName: P.select()}, itemName=>this._equipItem(itemName))
        .with({type:'move to enemy', enemyId: P.select()}, enemyId=>this._moveToEnemy(enemyId))
        .with('retreat', ()=>this._retreat())
        .with('escape', ()=>this._escape())
        .exhaustive()

    }
    async _damageEnemy(enemyId: number , damage: number):Promise<EngineGameStateUpdate>{
        const round = this.gameState.round.currentRound
        {
            //sanity checks
            if (round.details.type !== 'combat round') throw("Can not attack in non combat rounds")
            const attackPossible = this.weaponTypeMatchesEnemyPosition(enemyId) 
            if(! attackPossible) throw new Error("impossible to attack enemy with current weapon")
            const equipedWeapon = this._getEquipedWeapon()
            if (!equipedWeapon) throw new Error("can not find equiped weapon")
        }

        const attackSucceeded = this.diceRoll(this._getEquipedWeapon().details.difficulty)
        if (!attackSucceeded)
                return {
            newGameState: this.gameState,
            eventDescription: "action failed"
        }

        const newEnemies = round.details.enemies.map(e=>{
            if (e.id !== enemyId) return e
            else return {...e, health: Math.max(0, e.health-damage)}
        })
        const enemiesAlive = newEnemies.filter(e=>e.health > 0)
        if (enemiesAlive.length === 0) return await this.requestNewRound()
        
        const newGameState: GameState = {
            ...this.gameState,
            round: {
                ...this.gameState.round,
                currentRound: {
                    details: {
                        type: "combat round",
                        enemies: newEnemies}}}}
        this.gameState = newGameState
        return {newGameState, eventDescription: "action succeeded"}
    }
    getEnemyById(enemyId:number):Enemy| null{
        const round = this.gameState.round.currentRound
        if (round.details.type !== "combat round") {
            console.group(`damageEnemy Error`)
            console.table(round)
            console.groupEnd()
            throw("not in combat mode")
            
        }
        const enemy = round.details.enemies.find(e=>e.id===enemyId)
        return enemy || null

    }
    weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = this.getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               equipedWeapon.details.type === 'melee' && enemy.position === 'close' 

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
        const weapon =  this.gameState.inventory.weapons.find(w=>w.name === this.gameState.playerStatus.equipedWeapon)
        if (!weapon) {
            console.error(`Can not find equiped weapon,`, this.gameState)
            throw("Can not find equiped weapon")
        }
        return weapon
    }

    async environmentUpdate(event:EnvironmentEvent){


    }
}