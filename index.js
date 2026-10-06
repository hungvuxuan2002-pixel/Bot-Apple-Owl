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
    "https://klipy.com"
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
                    value: '• \`!hon @user\`: Gửi một cái hôn nồng cháy.\n• \`!dosonuoc @user\`: 🪣 Đổ xô nước đá lạnh buốt hoặc tạt nước 🌊 vào mặt ai đó.\n• \`!hadoc @user\`: 🧪 Lén bỏ thuốc độc khiến đối phương sùi bọt mép ☠️.\n• \`!chichdien @user\`: ⚡ Rút dùi cui điện chích tê tái, giật tung tóc 🔌.' 
                },
                { 
                    name: '🧑‍🍳 Nhóm Lệnh Làm Bánh (Mini-Game)', 
                    value: '• \`!timnguyenlieu\`: Lục tủ lạnh tìm nguyên liệu ngẫu nhiên (🌾 Bột mì, 🍬 Đường, 🥚 Trứng).\n• \`!tuido\`: Kiểm tra số lượng nguyên liệu hiện có và xem tổng điểm thợ bánh của bạn.\n• \`!nuongbanh\`: Tiêu hao **1 Bột + 1 Đường + 1 Trứng** để nướng bánh.\n• \`!baxuong\` hoặc \`!topbanh\`: Xem bảng xếp hạng những thợ bánh đỉnh nhất server.\n• \`!congdiem @user <số>\`: Cộng điểm thợ bánh cho thành viên (chỉ quản trị viên).' 
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
            .setDescription(`🌾 **Bột mì:** ${inv.bot}\n🍬 **Đường cát:** ${inv.duong}\n🥚 **Trứng gà:** ${inv.trung}\n\n🏆 **Điểm thợ bánh:** **${inv.diem}** điểm`)
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


    // Lệnh quản trị: !congdiem @user <số điểm>
    if (command === '!congdiem') {
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('⛔ Chỉ quản trị viên mới được dùng lệnh cộng điểm.');
        }

        const target = message.mentions.users.first();

        // Lấy số điểm từ nội dung lệnh, bỏ phần tên lệnh và mention
        const pointArgs = message.content
            .trim()
            .split(/\s+/)
            .slice(1)
            .filter(arg => !/^<@!?\d+>$/.test(arg));

        const pointsText = pointArgs[pointArgs.length - 1];
        const points = Number(pointsText);

        if (!target || !pointsText ||
            !Number.isSafeInteger(points) || points <= 0) {
            return message.reply(
                'Cách dùng: `!congdiem @user <số điểm>` — số điểm phải là số nguyên dương.'
            );
        }

        if (target.bot) {
            return message.reply('❌ Không thể cộng điểm cho bot.');
        }

        checkInventory(target.id);
        userInventories[target.id].diem += points;

        return message.channel.send(
            `✅ Đã cộng **${points} điểm** thợ bánh cho <@${target.id}>. ` +
            `Tổng điểm hiện tại: **${userInventories[target.id].diem}**.`
        );
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
            description += `${medals[index]} **Top ${index + 1}:** <@${user.id}> — **${user.diem}** điểm\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🏆 BẢNG XẾP HẠNG THỢ BÁNH XUẤT SẮC')
            .setDescription(description)
            .setColor('#FFD700')
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!dosonuoc') {
        const targetArgs = message.content.slice(10).trim();
        if (!targetArgs) return message.channel.send(`<@${message.author.id}> định đổ nước vào ai thế? Tag người đó vào nhé! 🪣`);

        const gifs = [
            "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExY28wMzdoanppa3pjdzg2dHQ3b205bGl3bHBoMWxtZzA5N2o5YzloeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Za2x9wbfVuQb6/giphy.webp"
            
        ];

        const responses = [
            `<@${message.author.id}> đã đổ nguyên một xô nước đá lạnh buốt lên đầu ${targetArgs}! 🥶`,
        ];
        
        const embed = new EmbedBuilder()
            .setDescription(responses[Math.floor(Math.random() * responses.length)])
            .setColor("#00BFFF")
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!hadoc') {
        const targetArgs = message.content.slice(7).trim();
        if (!targetArgs) return message.channel.send(`<@${message.author.id}> định hạ độc ai cơ? Gắn thẻ họ vào đi! 🧪`);

        const gifs = [
            "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjA4MTJxeWUzeHhtNzRpZXd3OWhpYTlodXBhcHFwajJ6MWo0eHRxaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE4hinbJvjsgGxW/giphy.gif"
        ];

        const responses = [
            `<@${message.author.id}> tặng ${targetArgs} một quả táo độc. ${targetArgs} cắn một miếng rồi ngất lịm! 🍎`
        ];

        const embed = new EmbedBuilder()
            .setDescription(responses[Math.floor(Math.random() * responses.length)])
            .setColor("#8B008B")
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (command === '!chichdien') {
        const targetArgs = message.content.slice(10).trim();
        if (!targetArgs) return message.channel.send(`<@${message.author.id}> muốn chích điện ai thế? Nhớ tag tên nhé! ⚡`);

        const gifs = [
            "https://media.tenor.com/WK-AZItKuX0AAAAM/abster-abstract.gif"
        ];

        const responses = [
            `<@${message.author.id}> rút dùi cui điện ra và chích... ${targetArgs} giật bắn người, tóc dựng ngược! ⚡`,
        ];

        const embed = new EmbedBuilder()
            .setDescription(responses[Math.floor(Math.random() * responses.length)])
            .setColor("#FFD700")
            .setImage(gifs[Math.floor(Math.random() * gifs.length)])
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
