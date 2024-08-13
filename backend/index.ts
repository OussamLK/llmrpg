import express from 'express';
import OpenAI from 'openai'
import {createClient} from 'redis'

const openAI = new OpenAI()

const app = express();
app.use(express.json())
const redisClient = createClient();


app.post("/chatGPT", async (req, res)=>{
    const {rules, story, userStats, history} = req.body
    const cacheKey = JSON.stringify(req.body.history.length)
    const cached = await redisClient.get(cacheKey);
    if (cached){
        console.log("returning chached value")
        return res.send(cached)
    }
    const completion = await openAI.chat.completions.create({
        messages: [{role: "system", content: `${rules}, ${story}`},
            {role: "system", content: "Let's start the game, mix talk and action rounds"},
            ...history,
            {role: "system", content: `Game stats are ${JSON.stringify(userStats)}`}
            
        ],
        model: "gpt-4-1106-preview"
    })
    const respText = completion.choices[0].message.content
    if (!respText)
        throw("error fetching fron chatGPT")
    //@ts-ignore
    const match = /{(.*)}/.exec(respText.replaceAll("\n", ""))
    if (!match){
        throw(`The match is null here:\n ${respText}`)
    }
    await redisClient.set(cacheKey, match[0])
    res.send(match[0])
})

app.get("/", (req, res)=>{
    res.send("Welcome to <strong>llmrpg</strong>")
})

// app.get("/testAPI", async (req, res)=>{
//     const completion = await openAI.chat.completions.create({
//         messages: [{role: "system", content: `${rules}, ${story}`},
//             {role: "assistant", content: "Let's start the game"}
//         ],
//         model: "gpt-4-1106-preview"
//     })
//     //@ts-ignore
//     res.send(completion.choices[0].message.content)
// })

const server = app.listen(3000, async ()=>{
    console.log("listening 3000")
    redisClient.connect()
})
process.on('SIGINT',async ()=> {
    console.log("Received inturption signal")
    await redisClient.disconnect()
    server.close()
})