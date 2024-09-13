import { Inventory } from "./Inventory"

export type Enemy = {
    id: number
    description: string,
    health: number,
    position: 'close' | 'far'
    attackDamage: number,
    accuracy: number
    attackType: 'close' | 'far'
}

/**
 * Melee weapons do not require ammo, while distanceWeapons do.
 */
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
    name: string,
    weaponName: string,
    quantity: number
}

export type KeyItem = {
    type: "key item",
    name: string,
    description: string
}

export type Inventory = {
    weapons: (Weapon & { ammo: number | null })[]
    keyItems: KeyItem[]
    medicine: Medicine[]
}

export type PlayerStatus = {
    health: number,
    equipedWeapon: string | null
}


export type FrameInventory = Inventory & { affordances?: InventoryAffordance[] | null }

export type Frame = InformationFrame | InputFrame

/**
 * A valid Frame sequence
 */
export type FrameSequence = { informationFrames: InformationFrame[], inputFrame: InputFrame | null }

/**
 * No input is accepted on an information frame
 */
export type InformationFrame = {
    inventory: FrameInventory
    playerStatus: PlayerStatus,
    scene: EventScene
}

export type InputFrame = {
    inventory: FrameInventory
    playerStatus: PlayerStatus,
    scene: StoryScene | CombatScene
}

export type Scene = StoryScene | CombatScene | EventScene 

export type StoryScene = {
    type: 'story scene'
    prompt: string
}

export type StoryInput = string

export type CombatScene = {
    type: "combat scene",
    enemies: Enemy[],
    affordances: Affordance[]
}

export type CombatInput = { type: 'combat', enemyId?: number, action: string }

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


export type PlayerInput = CombatInput | StoryInput | InventoryInput

export type InventoryAffordance = { itemName: string, prompts: string[] }

export type InventoryInput = { type: 'inventory', itemName: string, action: string }

export type ReactStateSetter<T> = React.Dispatch<React.SetStateAction<T>>
