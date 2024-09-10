from __future__ import annotations
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Literal, Union

class Loot(BaseModel):
	detail: Union[Weapon, Medicine, KeyItem, Ammo]

class Weapon(BaseModel):
	type: Literal['weapon']
	name: str
	damage: int
	details: Melee | DistanceWeapon

class Melee(BaseModel):
	type: Literal['melee']
	durability: int
	difficulty: int = Field(le=100)

class DistanceWeapon(BaseModel):
	type: Literal['distance']
	ammoName: str
	difficulty: int = Field(le=100)

class Medicine(BaseModel):
	type: Literal['medicine']
	name: str
	healthGain: int = Field(le=100)

class KeyItem(BaseModel):
	type: Literal['key item']
	name: str
	description: str

class Ammo(BaseModel):
	type: Literal['ammo']
	name: str
	weaponName: str
	quantity: int

class CombatRound(BaseModel):
	type: Literal['combat round'] 
	enemies: list[Enemy]
	loot: Optional[list[Loot]]
	turn: Literal['player']

class Enemy(BaseModel):
	description: str = Field(max_length=30)
	health: int
	position: Literal['close', 'far']
	attackDamage: int
	accuracy: int = Field(le=100)
	attackType: Literal['close', 'far']

class StoryRound(BaseModel):
	type: Literal['story round']
	gamePrompt: str
	loot: Optional[Loot]
	
class Round(BaseModel):
	detail: Union[CombatRound, StoryRound]

from pprint import pprint
with open("models.pydantic", "w") as f:
	pprint(Round.model_json_schema(), f)
	