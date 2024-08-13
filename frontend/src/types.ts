export type Round = {
    details: CombatRound | StoryRound
}

export type CombatRound = {
    type: 'combat round',
    enemies: Enemy[]
}

export type StoryRound = {
    type : 'story round',
    gamePrompt: string,
    loot: Loot | null
}

export type Enemy = {
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
    details: Melee | Distance
}
export type Melee = {
    type: 'melee',
    durability: number
}
export type Distance = {
    type: 'distance',
    ammoName: string
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

export type GameState = {
    inventory: Inventory
    playerStatus: PlayerStatus,
    round: {count: number, currentRound:Round}
}