import { useState, useCallback, useContext } from "react"
import {match, P} from "ts-pattern"
import { gameStateContext } from "../App"
import { Inventory } from "./Inventory";
import Round from "../Rounds/Round";
import { GameState } from "../types";



/**
 * Rendering when player is alive 
 */
export function Alive({onGameStateChange}:
    {onGameStateChange:(newState:GameState)=>void}){
  const gameState = useContext(gameStateContext);
  function handleEquipWeapon(newWeapon:string){
    onGameStateChange({...gameState, playerStatus:{...gameState.playerStatus, equipedWeapon: newWeapon}})
  }
  return <div className="app"><h1>Player Alive</h1>
      <h2>Health {gameState.playerStatus.health}</h2>
    <div className="canvas">
      <Round round={gameState.round.currentRound} />
      <Inventory
          onEquipWeapon={handleEquipWeapon}
          equipedWeapon={gameState.playerStatus.equipedWeapon}
          inventory={gameState.inventory}
        />
    </div>
  </div>

}

