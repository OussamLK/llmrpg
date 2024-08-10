import {useState, createContext, useEffect } from 'react'
import './App.css'
import {Alive} from "./Alive"
import {rules, story} from './prompts/background'

export type Action = {prompt: string, success: number, failure: number, difficulty: number}
export type GameStats = {health: number}
export type GamePhase = {mode: 'talk', prompt: string} |
                        {mode: "action", prompt: string, actions: Action[]}
export type Interaction = {role: 'user' | 'assistant', content: string}

export const stats = createContext<{health:number}>({health:100})

export class GPTapi {
  _apiKey: string
  constructor(apiKey: string){
    this._apiKey = apiKey
  }
  async fetchGpt(ob:any){
    const resp =  await fetch("/api/chatGPT",
        {method:"POST",
          headers:{
            "Content-Type": "application/json"
          },
        body:JSON.stringify(ob)
      })
    return await resp.json()

  }
  async request(userStats: GameStats, history:Interaction[]):Promise<GamePhase>{
    const resp = await this.fetchGpt({history, userStats, rules, story})
    return resp
  }
  
}
const gptApi = new GPTapi("privte_key")

function App() {
  const [health, setHealth] = useState(100)
  const [actionHistory, setActionHistory] = useState<Interaction[]>([])
  const [gamePhase, setGamePhase] = useState<GamePhase | undefined>(undefined)
  useEffect(()=>{
    async function af(){
      console.debug(`Fetching from chatGPT`)
      const resp = await gptApi.request({health}, actionHistory) as unknown
      console.debug(`on startup gpt answerd`, resp)
      setGamePhase(resp as GamePhase)
     
    }
    af()
  }, [])
  /**
   * Called by game components whenever the user plays a round
   * @param actionDescription Describes what the user did during the round
   * @param healthDifference How the health should change
   */
  async function actionCallback(actionDescription:string, healthDifference:number){
    //update the stats
    const newHealth = Math.min(Math.max(health+healthDifference, 0), 100)
    let newHistory:Interaction[] = [...actionHistory, {role: 'user', content: actionDescription}]
    //call chatGPT with the action description taken, and the new stats, and whether the user is dead or alive
    setHealth(newHealth)
    const nextPhase = await gptApi.request({health: newHealth},newHistory)
    newHistory.push({role:"assistant", content: nextPhase.prompt})
    setActionHistory(newHistory)
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