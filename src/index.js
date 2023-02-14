import { Client, GatewayIntentBits, Routes, REST } from "discord.js";
import { config } from "dotenv";
import { replyMessageGPTAI } from "./chatGPTAI.js";
import { hasPermissionChannel } from "./checkPermission.js";
import giveAccessToChannelCommand, { giveAccessToChannelCommandCallback } from "./commands/giveAccessToChannel.js";
import generateImageCommand, { generateImageCommandCallback } from "./commands/generateImage.js";
import generateImageVariationCommand, { generateImageVariationCommandCallback } from "./commands/generateImageVariation.js";
import { Configuration, OpenAIApi } from "openai";

config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const GUILD_ID = process.env.DISCORD_GUILD_ID
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_ORG_KEY = process.env.OPENAI_ORG_KEY

// Prepare connection to Discord API
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, // for access message content from channel or member
    ],
    allowedMentions: {
        repliedUser: false, // Not allowed to ping the user when replying
    },
});

// Prepare connection to OpenAI API
const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
    organization: OPENAI_ORG_KEY,
});
const openai = new OpenAIApi(configuration);

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// checking if bot online console is online
client.on("ready", () => console.log(`> ${client.user.username} is Online !!\n`));

client.on("messageCreate", async (message) => {
    try {
        // Return when the message is sent from robots
        if (!message.guild || message.author.bot) return;

        await hasPermissionChannel(message.guild.id, message.channel.id, () => {
            replyMessageGPTAI(client, openai, message);
        })
    } catch (err) {
        console.error(`> Error: ${err}\n`);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'give_access_to_channel') {
        giveAccessToChannelCommandCallback(client, interaction);
    } else if (interaction.commandName === 'generate_image') {
        generateImageCommandCallback(client, interaction, openai);
    } else if (interaction.commandName === 'generate_image_variation') {
        generateImageVariationCommandCallback(client, interaction, openai);
    }
});

async function main() {
    const commands = [giveAccessToChannelCommand, generateImageCommand, generateImageVariationCommand];
    // try {
        console.log(`> Start refreshing application (/) commands.`);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {
                body: commands,
            }
        );

        // login with Discord Bot Token
        console.log(`> Logging in...`);
        client.login(BOT_TOKEN);

    // } catch (err) {
    //     console.error(`> Error: ${err}\n`);
    // }
}

main();