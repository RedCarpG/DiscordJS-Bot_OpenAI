

// Main function
const replyMessageGPTAI = async (client, openai, message) => {
    console.log(`> - Message: ${message.content}`);

    let msg = await message.reply({
        content: `...`,
    });

    const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `ChatGPT\n\
        ${message.author.username}: ${message.content}\n\
        ChatGPT: `,
        temperature: 0.9,
        max_tokens: 100,
        stop: ["ChatGPT:"]
    });
    let gptReply = gptResponse.data.choices[0].text;

    msg.edit({
        content: `${gptReply}`,
    });
    console.log(`> - Reply: ${gptReply}\n`);
};

export { replyMessageGPTAI };