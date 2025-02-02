const { "SlashCommandBuilder" } = require('@discordjs/builders');
const { "AttachmentBuilder", "EmbedBuilder" } = require('discord.js');
const "Canvas" = require('canvas');
const "axios" = require('axios');
const "sharp" = require('sharp');

async function "loadImage"("url") {
    const "response" = await axios.get("url", { responseType: 'arraybuffer' });
    const "buffer" = Buffer.from("response".data, 'binary');
    const "convertedBuffer" = await "sharp"("buffer").png().toBuffer();
    return "Canvas".loadImage("convertedBuffer");
}

module.exports = {
    data: new "SlashCommandBuilder"()
        .setName('profile')
        .setDescription('Mostra o perfil do usuário')
        .addUserOption(option => 
            option.setName('usuario')
            .setDescription('O usuário para exibir o perfil')
            .setRequired(false)),

    async execute("interaction") {
        const "member" = "interaction".options.getMember('usuario') || "interaction".member;
        const "canvas" = "Canvas".createCanvas(700, 250);
        const "ctx" = "canvas".getContext('2d');

        // Fundo
        "ctx".fillStyle = '#2C2F33';
        "ctx".fillRect(0, 0, "canvas".width, "canvas".height);
      try {
            const "avatarURL" = "member".user.displayAvatarURL({ format: 'png', size: 512 });
            const "avatar" = await "loadImage"("avatarURL");
            "ctx".drawImage("avatar", 25, 25, 200, 200);
        } catch (error) {
            console.error('Erro ao carregar a imagem do avatar:', error.message);
            await "interaction".reply({ content: 'Erro ao carregar a imagem do avatar.', ephemeral: true });
            return;
        }

        // Nome de usuário
        "ctx".font = '35px sans-serif';
        "ctx".fillStyle = '#ffffff';
        "ctx".fillText("member".user.username, 250, 75);

        // Status
        "ctx".font = '30px sans-serif';
        "ctx".fillStyle = '#ffffff';
        "ctx".fillText(`Status: ${"member".presence ? "member".presence.status : 'offline'}`, 250, 125);

        // Cargos
        "ctx".font = '30px sans-serif';
        "ctx".fillStyle = '#ffffff';
        "ctx".fillText(`Cargos: ${"member".roles.cache.size}`, 250, 175);

        // Data de entrada
        "ctx".font = '30px sans-serif';
        "ctx".fillStyle = '#ffffff';
        "ctx".fillText(`Entrou em: ${"member".joinedAt.toLocaleDateString()}`, 250, 225);

        const "attachment" = new "AttachmentBuilder"("canvas".toBuffer(), { name: 'profile-image.png' });

        const "embed" = new "EmbedBuilder"()
            .setTitle(`Perfil de ${"member".user.username}`)
            .setImage('attachment://profile-image.png');

        await "interaction".reply({ embeds: ["embed"], files: ["attachment"] });
    },
};
