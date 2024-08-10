import { useCallback, useState, useContext, createContext } from 'react'
import './App.css'
import {match, P} from 'ts-pattern'

type Action = {prompt: string, success: number, failure: number}
const testActions = [
  {prompt: "You are in a forest you find a mushroom, eat it?", success: 10, failure: 25},
  {prompt: "You are in a supermarket, open the exit door?", success: 0, failure: 50},

]
const stats = createContext<{health:number}>({health:100})

function App() {
  const [health, setHealth] = useState(100)
  const takeDamage = useCallback(function takeDamage(damage:number, health:number):void{
    if (damage > health) setHealth(0)
    else setHealth(prev=>prev-damage)
  }, [])
  return (
    <stats.Provider value= {{health}}>
      <h1>The first of us</h1>
      <h2>Health: {health}</h2>
      <div style={{border: "solid", borderWidth:"0.1rem"}}>
        {health > 0 ? <Alive takeDamage={takeDamage} /> : <Dead />}
      </div>
   </stats.Provider>
  )
}

function Alive({takeDamage}:{takeDamage: (damage:number, health:number)=>void}){
  const [prompt, setPrompt] = useState<string>(`You are in the middle of nowhere`)
  const [mode, setMode] = useState<Action[] | 'talk'>(testActions)
  return match(mode).with(
   P.array({prompt:P.string, success: P.number, failure: P.number}),
      (actions:Action[]) =>
          <ActionMode
              takeDamage={takeDamage}
              prompt={prompt}
              actions={actions}
          /> 
  ).with('talk', ()=><PromptMode prompt={prompt}/>)
  .exhaustive()
  

}

function PromptMode({prompt}:{prompt:string}){
  const [input, setInput] = useState("")
  return <div style={{padding: "1rem"}}>
      <p>{prompt}</p>
      <textarea onChange={e=>setInput(e.currentTarget.value)} value={input} cols={60} rows={5} />
      <br/>
      <button onClick={()=>console.log(input)}>Submit</button>
      </div>
}

function ActionMode({prompt, actions, takeDamage}
  :{prompt:string, actions:Action[], takeDamage: (damage:number, health:number)=>void}){


  const {health} = useContext(stats)
  const processAction = useCallback(function processAction(action:Action){
    takeDamage(action.failure, health)
  }, [health])
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
