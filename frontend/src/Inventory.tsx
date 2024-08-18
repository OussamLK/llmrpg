import type { InventoryAffordance, UIInventory, Weapon, Medicine, KeyItem } from "./types";


export function Inventory({ inventory, equipedWeapon, onClick }:
    { inventory: UIInventory,
      equipedWeapon: string,
      onClick: (args:{itemName:string, affordance:string})=>void }) {
        const active = inventory.affordances !== null
        return <div className={active ? "inventory":"inventory-inactive"}>
          <h2>Inventory</h2>
          <h3>Weapons</h3>
          <ul >{inventory.weapons
            .map(weapon => <WeaponItem
                              key={weapon.name}
                              weapon={weapon}
                              equipedWeapon={equipedWeapon}
                              onClick={onClick}
                              affordances={inventory.affordances}
                              />
            )}
          </ul>
          <h3>Medicine</h3>
          <ul>{inventory.medicine
            .map(medicine => (
              <InventoryItem onClick={onClick} key={medicine.name} item={medicine} affordances={inventory.affordances}/>)
            )}
          </ul>
          <h3>Key Items</h3>
          <ul>{inventory.keyItems
            .map(item=> (
              <InventoryItem onClick={onClick} key={item.name} item={item} affordances={inventory.affordances}/>)
            )}
          </ul>
        </div>;
}
function WeaponItem({weapon, affordances, equipedWeapon, onClick}:
          {weapon:Weapon & {ammo: number | null},
          equipedWeapon: string,
           affordances:InventoryAffordance[] | null,
           onClick: (args:{itemName:string, affordance:string})=>void
          }){
  if (affordances){
    const itemAffordance = affordances.find(affordance=>affordance.itemName === weapon.name)
    const mainAffordance = itemAffordance && itemAffordance.prompts.length > 0 && itemAffordance.prompts[0]
    const mainButton = mainAffordance && <button onClick={()=>onClick({itemName:weapon.name, affordance: mainAffordance })}>{mainAffordance}</button>
    const annotations = weapon.details.type === "distance" && <span><strong>{weapon.ammo}</strong> {weapon.details.ammoName}</span>
    const equiped = weapon.name === equipedWeapon
    return (<li key={weapon.name}>{weapon.name} {annotations} {equiped ? "(equiped)" : mainButton} </li>)
  }
  else {
    const annotations = weapon.details.type === "distance" && <span><strong>{weapon.ammo}</strong> {weapon.details.ammoName}</span>
    const equiped = weapon.name === equipedWeapon
    return (<li key={weapon.name}>{weapon.name} {annotations} {equiped ? "(equiped)" : ""} </li>)

  }
}

function InventoryItem({item, affordances, onClick}:
          {item:Medicine|KeyItem,
           affordances:InventoryAffordance[] | null,
           onClick: (args:{itemName:string, affordance:string})=>void
          }){
  if (affordances){
    const itemAffordance = affordances.find(affordance=>affordance.itemName === item.name)
    const mainAffordance = itemAffordance && itemAffordance.prompts.length > 0 && itemAffordance.prompts[0]
    const mainButton = mainAffordance && <button onClick={()=>onClick({itemName:item.name, affordance: mainAffordance })}>{mainAffordance}</button>
    return <li>{item.name}&nbsp;{mainButton}</li>
  }
  else return <li>{item.name}</li>
}