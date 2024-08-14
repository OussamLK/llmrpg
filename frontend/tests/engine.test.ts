import Engine from '../src/engine'
import {getInitialGameState, initialGameState, combatRound, storyRound} from '../src/mocks/gameStates'
const combatState = getInitialGameState({details: combatRound})

const successEngine = new Engine(
    combatState,
    async ()=>{console.debug("requesting new round")},
    ()=>true
)
const failureEngine = new Engine(
    combatState,
    async ()=>{console.debug("requesting new round")},
    ()=>false
)


test("testing the game engine", async ()=>{
    
    const equipedWeapon = successEngine._getEquipedWeapon();
    expect(equipedWeapon.name).toBe(initialGameState.playerStatus.equipedWeapon)
    expect(equipedWeapon.ammo).toBe(20)
    expect(successEngine.weaponTypeMatchesEnemyPosition(1)).toBeTruthy()
    expect(successEngine.weaponTypeMatchesEnemyPosition(2)).toBeFalsy()
    const failureEngineState = await failureEngine._damageEnemy(1, 20)
    expect(failureEngineState.newGameState).toEqual(combatState)
    await successEngine._damageEnemy(1, 20)
    const enemy = successEngine.getEnemyById(1)
    if (!enemy) throw("you should find enemy 1")
    expect(enemy.health).toBe(80);
    await expect(successEngine._damageEnemy(2, 20)).rejects.toThrow()


})