import Engine, {Buffer} from '../src/engine'
import {getGameState, mockCombatState as mockCombatState_, combatRound} from '../src/mocks/gameStates'
import {PlayerAction, GameState} from '../src/engine'

import {MockLLMConnector} from '../src/LLMConnector'
const mockLLMConnector = new MockLLMConnector()
const mockCombatState = (async ()=>mockCombatState_)()

function requestingNewRound(){
    console.debug("requesting new round")
}
const engine = new Engine(mockCombatState, mockLLMConnector, ()=>true)

describe("Queue works as expected", ()=>{
    it('Queue push, pops, and gets, correctly', ()=>{
        const queue = new Buffer<number>()
        expect(queue.get(0)).toBeNull();
        queue.push(1);
        queue.push(2);
        expect(queue.get(0)).toBe(1);
        expect(queue.get(1)).toBe(2);
    })
} )

describe("Engine frames", ()=>{
    it("Combat affordances should be reachable enemies + 2", async ()=>{
        const currentFrame = await engine.getFrame(0)
        expect(currentFrame).not.toBeNull()
    })
})



let successEngine = new Engine(
    mockCombatState,
    mockLLMConnector,
    ()=>true
)
let failureEngine = new Engine(
    mockCombatState,
    mockLLMConnector,
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
            mockLLMConnector,
            ()=>true
        )
        failureEngine = new Engine(
            mockCombatState,
            mockLLMConnector,
            ()=>false
        )
    })

})

describe("Equiping weapon", ()=>{

})