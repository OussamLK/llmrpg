import {useState, createContext, useMemo, useCallback } from 'react'
import './App.css'
import { EngineGameState } from './types'
import { Inventory } from './Inventory'
import Round from './Rounds/Round'
import { initialGameState as mockInitialGameState } from './mocks/gameStates'

export const gameStateContext = createContext(mockInitialGameState)

export function App()
  {
  const [gameState, setGameState] = useState<EngineGameState>(mockInitialGameState);
  const playerAlive = useMemo(()=>gameState.playerStatus.health > 0, [gameState])
  const handleEquipWeapon = useCallback(
    function handleEquipWeapon(newWeapon:string){
      setGameState({
        ...gameState,
        playerStatus:{
          ...gameState.playerStatus,
          equipedWeapon: newWeapon
    }})
  }, [])
  
  return (
    playerAlive?
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
      </div>
      : 
      <GameOver />
)

}

function GameOver(){
  return <p>You died!</p>
}

export default App
