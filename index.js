const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot đang chạy mượt mà!');
});

app.get('/ping', (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Server Web đang mở tại cổng ${PORT}`);
});

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const userInventories = {}; 

function checkInventory(userId) {
    if (!userInventories[userId]) {
        userInventories[userId] = { bot: 0, duong: 0, trung: 0, diem: 0 };
    }
}

const HUG_MESSAGES = [
    "{nguoi_hon} vừa hôn {nguoi_nhan} một cái thật kêu! chuuu~ 😘💋"
];

const fireGifs = [
    "https://static2.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/44/f0/ALd4Vf2IrxRxTR6x5b8.gif"
];

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const argsContent = message.content.split(' ');
    const command = argsContent[0].toLowerCase();
    const userId = message.author.id;

    if (command === '!guide' || command === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('📖 CẨM NANG HƯỚNG DẪN SỬ DỤNG BOT')
            .setDescription(`Chào mừng bạn đến với hệ thống tương tác và mini-game của Server! Dưới đây là danh sách các lệnh bạn có thể sử dụng:`)
            .setColor('#00FFCA')
            .addFields(
                { 
                    name: '💕 Nhóm Lệnh Tương Tác', 
                    value: '• \`!hon @user\`: Gửi một cái hôn nồng cháy kèm ảnh GIF ngọt ngào đến người được tag.' 
                },
                { 
                    name: '🧑‍🍳 Nhóm Lệnh Làm Bánh (Mini-Game)', 
                    value: '• \`!timnguyenlieu\`: Lục tủ lạnh tìm nguyên liệu ngẫu nhiên (🌾 Bột mì, 🍬 Đường, 🥚 Trứng).\n• \`!tuido\`: Kiểm tra số lượng nguyên liệu hiện có và xem tổng điểm thợ bánh của bạn.\n• \`!nuongbanh\`: Tiêu hao **1 Bột + 1 Đường + 1 Trứng** để nướng bánh.\n• \`!baxuong\` hoặc \`!topbanh\`: Xem bảng xếp hạng những thợ bánh đỉnh nhất server.' 
                }
            )
            .setFooter({ text: 'Chúc các bạn chơi game vui vẻ!' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!hon') {
        const targetArgs = message.content.slice(4).trim();
        if (!targetArgs) {
            return message.channel.send(`<@${message.author.id}> muốn hôn ai đó nhưng lại chưa nói tên! 😳`);
        }

        const randomGif = fireGifs[Math.floor(Math.random() * fireGifs.length)];
        const randomMessage = HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)]
            .replace("{nguoi_hon}", `<@${message.author.id}>`)
            .replace("{nguoi_nhan}", targetArgs);

        const embed = new EmbedBuilder()
            .setDescription(randomMessage)
            .setColor("#FF69B4")
            .setImage(randomGif)
            .setFooter({ text: "Sướng nhá :)))" })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!timnguyenlieu') {
        checkInventory(userId);
        const nguyenLieu = ['bot', 'duong', 'trung'];
        const randomItem = nguyenLieu[Math.floor(Math.random() * nguyenLieu.length)];
        userInventories[userId][randomItem] += 1;
        const names = { bot: 'Bột mì 🌾', duong: 'Đường cát 🍬', trung: 'Trứng gà 🥚' };

        const embed = new EmbedBuilder()
            .setTitle('🔍 Tủ Lạnh Nhà Làm Bánh')
            .setDescription(`<@${userId}> đã lục lọi khắp phòng bếp và tìm thấy:\n\n**${names[randomItem]}**!`)
            .setColor('#AA8200')
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!tuido') {
        checkInventory(userId);
        const inv = userInventories[userId];

        const embed = new EmbedBuilder()
            .setTitle('🎒 Kho Nguyên Liệu Của Bạn')
            .setDescription(`🌾 **Bột mì:** ${inv.bot}\n🍬 **Đường cát:** ${inv.duong}\n🥚 **Trứng gà:** ${inv.trung}\n\n🏆 **Điểm thợ bánh:** \`\${inv.diem}\` điểm`)
            .setColor('#AA8200')
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!nuongbanh') {
        checkInventory(userId);
        const inv = userInventories[userId];
        if (inv.bot < 1 || inv.duong < 1 || inv.trung < 1) {
            return message.reply('❌ Thiếu nguyên liệu rồi! Bạn cần ít nhất **1 Bột**, **1 Đường** và **1 Trứng** để làm một chiếc bánh.');
        }
        inv.bot -= 1; inv.duong -= 1; inv.trung -= 1;
        
        const tile = Math.random() * 100;
        let ketQua = "";
        let color = "#AA8200";
        if (tile < 20) {
            color = "#FF0000";
            ketQua = "🔥 **Ôi hỏng rồi!** Bạn quên canh giờ khiến chiếc bánh **bị cháy đen thui**. Không kiếm được điểm nào cả!";
        } else if (tile < 50) {
            color = "#FFA500";
            inv.diem += 5;
            ketQua = "🤢 **Hơi đen một tí!** Chiếc bánh còn hơi sống và nhão, nhưng ăn tạm vẫn vớt vát được chút ít.\n\n🏆 *Bạn nhận được:* \`+5\` điểm.";
        } else if (tile < 90) {
            color = "#00FF00";
            inv.diem += 20;
            ketQua = "🎂 **Tuyệt vời ông mặt trời!** Bạn đã làm ra một chiếc **Bánh Kem Thơm Ngon** chuẩn vị nhà hàng năm sao!\n\n🏆 *Bạn nhận được:* \`+20\` điểm.";
        } else {
            color = "#FFD700";
            inv.diem += 50;
            ketQua = "👑 **SIÊU PHẨM THỢ BÁNH!** Chiếc bánh nướng vàng đều, xốp mịn hoàn hảo đến mức cả server phải trầm trồ ngước nhìn!\n\n🏆 *Bạn nhận được:* \`+50\` điểm.";
        }

        const embed = new EmbedBuilder()
            .setTitle('🧑‍🍳 Nướng bánh')
            .setDescription(`<@${userId}> bắt đầu nhào bột, đập trứng và bỏ vào lò...\n\n${ketQua}`)
            .setColor(color)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!baxuong' || command === '!topbanh') {
        const sortedList = Object.keys(userInventories)
            .map(id => ({ id, diem: userInventories[id].diem }))
            .sort((a, b) => b.diem - a.diem)
            .slice(0, 5);

        if (sortedList.length === 0 || sortedList.every(u => u.diem === 0)) {
            return message.channel.send('📊 Hiện tại chưa có thợ bánh nào ghi điểm trên bảng xếp hạng cả!');
        }

        let description = '';
        const medals = ['🥇', '🥈', '🥉', '✨', '✨'];
        sortedList.forEach((user, index) => {
            description += `${medals[index]} **Top ${index + 1}:** <@${user.id}> — \`\${user.diem}\` điểm\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🏆 BẢNG XẾP HẠNG THỢ BÁNH XUẤT SẮC')
            .setDescription(description)
            .setColor('#FFD700')
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);


