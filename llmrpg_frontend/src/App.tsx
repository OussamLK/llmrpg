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
  enemies: [
    {description:"clicker", health: 20, position:"far", attackType:"close"},
    {description:"runner", health: 15, position:"close", attackType:"close"},
    {description:"runner", health: 12, position:"far", attackType:"close"},
    
  ]
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
      },
      {
        type: 'weapon',
        name:  "machete",
        damage: 50,
        details: {type: "melee", durability: 10},
        ammo: null
      },
    
    ],
    keyItems: [{type: "key item", name: "door key", description: "door key to your house"}],
    medicine: [{type: "medicine", name:"Pills", healthGain: 20}],
  },
  playerStatus:{
    health: 100,
    equipedWeapon: "pistol"
  },
  round: {
    count: 2,
    currentRound: {
      details: (
        (Math.random()> 0)?
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
