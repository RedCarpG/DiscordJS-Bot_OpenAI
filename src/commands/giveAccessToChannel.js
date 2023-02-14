import { SlashCommandBuilder } from "discord.js";
import { readFile, writeFile } from 'fs';

const giveAccessToChannelCommand = new SlashCommandBuilder()
    .setName('give_access_to_channel')
    .setDescription('Allow the bot to read and reply in the given channel')
    .addChannelOption((option) => option.setName('channel').setDescription('Choose channel').setRequired(true))

const giveAccessToChannelCommandCallback = (client, interaction) => {
    if (!interaction.options.data[0]) {
        interaction.reply({
            content: `Please specify the **channel** !!!`,
            ephemeral: true
        });
        return;
    }

    let target_channel = interaction.options.data[0].channel;

    readFile(
        '.\\data\\channels.json',
        'utf8',
        (err, data) => {
            if (err) {
                console.error("Error: File read failed:", err);
                return;
            } 
            
            const obj = JSON.parse(data);

            obj.guilds.forEach(element => {
                if (element.id == target_channel.guildId) {
                    if (!element.channels.includes(target_channel.id)) {
                        element.channels.push(target_channel.id);
                    }
                }
            });
        }
    ).then(
        () => {
            writeFile('.\\data\\channels.json', JSON.stringify(obj), err => {
                if (err) console.error("Error: File write failed:", err);
            });
            interaction.reply({ content: `Channel ${target_channel.name} added`, ephemeral: true });
        }
    )
    interaction.reply({ content: `Waiting for response...` });
}
export { giveAccessToChannelCommandCallback };
export default giveAccessToChannelCommand.toJSON();