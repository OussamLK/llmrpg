import {useState, createContext, useEffect } from 'react'
import './App.css'
import {Alive} from "./Alive"
import { GameState } from './types'

const initialGameState : GameState = {
  inventory: {
    weapons: [
      {
        type: 'weapon',
        name:  "pistol",
        damage: 30,
        details: {type: "distance", ammoName: "bullets"},
        ammo: 20
      }],
    keyItems: [{type: "key item", name: "door key", description: "door key to your house"}],
    medicine: [{type: "medicine", name:"Pills", healthGain: 20}],
  },
  playerStatus:{
    health: 100
  }

}
export const gameStateContext = createContext<GameState>(initialGameState)


function App() {

  const gameState = initialGameState;

  return (
    <gameStateContext.Provider value= {gameState}>
      <Alive />
   </gameStateContext.Provider>
  )
}


function Dead(){
  return <p>You died!</p>
}

export default App
