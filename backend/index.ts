import express from 'express';
import OpenAI from 'openai'
import fs from 'fs'

const pydantic_schemata = fs.readFileSync('../pydantic_models/models.pydantic', 'utf-8')
console.debug("got from pydantic", pydantic_schemata)

const OPEN_AI_MODEL= 'gpt-3.5-turbo-1106'  && 'gpt-4-1106-preview'

const openAI = new OpenAI()

const app = express();
app.use(express.json())


const STORIES = [
    `You play as Joel in the last of us, but just as he decides to go to Boston with Tommy and you get to meet Tess`,
    `You play as a Roman general just before the fall of the republic, the goal is to lean about the history of the roman empire`,
    `You play as a Irish revolutionary fighter in the war of independence again the britain`

]

const STORY = STORIES[0] 

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

for the story : ${STORY}.

These are instructions on story telling: ${STORY_WRITTING_DIRECTIONS}

`




app.post("/chatGPT", async (req, res)=>{
    const {messages: frontendMessages} = req.body
    const messages =[{role:'system', content: GAME_DESCRIPTION},...frontendMessages] 
    console.debug("sending messages: ", frontendMessages)
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
    const {round, loot} = JSON.parse(match[0])
    console.debug(`The llm answer is: `, round)
    if (loot) console.debug(`The loot is: `, loot)
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
        temperature: 1.5,
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