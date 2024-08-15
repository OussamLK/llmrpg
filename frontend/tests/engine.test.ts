import Engine from '../src/engine'
import {getInitialGameState, initialGameState, combatRound} from '../src/mocks/gameStates'
import {PlayerAction, EngineGameState} from '../src/engine'
const combatState = getInitialGameState({details: combatRound})

function requestingNewRound(){
    console.debug("requesting new round")
}
const engine = new Engine(combatState, requestingNewRound, ()=>true)

describe("Engine Affordances", ()=>{
    it("Combat affordances should be reachable enemies + 2", async ()=>{
        const uiState = await engine.currentGameState()
        expect(uiState).not.toBeNull()
    })
})



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

    const attackAction: PlayerAction = {type:"attack", enemyId}
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
    it("Weapon type should match enemy position", async ()=>{
        await expect(successEngine._attackEnemy(2)).rejects.toThrow()
    })
    it("Equiped weapon and ammo helpers", async ()=>{
        const equipedWeapon = successEngine._getEquipedWeapon();
        expect(equipedWeapon.name).toBe(initialGameState.playerStatus.equipedWeapon)
        expect(equipedWeapon.ammo).toBe(20)

    })
    it("Successful attack should damage enemy" , async ()=>{
        const attackEnemy1 = attackEnemyAction(1)
        await successEngine._actionUpdate(attackEnemy1)
        const enemy = successEngine.getEnemyById(1)
        if (!enemy) throw("you should find enemy 1")
        expect(enemy.health).toBe(70);
    })
    it("Failed attack should not change the state", async ()=>{
        const failureEngineState = await failureEngine._attackEnemy(1)
        expect(failureEngineState.newGameState).toEqual(combatState)

    })

})

describe("Equiping weapon", ()=>{

})