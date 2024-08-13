import type { Inventory } from "../types";


export function Inventory({ inventory, equipedWeapon, onEquipWeapon }:
    { inventory: Inventory,
      equipedWeapon: string,
      onEquipWeapon: (weapon:string)=>void }) {
  return <div className="inventory">
    <h2>Inventory</h2>
    <h3>Weapons</h3>
    <ul>{inventory.weapons
      .map((weapon, i) => (
        <li key={i}>{weapon.name} &nbsp;
          {weapon.details.type === "distance" &&
            <span><strong>{weapon.ammo}</strong> {weapon.details.ammoName}</span>}&nbsp;
            {equipedWeapon !== weapon.name?<button onClick={()=>onEquipWeapon(weapon.name)}>Equip</button>: <span>(equiped)</span>}</li>)

      )}
    </ul>
    <h3>Medicine</h3>
    <ul>{inventory.medicine
      .map((medicine, i) => (
        <li key={i}>{medicine.name} <button>Use</button></li>)
      )}
    </ul>
    <h3>Key Items</h3>
    <ul>{inventory.keyItems
      .map((item, i) => (
        <li key={i}>{item.name}<button>Use</button></li>)
      )}
    </ul>
  </div>;
}
