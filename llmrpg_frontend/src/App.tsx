import {useState, createContext } from 'react'
import './App.css'
import {Alive} from "./Alive"

export type Action = {prompt: string, success: number, failure: number}
export type GameStats = {health: number}
export type GamePhase = {mode: 'talk', prompt: string} |
                        {mode: "action", prompt: string, actions: Action[]}

export const stats = createContext<{health:number}>({health:100})

export class GPTapi {
  _apiKey: string
  constructor(apiKey: string){
    this._apiKey = apiKey
  }
  async request(userInput: string, userStats: GameStats):Promise<GamePhase>{
    console.debug(`calling chat gpt with ${userInput} and game stats ${JSON.stringify(userStats)}`)
    return Math.random() > 0.75 ?
        {mode: 'talk', prompt: "A clerk talks to you"} :
        {mode: "action", prompt: "You are in a super market", actions: testActions}
  }
  
}
const gptApi = new GPTapi("privte_key")

function App() {
  const [health, setHealth] = useState(100)
  const [gamePhase, setGamePhase] = useState<GamePhase | undefined>({mode: 'talk', prompt: "You are in a supermarket"})

  /**
   * Called by game components whenever the user plays a round
   * @param actionDescription Describes what the user did during the round
   * @param healthDifference How the health should change
   */
  async function actionCallback(actionDescription:string, healthDifference:number){
    //update the stats
    const newHealth = Math.min(Math.max(health+healthDifference, 0), 100)
    //call chatGPT with the action description taken, and the new stats, and whether the user is dead or alive
    setHealth(newHealth)
    const nextPhase = await gptApi.request(actionDescription, {health: newHealth})
    setGamePhase(nextPhase)
  }



  return (
    <stats.Provider value= {{health}}>
      <h1>The first of us</h1>
      <h2>Health: {health}</h2>
      {gamePhase && (
        <div style={{border: "solid", borderWidth:"0.1rem"}}>
          {health > 0 ? <Alive gamePhase={gamePhase} actionCallback={actionCallback} /> : <Dead />}
        </div>
      )}
   </stats.Provider>
  )
}


function Dead(){
  return <p>You died!</p>
}

export default App

export const testActions = [
  {prompt: "eat the soop can?", success: 10, failure: -5},
  {prompt: "open the exit door?", success: 0, failure: -10},
]