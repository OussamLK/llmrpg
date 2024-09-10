
import { StoryRound, Loot, Round } from "./engine/types"
export type StoryDevelopment = Round
import { mockCombatRound, mockStoryRound, mockInventory } from './mocks/gameStates'
import { Inventory, PlayerStatus } from "./types"

const gamePad: Loot = { type: "key item", name: "game pad", description: "A playstation game pad" }
const storyRound: StoryRound = mockStoryRound as StoryRound
const lootRound: Round = {
        ...storyRound,
        gamePrompt: "You found a game controller",
        loot: gamePad
}

export default interface LLMConnector {
    requestStoryDevelopment: () => Promise<StoryDevelopment>
    reportEvent: (eventDescription: string) => void
    //getEnemyAction:(gameState)=>{EnemyAction:EnemyAction, prompt:string}
    reportPlayerInput: (input:string) =>void
    initialState: ()=>{inventory:Inventory, playerStatus: PlayerStatus}
}

export class MockLLMConnector implements LLMConnector {

    events: string[]
    rounds: Round[]
    constructor() {
        this.events = []
        this.rounds = [lootRound, mockCombatRound, mockStoryRound, lootRound, mockCombatRound].map(s=>structuredClone(s))
    }
    async requestStoryDevelopment(): Promise<StoryDevelopment> {
        const state = Promise.resolve(this.rounds.pop())
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
    initialState = () => {
        return {inventory: mockInventory, playerStatus: {health:100, equipedWeapon: 'pistol'}}
    }

}