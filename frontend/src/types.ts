export type Round = {
    details: CombatRound | StoryRound
}

export type CombatRound = {
    type: 'combat round',
    enemies: Enemy[]
    loot?: Loot[]
}

export type StoryRound = {
    type : 'story round',
    gamePrompt: string,
    loot?: Loot
}

export type Enemy = {
    id: number
    description: string,
    health: number,
    position: 'close' | 'far'
    attackType: 'close' | 'far' 
}

export type Loot = {
    details: Weapon | Medicine | KeyItem | Ammo
}

export type Weapon = {
    type: "weapon",
    name: string,
    damage: number,
    details: Melee | DistanceWeapon
}
export type Melee = {
    type: 'melee',
    durability: number,
    difficulty: number
}
export type DistanceWeapon = {
    type: 'distance',
    ammoName: string,
    difficulty: number
}

export type Medicine = {
    type: "medicine",
    name: string,
    healthGain: number
}

export type Ammo = {
    type: "ammo",
    quantity: number
}

export type KeyItem = {
    type: "key item",
    name: string,
    description: string
}

export type Inventory = {
    weapons: (Weapon & {ammo: number | null})[]
    keyItems: KeyItem[]
    medicine: Medicine[]
}

export type PlayerStatus = {
    health: number,
    equipedWeapon: string
}

/**
 * @deprecated
 */
export type FrameLegacy = {
    inventory: UIInventory
    playerStatus: PlayerStatus,
    round: {count: number, currentRound: UIRound}
}
export type Frame = {
    inventory: UIInventory
    playerStatus: PlayerStatus,
    scene: Scene
}

export type Scene = StoryScene | CombatScene | EventScene

export type StoryScene = {
    type: 'story scene'
    prompt: string
}
export type CombatScene = {
    type: "combat scene",
    enemies: Enemy[],
    affordances: Affordance[]}

export type EventScene = RandomEventScene | DeterministicEventScene

export type RandomEventScene = {
    type: "random event"
    prompt: string,
    probability: number,
    diceOutcome: number,
    outcomeMessage: string
}

export type DeterministicEventScene = {
    type: "event"
    prompt: string
}

/**
 * @deprecated
 */

export type UIRound = Round & {affordances: Affordance[]}

/**
 * @depricated
 */

export type UIInventory = Inventory & {affordances: InventoryAffordance[]}



export type Affordance = {
    type: "enemy",
    enemyId: number,
    prompt: string,
    description: string
} | {
    type: 'independent',
    prompt: string,
    description: string
} 


export type InventoryAffordance = {itemName: string, prompts: string[] }  

export type InventoryAction = {itemName: string, action: string}

export type ReactStateSetter<T> = React.Dispatch<React.SetStateAction<T>>

/**
 * The type for the LLM response
 */
export type Development = CombatRound | StoryRound