import {useState, createContext, useEffect, useContext } from 'react'
import './App.css'
import { GameState, StoryRound, CombatRound } from './types'
import { Inventory } from './Inventory'
import Round from './Rounds/Round'

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


export const gameStateContext = createContext(initialGameState)


/**
 * Rendering when player is alive 
 */
export function App()
  {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  function handleEquipWeapon(newWeapon:string){
    setGameState({...gameState, playerStatus:{...gameState.playerStatus, equipedWeapon: newWeapon}})
  }
  
  return (gameState.playerStatus.health > 0 ?
  <div className="app"><h1>Player Alive</h1>
      <h2>Health {gameState.playerStatus.health}</h2>
      <div className="canvas">
        <gameStateContext.Provider value={gameState}>
          <Round round={gameState.round.currentRound} />
          <Inventory
              onEquipWeapon={handleEquipWeapon}
              equipedWeapon={gameState.playerStatus.equipedWeapon}
              inventory={gameState.inventory}
            />
        </gameStateContext.Provider>
      </div>
  </div>: 
  <Dead />
)

}

function Dead(){
  return <p>You died!</p>
}

export default App
