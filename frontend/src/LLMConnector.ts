
export type StoryDevelopment = void

export default interface LLMConnector {
    requestStoryDevelopment: ()=>Promise<StoryDevelopment>
    reportEvent:(eventDescription:string)=>void
    //getEnemyAction:(gameState)=>{EnemyAction:EnemyAction, prompt:string}
}

export class MockLLMConnector implements LLMConnector{

    requestStoryDevelopment(): Promise<StoryDevelopment>{throw("not implemented")}
    reportEvent(eventDescription: string){throw("not implemented")}

}