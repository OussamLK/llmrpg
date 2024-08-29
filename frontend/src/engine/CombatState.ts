import { PlayerInput, Frame, Inventory, PlayerStatus, Weapon, InventoryAffordance, Enemy, Affordance, InformationFrame, InputFrame, FrameSequence } from "../types";
import { GameStateData, CombatRound, PlayerAction, DiceRoll, Turn } from "./types";
import { GameState } from "./GameState";
import { match, P } from "ts-pattern";

export default class CombatState implements GameState{
    private _inventory:Inventory
    private _playerStatus:PlayerStatus
    private _round: CombatRound
    private _roundCount: number
    private _diceRoll: DiceRoll
    private _currentFrames: Promise<FrameSequence>
    private _done: boolean

    constructor(gameStateData:GameStateData, diceRoll:DiceRoll){
        if (gameStateData.round.type !== 'combat round')
            throw("You are trying to construct a combat state from non combat data")
        this._inventory = gameStateData.inventory
        this._playerStatus = gameStateData.playerStatus
        this._round = gameStateData.round
        this._roundCount = gameStateData.roundCount
        this._diceRoll = diceRoll
        const {frameSequence, done} = this._initialStateFrames();
        this._currentFrames = Promise.resolve(frameSequence);
        this._done = done
    }

    /**
     * Takes input and updates the states, throws if the state returned done `true` in a `currentFrames` call
     */
    handleInput = async (input: PlayerInput): Promise<void>=>{
        const {round} = this._cloneState()
            if(round.turn !== 'player')
                throw(`Can not input on enemy turn, round is ${JSON.stringify(round)}, got input from player ${JSON.stringify(input)}`)
                
            match(input).with({type:'combat', action:'attack', enemyId:P.select()}, enemyId=>{
                if (!enemyId) throw("missing enemy missing")
                let informationFrames = [this._attackEnemy(enemyId)]
                const combatOver = this.combatOver()
                this._rotateTurn()
                while(this._round.turn !== 'player'){
                    if (combatOver){
                        this._done=true
                        switch(combatOver){
                            case 'won':
                                this._round.turn = 'win'
                                return
                            case 'lost':
                                this._round.turn = 'game over'
                                return
                            default:
                                combatOver satisfies never
                        }

                                
                    }
                    const turnEnemyId = this._round.turn as number
                    const enemy = this._getEnemyById(turnEnemyId)
                    if (!enemy) throw(`I can not find enemy ${turnEnemyId}`)
                    const frame = this._processEnemyAttack(enemy)
                    if (frame) informationFrames.push(frame)
                    this._rotateTurn()
                    
                }
                this._currentFrames = Promise.resolve({informationFrames:informationFrames, inputFrame: this.combatInputFrame()})
            })
            .otherwise(()=>{throw(`can not handle input ${JSON.stringify(input)} on player turn yet`)})
            
    }
    /**
     * Provides the current frames
     */
    
    currentFrames = async (): Promise<{frameSequence:FrameSequence, done: boolean}>=>{
        return {frameSequence: await this._currentFrames, done: this._done}
    }

    private combatInputFrame():InputFrame{
        const {inventory, playerStatus, round} = this._cloneState()
        return {
                inventory: {...inventory, affordances: this._getInventoryAffordances()},
                playerStatus,
                scene: {type: 'combat scene', enemies: round.enemies, affordances: this._getCombatAffordances() }
            }


    }

