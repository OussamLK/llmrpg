import express from 'express';
import OpenAI from 'openai'

const openAI = new OpenAI()

const app = express();
app.use(express.json())


app.post("/chatGPT", async (req, res)=>{
    const {rules, story, userInput, userStats, history} = req.body
    const completion = await openAI.chat.completions.create({
        messages: [{role: "system", content: `${rules}, ${story}`},
            {role: "assistant", content: "Let's start the game"}
        ],
        model: "gpt-4-1106-preview"
    })
    const respText = completion.choices[0].message.content
    if (!respText)
        throw("error fetching fron chatGPT")
    //@ts-ignore
    const match = /{(.*)}/.exec(respText.replaceAll("\n", ""))
    if (!match){
        throw("The match is null")
    }
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

app.listen(3000, ()=>console.log("listening 3000"))