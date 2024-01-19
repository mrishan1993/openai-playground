import {readFileSync, writeFileSync} from "fs"
import {join, dirname} from "path"
import { fileURLToPath } from 'url';
import {parse} from "csv-parse/sync"

const openAIToken = process.env.OPENAI_SECRET_KEY
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(openAIToken)

async function createEmbeddings(input, model = "text-embedding-ada-002") {
    try {
        await fetch("https://api.openai.com/v1/embeddings", {
            "method": "POST",
            "headers": {
                "Authorization": `Bearer ${openAIToken}`,
                "Content-Type": "application/json"
            },
            "body": {
                input,
                model
            }
        }).then ( async (rawResponse)  => {
            console.log("response from open ai" , JSON.stringify(rawResponse))
            const response = await rawResponse.json()
            
        }).catch ( (err) => {
            console.log ("error at open ai ", err)
        })
        
    } catch (e) {
        console.log("Error at ", e)
    }
}

async function main () {
    const csv = readFileSync(join(__dirname, "raw/sample.csv"))
    const records = parse(csv, {
        columns: true,
        skip_empty_lines: true
    })

    const output = await Promise.all(
        records.map(async rec => {
            const embedding = await createEmbeddings(JSON.stringify(rec))
            console.log("embedding ", embedding)
            return {
                ...rec,
                embedding
            }
        })
    )

    // console.log ("do we have output here ?? ", JSON.stringify(output))
    writeFileSync("processed/amazon_embeddings.json", JSON.stringify(output, null, 4))
    // console.log("Total usage ", output.reduce((total, item) => total += item.embedding.total_tokens, 0), " tokens")

}

main()