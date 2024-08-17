import Engine, {Queue} from '../src/engine'
import {getGameState, mockCombatState, combatRound} from '../src/mocks/gameStates'
import {PlayerAction, EngineGameState} from '../src/engine'


function requestingNewRound(){
    console.debug("requesting new round")
}
const engine = new Engine(mockCombatState, requestingNewRound, ()=>true)

describe("Queue works as expected", ()=>{
    it('Queue push, pops, and gets, correctly', ()=>{
        const queue = new Queue<number>()
        expect(queue.pop()).toBeNull();
        expect(queue.get()).toBeNull();
        queue.push(1);
        queue.push(2);
        expect(queue.get()).toBe(1);
        expect(queue.pop()).toBe(1);
        expect(queue.pop()).toBe(2);
        expect(queue.get()).toBeNull();
        expect(queue.pop()).toBeNull();
    })
} )

describe("Engine frames", ()=>{
    it("Combat affordances should be reachable enemies + 2", async ()=>{
        const currentFrame = await engine.getCurrentFrame()
        expect(currentFrame).not.toBeNull()
    })
})



let successEngine = new Engine(
    mockCombatState,
    requestingNewRound,
    ()=>true
)
let failureEngine = new Engine(
    mockCombatState,
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
            mockCombatState,
            requestingNewRound,
            ()=>true
        )
        failureEngine = new Engine(
            mockCombatState,
            requestingNewRound,
            ()=>false
        )
    })
    it("Weapon type should match enemy position", async ()=>{
        await expect(successEngine._attackEnemy(2)).rejects.toThrow()
    })
    it("Equiped weapon and ammo helpers", async ()=>{
        const equipedWeapon = successEngine._getEquipedWeapon();
        expect(equipedWeapon.name).toBe(mockCombatState.playerStatus.equipedWeapon)
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
        expect(failureEngineState.newGameState).toEqual(mockCombatState)

    })

})

describe("Equiping weapon", ()=>{

})