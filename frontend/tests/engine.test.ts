import {getGameState, mockCombatState, combatRound} from '../src/mocks/gameStates'
import {PlayerAction} from '../src/engine/types'
import CombatState from '../src/engine/CombatState'
import Engine from '../src/engine/engine'
import {MockLLMConnector} from '../src/LLMConnector'
import { defaultDiceRoll } from '../src/engine/GameState'
import { CombatScene, Frame } from '../src/types'

const mockLLMConnector = new MockLLMConnector()


function pprintFrame(frame:Frame){
    if (frame.scene.type === 'random event')
        return `${frame.scene.prompt}: ${frame.scene.outcomeMessage}, health is ${frame.playerStatus.health}`
    else if(frame.scene.type ==='combat scene')
            `input required: remaining enemies ${frame.scene.enemies.filter(e=>e.health>0).map(e=>`${e.description}: ${e.health}`)}`
}

function successDiceRoll(){
    return 0
}

function failureDiceRoll(){
    return 100
}

async function displayCombatStateFrames(label:string, combatState:CombatState){
    console.group(label)
    const {frameSequence:{informationFrames, inputFrame}, done} = await combatState.currentFrames()
    console.table(informationFrames.map(f=>({...(f.scene), ...f.playerStatus})))
    let combatScene = inputFrame?.scene as CombatScene
    console.table(combatScene.enemies)
    console.log(`State done is ${done}`)
    console.groupEnd()
}

describe("GameStates work correctly", ()=>{
    it("Combat state works correctly", async ()=>{
        const combatStateSuccess = new CombatState(mockCombatState, successDiceRoll)
        const combatStateFailure = new CombatState(mockCombatState, failureDiceRoll)
        await displayCombatStateFrames("starting state", combatStateSuccess)
        combatStateSuccess.handleInput({type:'inventory', action:'equip', itemName:'machete'})
        combatStateSuccess.handleInput({type: "combat", action:"attack", enemyId:1})
        let {frameSequence, done} = await combatStateSuccess.currentFrames()
        expect(frameSequence.informationFrames.length).toBe(3)
        expect(frameSequence.inputFrame).not.toBeNull()
        await displayCombatStateFrames("after attacking enemy 1", combatStateSuccess)
        combatStateSuccess.handleInput({type: "combat", action:"move to", enemyId:3})
        await displayCombatStateFrames("after moving to enemy 1", combatStateSuccess)
        combatStateSuccess.handleInput({type: "combat", action:"attack", enemyId:3})
        await displayCombatStateFrames("after attack of enemy 3", combatStateSuccess)
        combatStateSuccess.handleInput({type:'combat', action:'retreat'})
        await displayCombatStateFrames("after retreat", combatStateSuccess)

    })
})


describe("Engine work correctly", ()=>{
    it("Engine works in Combat state", async ()=>{
        const successEngine = new Engine(mockLLMConnector)
        let frames = await successEngine.getFrames()
        successEngine.handleInput({type:'inventory', action:'equip', itemName:'machete'})
        frames = await successEngine.getFrames()
        successEngine.handleInput({type: "combat", action:"attack", enemyId:1})
        frames = await successEngine.getFrames()
        successEngine.handleInput({type: "combat", action:"move to", enemyId:3})
        frames = await successEngine.getFrames()
        successEngine.handleInput({type: "combat", action:"attack", enemyId:3})
        frames = await successEngine.getFrames()
        successEngine.handleInput({type:'combat', action:'retreat'})
        frames = await successEngine.getFrames()
        0;

    })
})