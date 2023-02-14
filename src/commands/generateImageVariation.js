import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from 'fs';
import fetch from "node-fetch";
import sharp from 'sharp';

const generateImageVariationCommand = new SlashCommandBuilder()
    .setName('generate_image_variation')
    .setDescription('Generate image variations')
    .addAttachmentOption((option) => option.setName('image').setDescription('Attach the image, the input image must be a square PNG image less than 4MB in size').setRequired(true))
    .addBooleanOption((option) => option.setName('hide_origin_picture').setDescription('Whether hide origin picture when displaying result'));

const generateImageVariationCommandCallback = async (client, interaction, openai) => {

    let img_url = interaction.options.data[0].attachment.url;
    let img_name = interaction.options.data[0].attachment.name;
    let hide_origin = interaction.options.data[1] ? interaction.options.data[1].value : false;
    let user = interaction.user;
    let tmpFileName = `./temp/${interaction.id}.png`;

    await interaction.reply({
        content: `Generate variation of image *${img_name}*\nWaiting for response...`,
        ephemeral: true
    });

    await fetchImgToLocal(img_url, tmpFileName);

    try {
        console.log(`> Create Variation of image *${img_name}*`);
        const response = await openai.createImageVariation(
            fs.createReadStream(tmpFileName),
            1,
            "512x512",
        );
        console.log(`> Finalize creating Variation\n`);

        let image_url = response.data.data[0].url;


        const messageEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: user.username, iconURL: user.avatarURL() })
            .setImage(image_url)
            .setDescription(`Generate variation of image *${img_name}*`)
            .setTimestamp()
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.avatarURL() });

        if (!hide_origin) messageEmbed.setThumbnail(img_url);

        await interaction.followUp({ embeds: [messageEmbed], ephemeral: false });

    } catch (err) {
        if (err.response) {
            console.error(`> !!! Error: ${err.response.status}: ${err.response.data.error.message}`,);
        } else {
            console.error(`> !!! Error: ${err.message}`);
        }
    }

    deleteLocalFile(tmpFileName);

}

const fetchImgToLocal = async (img_url, localFile) => {
    let img = await fetch(img_url);
    let imgBuffer = Buffer.from(await img.arrayBuffer());
    await sharp(imgBuffer)
        .resize({ height: 512, width: 512 })
        .toFile(localFile);
}

const deleteLocalFile = (localFile) => {
    fs.unlink(localFile, (err) => {
        if (err) console.error(`> !!! Error: ${err.message}`);
    });

}

export { generateImageVariationCommandCallback };
export default generateImageVariationCommand.toJSON();