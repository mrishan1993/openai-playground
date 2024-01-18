import OpenAPI from "openai"
const openai = new OpenAPI()



// dummy function // 
// could be a api call to rest or external api 

function getWeather (location, unit = "fahrenheit") {
    if (location.toLowerCase().includes("tokyo")) {
        return JSON.stringify({location: "Tokyo", temperature: "10", unit: "celsius"})
    } else if (location.toLowerCase().includes("san francisco")) {
        return JSON.stringify({location: "San Francisco", temperature: "72", unit: "fahrenheit"})
    } else if (location.toLowerCase().includes("paris")) {
        return JSON.stringify({location: "Paris", temperature: "10", unit: "celsius"})
    } else {
        return JSON.stringify({ location, temperature: "unknown" });
    }
}

// function to call open ai

async function runConversation () {
    const messages = [
        {
            role: "user", 
            content: "What's the weather like in Tokyo, Francisco and Paris ?"
        }
    ]

    const tools = [
        {
            type: "function",
            function: {
                name: "getWeather",
                description: "Get the current weather in the location",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "The city and the state"
                        },
                        unit: {
                            type: "string",
                            enum: ["celsius", "fahrenheit"]
                        }
                    },
                    required: ["location"]
                }
            }
        }
    ]

    // create response 
    const response = await openai.chat.completions.create ({
        messages: messages,
        model: "gpt-3.5-turbo-1106",
        tools: tools,
        tool_choice: "auto"
    })

    const responseMessage = response.choices[0].message
    console.log("response messaGe 1 ", JSON.stringify(responseMessage))
    const toolCalls = responseMessage.tool_calls
    if (toolCalls) {
        const availableFunction = {
            "getWeather": getWeather
        }
        messages.push(responseMessage)

        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name
            const functionToCall = availableFunction[functionName]
            const functionArgs = JSON.parse(toolCall.function.arguments)
            const functionResponse = functionToCall(functionArgs.location, functionArgs.unit)
            console.log ("function response ", functionResponse)
            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: functionResponse
            })
        }

        console.log("\n messages", messages )
        const secondResponse = await openai.chat.completions.create ({
            model: "gpt-3.5-turbo-1106",
            messages: messages,
        })
        console.log ("second response ", JSON.stringify(secondResponse))
        return secondResponse.choices
        
    }
}
runConversation().then(console.log).catch(console.error);