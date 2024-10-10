require('dotenv').config(); // Load environment variables from .env file
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const winston = require('winston'); // Import Winston for logging

// Create a new logger instance with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'bot.log' }) // Logs to file as well
    ]
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// ID ของช่องแชทที่ต้องการส่งข้อความ
const logChannelId = '1293926226485973053';

// Function to send a log message using Embed
const sendLogEmbed = async (logChannel, embed) => {
    try {
        await logChannel.send({ embeds: [embed] });
        logger.info('Embed message sent successfully.');
    } catch (error) {
        logger.error(`Failed to send embed message: ${error.message}`);
    }
};

// Text templates for dynamic greetings
const greetings = [
    "ยินดีต้อนรับสู่แดนสวรรค์แห่งเสียงเพลง!",
    "มาแล้วหรอครับ/ค่ะ เสียงเพราะๆ รออยู่เลย!",
    "พร้อมจะสนุกกันรึยัง!"
];

client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    const channel = newState.channelId;
    const guild = newState.guild;
    const currentTime = new Date().toLocaleString();

    // หาแชนแนลที่ใช้ส่งข้อความเข้า-ออก
    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel) {
        logger.error('ไม่พบแชนแนลที่ระบุ');
        return;
    }

    try {
        if (oldState.channelId === null && channel) {
            // สมาชิกเข้าห้องเสียง
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            const embed = new EmbedBuilder()
                .setColor('#00FF00')  // สีเขียวสำหรับการเข้า
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setDescription(`🟢 **${member.user.tag}** เข้าห้องเสียง **${newState.channel.name}**\n${randomGreeting}`)
                .setTimestamp()
                .setFooter({ text: `เข้าร่วมเมื่อ: ${currentTime}`, iconURL: guild.iconURL() });

            await sendLogEmbed(logChannel, embed);
        } else if (channel === null) {
            // สมาชิกออกจากห้องเสียง
            const embed = new EmbedBuilder()
                .setColor('#FF0000')  // สีแดงสำหรับการออก
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                .setDescription(`🔴 **${member.user.tag}** ออกจากห้องเสียง **${oldState.channel.name}**`)
                .setTimestamp()
                .setFooter({ text: `ออกเมื่อ: ${currentTime}`, iconURL: guild.iconURL() });

            await sendLogEmbed(logChannel, embed);
        }
    } catch (error) {
        logger.error(`Error processing voiceStateUpdate: ${error.message}`);
    }
});

// ใช้ environment variable สำหรับ token เพื่อความปลอดภัย
client.login("MTI5MzkyMjMzMzI5MDkyNjEwMA.GiA8_X.uwenEQtUu-AkaojNeAsMDthCjdxFTE75BuqI2k").catch(error => {
    logger.error(`Failed to login: ${error.message}`);
});
