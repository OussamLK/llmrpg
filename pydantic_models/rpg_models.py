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
	details: Melee | Distance

class Melee(BaseModel):
	type: Literal['melee']
	durability: int

class Distance(BaseModel):
	type: Literal['distance']
	ammoName: str

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
	quantity: int

class CombatRound(BaseModel):
	type: Literal['combat round'] 
	enemies: list[Enemy]

class Enemy(BaseModel):
	description: str = Field(max_length=30)
	health: int
	position: Literal['close', 'distant']
	equipment: Literal['melee', 'distant']

class StoryRound(BaseModel):
	type: Literal['story round']
	gamePrompt: str
	loot: Optional[Loot]
	
class Round(BaseModel):
	detail: Union[CombatRound, StoryRound]

from pprint import pprint
with open("models.pydantic", "w") as f:
	pprint(Round.model_json_schema(), f)
	