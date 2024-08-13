import {stats} from "./App"
import { useState, useCallback, useContext } from "react"
import {match, P} from "ts-pattern"
import type { Inventory } from "./types"
import { gameStateContext } from "./App"



/**
 * Rendering when player is alive 
 */
export function Alive(){
  const gameState = useContext(gameStateContext);
  return <div><h1>Player Alive</h1>
    <Inventory inventory={gameState.inventory} />
  </div>  

}

export function Inventory({inventory}:{inventory:Inventory}){
  return <div className="inventory">
    <h2>Inventory</h2>
    <h3>weapons</h3>
    <ul>{inventory.weapons
            .map((weapon, i)=>(
              <li key={i}>{weapon.name}</li>)
          )}
    </ul>
    <h3>Medicine</h3>
    <ul>{inventory.medicine
            .map((medicine, i)=>(
              <li key={i}>{medicine.name}</li>)
          )}
    </ul>
    <h3>key items</h3>
    <ul>{inventory.keyItems
            .map((item, i)=>(
              <li key={i}>{item.name}</li>)
          )}
    </ul>
  </div>
}