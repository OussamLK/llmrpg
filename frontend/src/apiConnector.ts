import {Round} from "./types"
export class ApiConnector{
    async getNextRound():Promise<Round>{
        return {details: {type: "story round", gamePrompt: "A test round", loot: null}}
        //return {detail: {type: "combat round", gamePrompt: "A test round", loot: null}}

    }
}