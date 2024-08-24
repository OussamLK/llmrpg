import {getGameState, mockCombatState, combatRound} from '../src/mocks/gameStates'
import {PlayerAction} from '../src/engine/types'
import CombatState from '../src/engine/CombatState'

import {MockLLMConnector} from '../src/LLMConnector'
import { defaultDiceRoll } from '../src/engine/GameState'
import { Frame } from '../src/types'
const mockLLMConnector = new MockLLMConnector()

function pprintFrame(frame:Frame){
    if (frame.scene.type === 'random event')
        return `${frame.scene.prompt}: ${frame.scene.outcomeMessage}, health is ${frame.playerStatus.health}`
    else if(frame.scene.type ==='combat scene')
            `input required: remaining enemies ${frame.scene.enemies.filter(e=>e.health>0).map(e=>`${e.description}: ${e.health}`)}`
}

describe("GameStates work correctly", ()=>{
    it("Combat state works correctly", async ()=>{
        const combatState = new CombatState(mockCombatState, defaultDiceRoll)
        let done = false
        let frames :Frame[]= []
        while(!done){
            let {transitionFrames, done:done_} = await combatState.handleInput("attack")
            frames = frames.concat(transitionFrames)
            const framesDigest = transitionFrames.map(f=>pprintFrame(f)).join("\n")
            done = done_
        }
        const pframes = frames.map(f=>pprintFrame(f)).join("\n")
        expect(frames).not.toBeNull()
    })
})
