import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
    const stream = await openai.beta.chat.completions.stream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Say this is a test' }],
        stream: true,
      });
    
      stream.on('content', (delta, snapshot) => {
        process.stdout.write(delta);
      });
    
      // or, equivalently:
      for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
      }
    
      const chatCompletion = await stream.finalChatCompletion();
      console.log(chatCompletion); // {id: "…", choices: […], …}
}

main();