    _initialStateFrames = ():{frameSequence: FrameSequence, done: boolean}=>{
        if (this._round.turn === 'player'){
            const inputFrame : InputFrame = this.combatInputFrame()
            const frameSequence = {informationFrames: [], inputFrame}
            return {frameSequence, done: false}
        }
        else{
            throw(`I only know how to handle initial states for player initial turn, but got turn: '${this._round}'`)
        }
    }
    _cloneState = ()=>{
        return structuredClone({inventory: this._inventory, playerStatus: this._playerStatus, round: this._round})
    }
    /**
     * Creates the enemy attack frame, and updates the enemy stats
     * @returns {Frame[]}
     */
    private _attackEnemy(enemyId: number):InformationFrame{
        const {round, inventory, playerStatus} = this._cloneState()
        let equipedWeapon = undefined
        {
            //sanity checks
            if (round.type !== 'combat round') throw("Can not attack in non combat rounds")
            const attackPossible = this._weaponTypeMatchesEnemyPosition(enemyId) 
            if(! attackPossible) throw new Error("impossible to attack enemy with current weapon")
            equipedWeapon = this._getEquipedWeapon()
            if (!equipedWeapon) throw new Error("can not find equiped weapon")
        }
        const diceOutcome = this._diceRoll()
        const attackSucceeded = diceOutcome > equipedWeapon.details.difficulty
        if (!attackSucceeded)
            return {inventory,
                    playerStatus,
                    scene: {
                        type:"random event",
                        prompt:"attacking enemy",
                        outcomeMessage: "your attack failed",
                        probability:equipedWeapon.details.difficulty,
                        diceOutcome
                    }
                }
        
    
        const damage = equipedWeapon.damage
        const newEnemies = round.enemies.map(e=>{
            if (e.id !== enemyId) return e
            else return {...e, health: Math.max(0, e.health-damage)}
        })
        const enemiesAlive = newEnemies.filter(e=>e.health > 0)
        this._round.enemies = enemiesAlive        
        return {
            inventory,
            playerStatus,
            scene: {
                type: "random event",
                prompt: "attacking enemy",
                probability: 100-equipedWeapon.details.difficulty,
                diceOutcome,
                outcomeMessage: `You got it ${damage}`
            }
        }
    }

    /**
     * Create the information frame for the enemy attack, then updates the player stats.
     */
    private _processEnemyAttack = (enemy:Enemy):InformationFrame | null=>{
       const enemyCanAttack = enemy.position === enemy.attackType
       if (!enemyCanAttack) return null
       const diceOutcome = this._diceRoll()
       let outcomeMessage;
       if (diceOutcome < enemy.accuracy) {
            this._playerStatus.health = Math.max(0, this._playerStatus.health -  enemy.attackDamage);
            outcomeMessage =  `Enemy hits you, damage ${enemy.attackDamage}`
        }
        else {
            outcomeMessage = `Enemy missed his attack`
        } 
        return {inventory: {...this._inventory},
                playerStatus: {...this._playerStatus},
                scene: {type:"random event", prompt: "Enemy attack", probability: enemy.accuracy, diceOutcome, outcomeMessage}
            }
       
    }

    private combatOver = ():false | 'won' | 'lost'=>{
       if (this._playerStatus.health === 0)
            return 'lost'
       if (this._enemiesAlive().length === 0)
            return 'won'
       return false
       
    }

    _rotateTurn():void{
        const round = this._round
        this._round.turn = match(round.turn)
        .with('player', ()=>{
            if (round.enemies.filter(e=>e.health>0).length === 0)
                return 'win'
            else return Math.min(...round.enemies.map(e=>e.id))
            })
        .with(P.number, id=>{
            const nextId = Math.min(...round.enemies.filter(e=>e.id > id).map(e=>e.id))
            if (this._playerStatus.health === 0) return 'game over'
            return Number.isFinite(nextId) ? nextId : 'player'
        }).with(P._, ()=>{
            throw(`You are computing a next turn on a game that is over ${JSON.stringify(round)}`)
        }).exhaustive()

    }

    private _enemiesAlive(){
        return this._round.enemies.filter(e=>e.health>0)
    }
    
    private _weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = this._getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               (equipedWeapon.details.type === 'melee' && enemy.position === 'close')

    }
    private _getEquipedWeapon():Weapon & {ammo:number | null;}{
        const weapon =  this._inventory.weapons.find(w=>w.name === this._playerStatus.equipedWeapon)
        if (!weapon) {
            console.error(`Can not find equiped weapon,`, this)
            throw("Can not find equiped weapon")
        }
        return weapon
    }
    private _getEnemyById(enemyId:number):Enemy| null{
        const round = this._round
        if (round.type !== "combat round") {
            console.group(`damageEnemy Error`)
            console.table(round)
            console.groupEnd()
            throw("not in combat mode")
            
        }
        const enemy = round.enemies.find(e=>e.id===enemyId)
        return enemy || null

    }

    private _getInventoryAffordances(){
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

    private _getCombatAffordances(){
        return this._getAvailableActions().map(action=>this._createCombatAffordance(action))
    }
    private _getAvailableActions(){
                const wpeaonReachableEnemies: Enemy[] = this._round.enemies
                    .filter(e=>this._weaponTypeMatchesEnemyPosition(e.id))
                const attackActions:PlayerAction[] = wpeaonReachableEnemies.map(e=>({type:"attack", enemyId: e.id}))
                const distantEnemies = this._round.enemies.filter(e=>e.position === 'far')
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
    }
    private _createCombatAffordance(action:PlayerAction){

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
}