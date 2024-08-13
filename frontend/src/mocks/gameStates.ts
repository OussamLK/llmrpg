import { StoryRound, CombatRound, GameState } from "../types"

const storyRound:StoryRound = {
  type:"story round",
  gamePrompt: "A test prompt for the mockup",
  loot: null}

const combatRound: CombatRound = {
  type:"combat round",
  enemies: [
    {description:"clicker", health: 100, position:"far", attackType:"close"},
    {description:"runner", health: 75, position:"close", attackType:"close"},
    {description:"runner", health: 60, position:"far", attackType:"close"},
    
  ]
}

export const initialGameState : GameState = {
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