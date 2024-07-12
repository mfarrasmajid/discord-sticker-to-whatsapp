const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sticker')
		.setDescription('Record sticker and send it via WhatsApp.'),
	async execute(interaction) {
        // `m` is a message object that will be passed through the filter function
        const collectorFilter = m => m.content.includes('discord');
        const collector = interaction.channel.createMessageCollector({ filter: collectorFilter, time: 15_000 });

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
	},
};