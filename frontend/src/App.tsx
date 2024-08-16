import {useState, createContext, useMemo, useCallback, useEffect } from 'react'
import './App.css'
import Engine, {defaultDiceRoll } from './engine'
import type {Frame} from './types'
import { Inventory } from './Inventory'
import Round from './Rounds/Round'
import { initialGameState as mockInitialGameState } from './mocks/gameStates'

export const gameStateContext = createContext(mockInitialGameState)
const engine = new Engine(mockInitialGameState, ()=>{}, defaultDiceRoll)
export function App(){
  const [frame, setFrame] = useState<Frame | undefined>()
  const setCurrentFrame = async ()=>{
    const currentFrame = await engine.getCurrentFrame();
    setFrame(currentFrame)
  }
  useEffect(()=>{setCurrentFrame()}, [])

  return frame ? <div className="app">
      <h1>Alive health {frame.playerStatus.health}</h1>
      <Inventory
        inventory={frame?.inventory}
        equipedWeapon={frame.playerStatus.equipedWeapon}
        onClick={({itemName, affordance})=>{console.debug(`${affordance} - ${itemName}`)}}/>
      </div> : <p>loading...</p>
}


function GameOver(){
  return <p>You died!</p>
}

export default App
