import {stats, testActions, Action} from "./App"
import { useState, useCallback, useContext } from "react"
import {match, P} from "ts-pattern"
import { GameStats, GamePhase } from "./App"



/**
 * Rendering when player is alive 
 */
export function Alive({actionCallback, gamePhase}:
    {actionCallback: (actionDescription:string, healthDifference:number)=>void,
     gamePhase:GamePhase}){
  return match(gamePhase)
    .with({mode:'action', prompt: P.select('prompt'), actions: P.select('actions')},
        ({prompt, actions})=>
        <ActionMode
                actions={actions}
                prompt={prompt}
                actionCallback={actionCallback}
        />
    ).with({mode: 'talk', prompt:P.select()},
        prompt=>
        <PromptMode
            prompt={prompt}
            actionCallback={actionCallback}
        />
    ).exhaustive()
  

}

function PromptMode({prompt, actionCallback}:{prompt:string, actionCallback: (actionDescription: string, healthDifference:number)=>void}){
  const [input, setInput] = useState("")
  return <div style={{padding: "1rem"}}>
      <p>{prompt}</p>
      <textarea onChange={e=>setInput(e.currentTarget.value)} value={input} cols={60} rows={5} />
      <br/>
      <button onClick={
            ()=>{actionCallback(input, 0)
            setInput("");    
            }}>
                Submit
      </button>
      </div>
}

function ActionMode({prompt, actions, actionCallback}
  :{prompt:string,
    actions:Action[],
    actionCallback: (actionDescription:string, healthDifference:number)=>void
}){


  const gameStats = useContext(stats)
  const processAction = useCallback(function processAction(action:Action){
    if (Math.random() * 100 > action.difficulty)
          actionCallback(`The user chose '${action.prompt}', and succeeded`, action.success)
    else actionCallback(`The user chose '${action.prompt}' and failed`, action.failure)
  }, [gameStats])
    return (<>
      <p>{prompt}</p>
      <div>
        {actions.map((action, i)=>(
          <div key={i}>
          <button onClick={()=>processAction(action)}>{action.prompt} (difficulty: {action.difficulty}, success: {action.success}, failure: {-action.failure})</button>
          <br/>
          </div>))
          }
      </div>
    </>)

}