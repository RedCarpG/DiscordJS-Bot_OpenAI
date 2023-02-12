import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const generateImageCommand = new SlashCommandBuilder()
    .setName('generate_image')
    .setDescription('Generate an image')
    .addStringOption((option) => option.setName('description').setDescription('Describe the image').setRequired(true))

const generateImageCommandCallback = async (client, interaction, openai) => {
    if (!interaction.options.data[0]) {
        interaction.reply({
            content: `Please give the **image description** !!!`,
            ephemeral: true
        });
        return;
    }

    let image_description = `${interaction.options.data[0].value}`;
    let channel = interaction.channel;
    let user = interaction.user;

    await interaction.reply({
        content: `**Image description**:\n*${image_description}*\n\nWaiting for response...`,
        ephemeral: true
    });

    try {
        const response = await openai.createImage({
            prompt: image_description,
            n: 1,
            size: "1024x1024",
        });

        let image_url = response.data.data[0].url;

        const messageEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: user.username, iconURL: user.avatarURL() })
            .setDescription(`**Description**:\n*${image_description}*`)
            .setImage(image_url)
            .setTimestamp()
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.avatarURL() });

        console.log(`> - Generate Image: ${image_description}`);
        await interaction.followUp({ embeds: [messageEmbed], ephemeral: false });

    } catch (err) {
        if (err.response) {
            console.error(`> !!! Error: ${err.response.status}: ${err.response.data.error.message}`,);
            await interaction.editReply({
                content: `**Image description**:\n*${image_description}*\n\n${err.response.status}`,
                ephemeral: true
            });
        } else {
            console.error(`Error: ${err.message}`);
            await interaction.editReply({
                content: `**Image description**:\n*${image_description}*\n\n${err.message}`,
                ephemeral: true
            });
        }


        return;
    }

}

export { generateImageCommandCallback };
export default generateImageCommand.toJSON();