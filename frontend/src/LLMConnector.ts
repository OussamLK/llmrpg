
import { GameStateData, StoryRound, Loot } from "./engine/types"
export type StoryDevelopment = GameStateData
import { mockCombatState, mockStoryState } from './mocks/gameStates'

const gamePad: Loot = { type: "key item", name: "game pad", description: "A playstation game pad" }
const storyRound: StoryRound = mockStoryState.round as StoryRound
const lootState: GameStateData = {
    ...mockStoryState,
    round: {
        ...storyRound,
        gamePrompt: "You found a game controller",
        loot: gamePad
    }
}

export default interface LLMConnector {
    requestStoryDevelopment: () => Promise<StoryDevelopment>
    reportEvent: (eventDescription: string) => void
    //getEnemyAction:(gameState)=>{EnemyAction:EnemyAction, prompt:string}
    reportPlayerInput: (input:string) =>void
}

export class MockLLMConnector implements LLMConnector {

    events: string[]
    gameStates: GameStateData[]
    constructor() {
        this.events = []
        this.gameStates = [lootState, mockCombatState, mockStoryState, lootState, mockCombatState].map(s=>structuredClone(s))
    }
    async requestStoryDevelopment(): Promise<StoryDevelopment> {
        const state = Promise.resolve(this.gameStates.pop())
        //@ts-ignore
        return state
    }
    reportEvent(eventDescription: string) {
        this.events.push(eventDescription)
        console.debug(`llmConnector: add event ${eventDescription}`)
    }
    reportPlayerInput = (input: string)=>{
        const playerInputEvent = `The player said: ${input}`
        this.events.push(playerInputEvent)
        console.debug(`llmConnector: add event ${playerInputEvent}`)
    };

}