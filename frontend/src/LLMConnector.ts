
import { StoryRound, Loot, Round } from "./engine/types"
export type StoryDevelopment = Round
import { mockCombatRound, mockStoryRound, mockInventory } from './mocks/gameStates'
import { Inventory, PlayerStatus } from "./types"

const gamePad: Loot = { type: "key item", name: "game pad", description: "A playstation game pad" }
const storyRound: StoryRound = mockStoryRound as StoryRound
const lootRound: Round = {
        ...storyRound,
        gamePrompt: "You found a game controller",
        loot: [gamePad]
}


type LLMResponse = {round: Round, rational: string, loot?: {detail:Loot}[]}
type GPTMessage = {role: 'assistant' | 'user' | 'system', content:string}

export default interface ILLMConnector {
    requestStoryDevelopment: () => Promise<StoryDevelopment>
    reportEvent: (eventDescription: string) => void
    //getEnemyAction:(gameState)=>{EnemyAction:EnemyAction, prompt:string}
    reportPlayerInput: (input:string) =>void
    initialState: ()=>{inventory:Inventory, playerStatus: PlayerStatus}
}

export class ApiConnector{
    private async post(payload:any){
        const resp =  await fetch('/api/chatGPT', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers:{
                "Content-Type": "application/json",
            }
        })
        return await resp.json()
    }
    async getNextRound(messages:GPTMessage[]):Promise<LLMResponse>{
        const data = await  this.post({messages})
        console.table(data)
        return data
    }

}

export class MockLLMConnector implements ILLMConnector {

    events: string[]
    rounds: Round[]
    apiConnector: ApiConnector
    constructor() {
        this.events = []
        this.rounds = [lootRound, mockCombatRound, mockStoryRound, lootRound, mockCombatRound].map(s=>structuredClone(s))
        this.apiConnector = new ApiConnector()
    }

    createContext = ():GPTMessage[]=>{
        const history = `this is the context ${JSON.stringify(this.events)}`
        return [{role:'user', content: "let's start the game"}, {role: 'user', content:history}]
    }

    async requestStoryDevelopment(): Promise<StoryDevelopment> {
        const state = Promise.resolve(this.rounds.splice(0,1)[0])
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

export class LLMConnector implements ILLMConnector {

    interactionHistory: GPTMessage[]
    rounds: Round[]
    apiConnector: ApiConnector
    constructor() {
        this.interactionHistory = []
        this.rounds = [lootRound, mockCombatRound, mockStoryRound, lootRound, mockCombatRound].map(s=>structuredClone(s))
        this.apiConnector = new ApiConnector()
    }

    createContext = ():GPTMessage[]=>{
        return this.interactionHistory
    }

    async requestStoryDevelopment(): Promise<StoryDevelopment> {
         
        const state = await this.apiConnector.getNextRound(this.createContext())
        console.debug(`LLM rational: `, state.rational)
        this.interactionHistory.push({role: 'assistant', content: JSON.stringify(state)})
        if (state.round.type === 'combat round')
            state.round.enemies = state.round.enemies.map((enemy, id)=>({...enemy, id:id+1}))
        //@ts-ignore
        if (state.loot){
            return {...state.round, loot:state.loot.map(item=>item.detail)}
        }
        return state.round
    }
    reportEvent(eventDescription: string) {
        this.interactionHistory.push({role: 'user', content: eventDescription})
        console.debug(`llmConnector: add event ${eventDescription}`)
    }
    reportPlayerInput = (input: string)=>{
        const playerInputEvent = `The player said: ${input}`
        this.interactionHistory.push({role:'user', content: playerInputEvent})
        console.debug(`llmConnector: add event ${playerInputEvent}`)
    };
    initialState = () => {
        return {inventory: {weapons: [], medicine: [], keyItems: []}, playerStatus: {health:100, equipedWeapon: null}}
    }

}