import Engine from '../src/engine'
import {getInitialGameState, initialGameState, combatRound, storyRound} from '../src/mocks/gameStates'
import {GameEvent, PlayerAction} from '../src/types'
const combatState = getInitialGameState({details: combatRound})

function requestingNewRound(){
    console.debug("requesting new round")
}

let successEngine = new Engine(
    combatState,
    requestingNewRound,
    ()=>true
)
let failureEngine = new Engine(
    combatState,
    requestingNewRound,
    ()=>false
)

function attackEnemyAction(enemyId:number){

    const attackAction: GameEvent = {type:"action", details:{type:"attack", enemyId}}
    return attackAction
}

describe("Engine attack", ()=>{
    beforeAll(()=>{
        successEngine = new Engine(
            combatState,
            requestingNewRound,
            ()=>true
        )
        failureEngine = new Engine(
            combatState,
            requestingNewRound,
            ()=>false
        )
    })
    it("weapon type should match enemy position", async ()=>{
        await expect(successEngine._attackEnemy(2)).rejects.toThrow()
    })
    it("equiped weapon and ammo helpers", async ()=>{
        const equipedWeapon = successEngine._getEquipedWeapon();
        expect(equipedWeapon.name).toBe(initialGameState.playerStatus.equipedWeapon)
        expect(equipedWeapon.ammo).toBe(20)

    })
    it("successful attack should damage enemy" , async ()=>{
        const attackEnemy1 = attackEnemyAction(1)
        await successEngine.update(attackEnemy1)
        const enemy = successEngine.getEnemyById(1)
        if (!enemy) throw("you should find enemy 1")
        expect(enemy.health).toBe(70);
    })
    it("failed Attack should not change the state", async ()=>{
        const failureEngineState = await failureEngine._attackEnemy(1)
        expect(failureEngineState.newGameState).toEqual(combatState)

    })

})

describe("Equiping weapon", ()=>{

})