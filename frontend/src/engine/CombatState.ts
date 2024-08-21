
import { PlayerInput, Frame, Inventory, PlayerStatus, Weapon, InventoryAffordance, Enemy, Affordance } from "../types";
import { GameStateData, StoryRound, CombatRound, PlayerAction, DiceRoll } from "./types";
import { GameState } from "./GameState";
import { match, P } from "ts-pattern";

export default class CombatState implements GameState{
    private _inventory:Inventory
    private _playerStatus:PlayerStatus
    private _round: CombatRound
    private _roundCount: number
    private _diceRoll: DiceRoll
    constructor(gameStateData:GameStateData, diceRoll:DiceRoll){
        if (gameStateData.round.type !== 'combat round')
            throw("You are trying to construct a combat state from non combat data")
        this._inventory = gameStateData.inventory
        this._playerStatus = gameStateData.playerStatus
        this._round = gameStateData.round
        this._roundCount = gameStateData.roundCount
        this._diceRoll = diceRoll
        
    }
    handleInput = async (input: PlayerInput): Promise<{ transitionFrames: Frame[]; done: boolean; }>=>{
        return {transitionFrames:[this._attackEnemy(this._round.enemies[0].id), ...this._getCurrentStateFrames()], done:false}
    }
    initialFrames = async (): Promise<Frame[]>=>{
        return this._getCurrentStateFrames()
    }


    private _getCurrentStateFrames():Frame[]{
        if (this._round.turn === 'player'){
                const frame: Frame =  {
                    inventory: {...this._inventory, affordances: this._getInventoryAffordances()},
                    playerStatus:this._playerStatus,
                    scene: {type: 'combat scene', enemies:this._round.enemies, affordances: this._getCombatAffordances()}
                }
                return [frame]
        }
        else {
            //enemies turn
            const frames: Frame[] = this._round.enemies.map(enemy=>this._processEnemyAttack(enemy)).filter(f=>f!==null)
            return frames
        }

    }

    private _processEnemyAttack = (enemy:Enemy):Frame | null=>{
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
        return {inventory: {...this._inventory, affordances: this._getInventoryAffordances()},
                playerStatus: this._playerStatus,
                scene: {type:"random event",prompt: "Enemy attack", probability: enemy.accuracy, diceOutcome, outcomeMessage}
            }
       
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
    private async _weaponTypeMatchesEnemyPosition(enemyId: number){
        const enemy = await this._getEnemyById(enemyId);
        if (!enemy) throw(`Can not find enemy ${enemyId}`)
        const equipedWeapon = await this._getEquipedWeapon();
        return (equipedWeapon.details.type === 'distance' && enemy.position === 'far') ||
               equipedWeapon.details.type === 'melee' && enemy.position === 'close' 

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
    private _attackEnemy(enemyId: number):Frame{
        const round = this._round
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
        this._round.turn = this._round.enemies[0].id
        if (!attackSucceeded)
            return {inventory:{...this._inventory, affordances: null},
                    playerStatus: this._playerStatus,
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
        //@ts-ignore
        let done;
        if (enemiesAlive.length === 0) done = true
        this._round.enemies = enemiesAlive        
        return {
            inventory: {...this._inventory, affordances: null},
            playerStatus: this._playerStatus,
            scene: {
                type: "random event",
                prompt: "attacking enemy",
                probability: 100-equipedWeapon.details.difficulty,
                diceOutcome,
                outcomeMessage: `You got it ${damage}`
            }
        }
    }
}