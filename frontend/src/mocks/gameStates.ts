import { Round, StoryRound, CombatRound, FrameInventory, Inventory } from "../types"
import { EngineGameState } from "../engine"

export const storyRound:StoryRound = {
  type:"story round",
  gamePrompt: "A test prompt for the mockup"}

export const combatRound: CombatRound = {
  type:"combat round",
  enemies: [
    {id: 1, description:"clicker", health: 100, position:"far", attackType:"close"},
    {id: 2, description:"runner", health: 75, position:"close", attackType:"close"},
    {id: 3, description:"runner", health: 60, position:"far", attackType:"close"},
    
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

export function getGameState(round:Round) : EngineGameState {
  return{
  inventory: mockInventory,
  playerStatus: mockPlayerStatus,
  round: {
    count: 2,
    currentRound: round
    
  }
}

}

export const mockCombatState =  getGameState({details: combatRound})
export const mockStoryState = getGameState({details: storyRound})