import { useCallback, useState } from 'react'
import './App.css'
import {match, P} from 'ts-pattern'

type Action = {prompt: string, success: number, failure: number}
const testActions = [
  {prompt: "You are in a forest you find a mushroom, eat it?", success: 10, failure: 25},
  {prompt: "You are in a supermarket, open a exit door", success: 0, failure: 50},

]

function App() {
  const [health, setHealth] = useState(100)
  const takeDamage = useCallback(function takeDamage(damage:number):void{
    if (damage > health) setHealth(0)
    else setHealth(prev=>prev-damage)
  }, [])
  return (
   <>
    <h1>The first of us</h1>
    <h2>Health: {health}</h2>
    <div style={{border: "solid", borderWidth:"0.1rem"}}>
      {health > 0 ? <Alive takeDamage={takeDamage} /> : <Dead />}
    </div>
   </>
  )
}

function Alive({takeDamage}:{takeDamage: (damage:number)=>void}){
  const [prompt, setPrompt] = useState<string>(`You are in the middle of nowhere`)
  const [mode, setMode] = useState<Action[] | 'talk'>('talk')
  return (
    <>
      <ActionMode takeDamage={takeDamage} prompt={prompt} actions={testActions}/>
    </>
  )

}

function PromptMode({prompt}:{prompt:string}){
  return <p>Prompt Mode</p>
}

function ActionMode({prompt, actions, takeDamage}
  :{prompt:string, actions:Action[], takeDamage: (damage:number)=>void}){


  const processAction = useCallback(function processAction(action:Action){
    takeDamage(action.failure)
  }, [])
    return (<>
      <p>{prompt}</p>
      <div>
        {actions.map(action=>(
          <>
          <button onClick={()=>processAction(action)}>{action.prompt}</button>
          <br/>
          </>))
          }
      </div>
    </>)

}


function Dead(){
  return <p>You died!</p>
}

export default App
