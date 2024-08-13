import { useState, useCallback, useContext } from "react"
import {match, P} from "ts-pattern"
import { gameStateContext } from "../App"
import { Inventory } from "./Inventory";
import Round from "../Rounds/Round";



/**
 * Rendering when player is alive 
 */
export function Alive(){
  const gameState = useContext(gameStateContext);
  return <div><h1>Player Alive</h1>
    <div className="app">
      <Round round={gameState.round.currentRound} />
      <Inventory inventory={gameState.inventory} />
    </div>
  </div>

}

