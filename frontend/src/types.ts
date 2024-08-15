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
    details: Melee | Distance
}
export type Melee = {
    type: 'melee',
    durability: number,
    difficulty: number
}
export type Distance = {
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

export type GameState = {
    inventory: Inventory
    playerStatus: PlayerStatus,
    round: {count: number, currentRound:Round}
}

export type GameEvent = {type: 'action', details: PlayerAction} |
                        {type: 'environment', details: EnvironmentEvent}

export type PlayerAction = (
    {type: 'attack', enemyId: number} |
    {type: 'move to enemy', enemyId: number} |
    'retreat' |
    'escape' |
    {type: 'equip', itemName: string}
)
export type EnvironmentEvent = (
    {type:'damage', healthLoss:number} |
    {type: 'loot', receivedItem: Loot}
)

export type ReactStateSetter<T> = React.Dispatch<React.SetStateAction<T>>