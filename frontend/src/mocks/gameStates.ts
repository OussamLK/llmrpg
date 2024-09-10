import {FrameInventory, Inventory } from "../types"
import { GameStateData, StoryRound, CombatRound, Round } from "../engine/types"

export const storyRound:StoryRound = {
  type:"story round",
  gamePrompt: "A test prompt for the mockup"}

export const combatRound: CombatRound = {
  type:"combat round",
  enemies: [
    {id: 1, description:"clicker", health: 10, position:"close", attackType:"close", accuracy: 70, attackDamage: 30},
    {id: 2, description:"runner", health: 7, position:"close", attackType:"close", accuracy: 70, attackDamage: 10},
    //{id: 3, description:"runner", health: 6, position:"far", attackType:"close", accuracy: 70, attackDamage: 10},
    
  ],
  turn: 'player',
  loot: [
    {type:'weapon', damage:30, name:'sting', details:{type:'melee', difficulty: 30, durability:20}},
    {type:'ammo', weaponName: 'pistol', quantity: 10, name: 'bullets'},
    {type: 'key item', name: 'personal journal', description: "the player's personal journal"}
  
  ]
}

export const mockInventory:Inventory ={ 
    weapons: [
      {
        type: 'weapon',
        name:  "pistol",
        damage: 30,
        details: {type: "distance", ammoName: "bullets", difficulty: 30},
        ammo: 20
      },
      {
        type: 'weapon',
        name:  "machete",
        damage: 50,
        details: {type: "melee", durability: 10, difficulty: 10},
        ammo: null
      },
    
    ],
    keyItems: [{type: "key item", name: "door key", description: "door key to your house"}],
    medicine: [{type: "medicine", name:"Pills", healthGain: 20}],
}
export const mockPlayerStatus = {
    health: 100,
    equipedWeapon: "pistol"
  }

export function getGameState(round:Round) : GameStateData {
  return{
  inventory: mockInventory,
  playerStatus: mockPlayerStatus,
  round: round,
  roundCount: 2
}

}

export const mockCombatState =  getGameState(combatRound)
export const mockStoryState = getGameState(storyRound)