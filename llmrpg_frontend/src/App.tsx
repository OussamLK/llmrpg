import {useState, createContext, useEffect } from 'react'
import './App.css'
import {Alive} from "./GamePlay/Alive"
import { GameState, StoryRound, CombatRound } from './types'

const storyRound:StoryRound = {
  type:"story round",
  gamePrompt: "A test prompt for the mockup",
  loot: null}

const combatRound: CombatRound = {
  type:"combat round",
  enemies: [{description:"goblin", health: 20, position:"far", attackType:"close"}]
}

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
  },
  round: {
    count: 2,
    currentRound: {
      details: (
        (Math.random()> .5)?
          combatRound
          : storyRound
        )
    }
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
