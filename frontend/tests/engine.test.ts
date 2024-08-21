import {getGameState, mockCombatState, combatRound} from '../src/mocks/gameStates'
import {PlayerAction} from '../src/engine/types'
import CombatState from '../src/engine/CombatState'

import {MockLLMConnector} from '../src/LLMConnector'
import { defaultDiceRoll } from '../src/engine/GameState'
const mockLLMConnector = new MockLLMConnector()

describe("GameStates work correctly", ()=>{
    it("Combat state works correctly", async ()=>{
        const combatState = new CombatState(mockCombatState, defaultDiceRoll)
        const frames = await combatState.initialFrames()
        expect(frames).not.toBeNull()
        const frames2 = await combatState.handleInput("Attack")
        expect(frames2).not.toBeNull()
    })
})
