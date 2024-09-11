import express from 'express';
import OpenAI from 'openai'
import fs from 'fs'

const pydantic_schemata = fs.readFileSync('../pydantic_models/models.pydantic', 'utf-8')
console.debug("got from pydantic", pydantic_schemata)

const OPEN_AI_MODEL= 'gpt-3.5-turbo-1106' //  && 'gpt-4-1106-preview'

const openAI = new OpenAI()

const app = express();
app.use(express.json())


const STORY = `This is meant to teach the story of simon bolivar, the game happens in latin america by the time he is young. You play as a close friend of his that helps in his development`

const GAME_DESCRIPTION = `We are playing an RPG with the player, you will be the game master.
You will generate the story development by creating rounds, either a story round or a combat round.
in story rounds, you present the player with a situation and ask them what they want to do.
Try to balance story to combat, maybe 4 stories rounds to one combat round, you answer in JSON format that follows this
pydantic schema ${pydantic_schemata}, for the story : ${STORY}. Use a terse style think Harper Lee or georige Orwell, make the prompts short, make it not so dramatic`




app.post("/chatGPT", async (req, res)=>{
    const {messages: frontendMessages} = req.body
    const messages =[{role:'system', content: GAME_DESCRIPTION},...frontendMessages] 
    console.debug("sending messages: ",messages)
    const completion = await openAI.chat.completions.create({
        messages,
        model: OPEN_AI_MODEL
    })
    const respText = completion.choices[0].message.content
    if (!respText)
        throw("error fetching fron chatGPT")
    //@ts-ignore
    const match = /{(.*)}/.exec(respText.replaceAll("\n", ""))
    if (!match){
        throw(`The match is null here:\n ${respText}`)
    }
    res.send(match[0])
})

app.get("/", (req, res)=>{
    res.send("Welcome to <strong>llmrpg</strong>")
})

app.get("/testAPI", async (req, res)=>{
    const completion = await openAI.chat.completions.create({
        messages: [{role: "system", content: `This is the pydantic schema you should use for json answers ${pydantic_schemata}`},
            {role: "assistant", content: "Let's start the game in the unverse of 19th century revolutionary latin america, the goal is to teach about simon bolivar history"},
            {role: "user", content: "let's generate a story round with some loot"}
        ],
        model: OPEN_AI_MODEL,
        response_format: {'type':'json_object'}
    })
    //@ts-ignore
    res.send(completion.choices[0].message.content)
})

const server = app.listen(3000, async ()=>{
    console.log("listening 3000")
})

process.on('SIGINT',async ()=> {
    console.log("Received interruption signal")
    server.close()
})