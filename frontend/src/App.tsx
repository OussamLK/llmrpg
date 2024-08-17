import {useState, useEffect } from 'react'
import './App.css'
import Engine, {defaultDiceRoll } from './engine'
import type {Frame} from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { mockCombatState, mockStoryState } from './mocks/gameStates'

const engine = new Engine(mockStoryState, ()=>{}, defaultDiceRoll)
export function App(){
  const [frame, setFrame] = useState<Frame | undefined>()
  const setCurrentFrame = async ()=>{
    const currentFrame = await engine.getCurrentFrame();
    setFrame(currentFrame)
  }
  useEffect(()=>{setCurrentFrame()}, [])

  return frame ? <div className="app">
      <h1>Alive health {frame.playerStatus.health}</h1>
      <div className="canvas">
      <Scene scene={frame.scene}/>
      <Inventory
        inventory={frame?.inventory}
        equipedWeapon={frame.playerStatus.equipedWeapon}
        onClick={({itemName, affordance})=>{console.debug(`${affordance} - ${itemName}`)}}/>
      </div>
      </div> : <p>loading...</p>
}


function GameOver(){
  return <p>You died!</p>
}

export default App
