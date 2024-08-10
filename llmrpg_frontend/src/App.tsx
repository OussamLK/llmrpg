import { useCallback, useState, useContext, createContext } from 'react'
import './App.css'
import {match, P} from 'ts-pattern'
import {Alive} from "./Alive"

export type Action = {prompt: string, success: number, failure: number}
export type GameStats = {health: number}
export const testActions = [
  {prompt: "You are in a forest you find a mushroom, eat it?", success: 10, failure: -25},
  {prompt: "You are in a supermarket, open the exit door?", success: 0, failure: -50},
]

export type GamePhase = {mode: 'talk', prompt: string} |
                        {mode: "action", prompt: string, actions: Action[]}

export const stats = createContext<{health:number}>({health:100})

function App() {
  const [health, setHealth] = useState(100)
  /**
   * Deals with updating the player's health
   */
  const updateHealth = useCallback(function updateHealth(healthDifference:number, health:number):void{
    const new_health = health + healthDifference
    if (new_health <  0) setHealth(0)
    else if (new_health > 100) setHealth(100)
    else setHealth(new_health)
  }, [])


  return (
    <stats.Provider value= {{health}}>
      <h1>The first of us</h1>
      <h2>Health: {health}</h2>
      <div style={{border: "solid", borderWidth:"0.1rem"}}>
        {health > 0 ? <Alive updateHealth={updateHealth} /> : <Dead />}
      </div>
   </stats.Provider>
  )
}


function Dead(){
  return <p>You died!</p>
}

export default App
