import express from 'express';
import OpenAI from 'openai'
import fs from 'fs'
import crypto from 'crypto'

const pydantic_schemata = fs.readFileSync('../pydantic_models/models.pydantic', 'utf-8')
console.debug("got from pydantic", pydantic_schemata)

const OPEN_AI_MODELS= {3.5: 'gpt-3.5-turbo-1106',  4:'gpt-4-1106-preview'}
const OPEN_AI_MODEL = OPEN_AI_MODELS[3.5] //change model here
type CHATGPTMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam


//const openAI = new OpenAI()
class Completion{
    openAI: OpenAI
    cache: {[hash: string] : Promise<string | null>}
    cacheDelayMiliseconds: number
    constructor(cacheDelayMiliseconds: number){
        this.openAI = new OpenAI()
        this.cache = {}
        this.cacheDelayMiliseconds = cacheDelayMiliseconds
    }

    private hash(messages:CHATGPTMessage[]):string{
        const time = new Date()
        const ts = time.getMinutes()*60000+time.getSeconds()*1000+time.getMilliseconds()
        const ts_slot = Math.round(ts/this.cacheDelayMiliseconds)
        const messages_json = JSON.stringify(messages)
        const h = crypto.createHash('sha256');
        h.update(`${ts_slot} , ${messages_json}`)
        return h.digest('hex')
    }

    private async complete(messages:CHATGPTMessage[]):Promise<string | null>{
        const resp = await this.openAI.chat.completions.create({
            messages,
            model: OPEN_AI_MODEL,
            response_format: {type: 'json_object'},
            temperature: 0.7
        })
        return resp.choices[0].message.content
    }

    /**
     * Cache LLM response in order to avoid incuring cost when react double renders (happens on initial render only though).
     */
    cached(messages:CHATGPTMessage[]):Promise<string | null>{
        const hash = this.hash(messages)
        if (this.cache[hash] !== undefined){
            console.debug("fetching from cache")
            return this.cache[this.hash(messages)]
        }
        else {
            const resp = this.complete(messages)
            this.cache[hash] = resp
            return resp
        }
    }
}
const completion = new Completion(500)

const app = express();
app.use(express.json())



const STORY_WRITTING_DIRECTIONS = `
    explain the story telling objectives for the round you are generating, how this will help engage the player before you generate the rest of the round.
    introduce the game from the beginning, do now assume the player know anything about the world or the characters. but do it using in game naration not direct description, show dont tell


    Your goal is to engage the player, these are some tactics:
    
    1) Build intrigue by creating mysteries and making the player strive to discover the answers.
    2) Start by a strong hook, you can start in the middle of a crisis and then leave many outcomes unanswered and go back in time.
        or quickly create a hook, always create a reason to come back for the player.
    3) Mysteries work best if the player anticipate something frighting, shocking or something that they fanticise, but always kept implicit  
    4) Put the player in desperate situations and then save them at the last minute.
    5) Use loot appropriately to achieve engagement.
    6) Make combat interesting by varying enemies types and giving good loot.
    7) Create exploration phases that builds engagement via lore and mystery building.
    8) Suprise the player by giving outcomes that are unexpercted, build the notion that this game wont be predictible.


    Style:
    1) Show don't tell: Use simple, concrete and unceremonious language.
    2) You have an opening of the story, introduce the characters and the universe slowly. You have around 30 rounds of gameplay
    3) Explain in the rational where you are in the story.
    4) The first 3 story rounds are critical.
         a) start the first by introducing the scene while keeping some mystery around who you are playing, make the player explore the environment to discover where they are
         b) give the player the opportunity to learn about who they are playing and what the environment is
         c) start to introduce a hook by building up a mystery
    5) Keep each story round short with at most 3 sentences
`

const GAME_DESCRIPTION = `We are playing an RPG with the player, you will be the game master.
You will generate the story development by exclusively creating rounds, either a story round or a combat round.
in story rounds, you present the player with a situation and ask them what they want to do.
Try to balance story to combat, maybe 4 stories rounds to one combat round, you answer in JSON format that follows this
pydantic schema ${pydantic_schemata}.

Objects that the player pick have to be represented in the 'loot' key as described by the Loot schema

These are instructions on story telling: ${STORY_WRITTING_DIRECTIONS}

There are key events in the story that you might want to include that are going to be given to you

`




app.post("/chatGPT", async (req, res)=>{
    const {messages: frontendMessages} = req.body
    const messages =[{role:'system', content: GAME_DESCRIPTION},...frontendMessages] 
    console.debug("sending messages: ", frontendMessages)
    const respText = await completion.cached(messages)
    if (!respText)
        throw("error fetching fron chatGPT")
    //@ts-ignore
    const match = /{(.*)}/.exec(respText.replaceAll("\n", ""))
    if (!match){
        throw(`The match is null here:\n ${respText}`)
    }
    const {round, loot} = JSON.parse(match[0])
    console.debug(`The llm answer is: `, round)
    if (loot) console.debug(`The loot is: `, loot)
    res.send(match[0])
})

app.get("/", (req, res)=>{
    res.send("Welcome to <strong>llmrpg</strong>")
})

app.get("/testAPI", async (req, res)=>{
    const resp = await completion.cached(
        [{role: "system", content: `This is the pydantic schema you should use for json answers ${pydantic_schemata}`},
            {role: "assistant", content: "Let's start the game in the unverse of 19th century revolutionary latin america, the goal is to teach about simon bolivar history"},
            {role: "user", content: "let's generate a story round with some loot"}]
    )
    //@ts-ignore
    res.send(resp)
})

const server = app.listen(3000, async ()=>{
    console.log("listening 3000")
})

process.on('SIGINT',async ()=> {
    console.log("Received interruption signal")
    server.close()
})