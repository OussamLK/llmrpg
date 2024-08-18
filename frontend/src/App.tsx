import {useState, useEffect } from 'react'
import './App.css'
import Engine, {defaultDiceRoll } from './engine'
import type {Frame, InventoryInput, CombatInput, StoryInput} from './types'
import { Inventory } from './Inventory'
import Scene from './Scenes/Scene'
import { mockCombatState, mockStoryState } from './mocks/gameStates'

const engine = new Engine(mockCombatState, ()=>{}, defaultDiceRoll)
export function App(){
  const [currentFrameId, setCurrentFrameID] = useState<number>(0)
  const [frame, setFrame] = useState<Frame | undefined>()
  const setCurrent = async ()=>{
    const currentFrame = await engine.getFrame(currentFrameId);
    setFrame(currentFrame)
  }
  useEffect(()=>{setCurrent()}, [currentFrameId])
  function nextFrame(){setCurrentFrameID(prev=>prev+1)}

  return frame ? <div className="app">
      <h1>Alive health {frame.playerStatus.health}</h1>
      <div className="canvas">
      <Scene
        scene={frame.scene}
        onFinish={nextFrame}
        onCombatInput={engine.combatInput}
        onStoryInput={engine.storyInput}
        />
      <Inventory
        inventory={frame?.inventory}
        equipedWeapon={frame.playerStatus.equipedWeapon}
        onClick={({itemName, affordance})=>{engine.inventoryInput({itemName, action:affordance})}}
      />
      </div>
      </div> : <p>loading...</p>
}


function GameOver(){
  return <p>You died!</p>
}

export default App
