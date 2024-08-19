
import {GameState, StoryRound, Loot} from './engine'
export type StoryDevelopment = GameState
import { mockCombatState, mockStoryState} from './mocks/gameStates'

const gamePad:Loot = {type:"key item", name:"game pad", description:"A playstation game pad"}
const storyRound:StoryRound = mockStoryState.round as StoryRound
const lootState:GameState = {
    ...mockStoryState,
    round:{
        ...storyRound,
        gamePrompt:"You found a game controller",
        loot: gamePad
    }
}

export default interface LLMConnector {
    requestStoryDevelopment: ()=>Promise<StoryDevelopment>
    reportEvent:(eventDescription:string)=>void
    //getEnemyAction:(gameState)=>{EnemyAction:EnemyAction, prompt:string}
}

export class MockLLMConnector implements LLMConnector{

    events: string[]
    gameStates: GameState[]
    constructor(){
        this.events = []
        this.gameStates = [mockCombatState, mockStoryState, lootState]
    }
    async requestStoryDevelopment(): Promise<StoryDevelopment>{
        const state = (async ()=>this.gameStates.pop())()
        //@ts-ignore
        return state
    }
    reportEvent(eventDescription: string){this.events.push(eventDescription)}

}