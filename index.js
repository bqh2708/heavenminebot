const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
let level = require("./level.json");
const Canvas = require('canvas');

config({
    path: __dirname + "/.env"
})

// Declares our bot,
// the disableEveryone prevents the client to ping @everyone
const client = new Client({
    disableEveryone: true
});
const guild = new Guild({
    disableEveryone: true
});

// Pass the entire Canvas object because you'll need to access its width, as well its context
const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 70;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `${fontSize -= 10}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
};

// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "NewHeaven",
            type: "Playing"
        }
    });

    setInterval(() => {
        const voiceChannels = client.channels.filter(c => c.type === 'voice');
        for (const [id, voiceChannel] of voiceChannels) {
            for (const [id, member] of voiceChannel.members) {
                if (!level[id]) {
                    level[id] = { xp: 1.25, level: 1 };
                } else {
                    level[id]['xp'] += 1.25;
                    if (level[id]['xp'] > 12.5 + 40 * level[id]['level']) {
                        level[id]['xp'] = level[id]['xp'] - (12.5 + 40 * level[id]['level']);
                        level[id]['level'] += 1;
                    }
                }
                fs.writeFile('./level.json', JSON.stringify(level), (err) => {
                    if (err) console.log(err);
                });
            }
        }
    }, 60000);
})

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    const prefix = "hm!";
    const uid = message.member.id;

    // Tăng exp khi chat 
    if (!level[uid]) {
        level[uid] = { xp: 1.25, level: 1 };
    } else {
        level[uid]['xp'] += 0.125;
        if (level[uid]['xp'] > 12.5 + 40 * level[uid]['level']) {
            level[uid]['xp'] = level[uid]['xp'] - (12.5 + 40 * level[uid]['level']);
            level[uid]['level'] += 1;
        }

        fs.writeFile('./level.json', JSON.stringify(level), (err) => {
            if (err) console.log(err);
        });
    }

    // Tăng exp khi chat end


    // If the author's a bot, return
    // If the message was not sent in a server, return
    // If the message doesn't start with the prefix, return
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    // Arguments and command variable
    // cmd is the first word in the message, aka the command
    // args is an array of words after the command
    // !say hello I am a bot
    // cmd == say (because the prefix is sliced off)
    // args == ["hello", "I", "am", "a", "bot"]
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = (args.shift()).toLowerCase();

    switch (cmd) {

        case 'help':
            const embed = new RichEmbed()
                .setColor("#98D989")
                .setDescription('Không có lệnh nào hêt :)')
                .setAuthor('Danh sách các lệnh HM', client.user.displayAvatarURL);

            message.channel.send(embed);
            break;

        case 'say':
            // Check if you can delete the message
            if (message.deletable) message.delete();

            if (args.length === 0) {
                message.reply(`Nothing to say?`).then(m => m.delete(5000));
                break;
            };

            // If the first argument is embed, send an embed,
            // otherwise, send a normal message
            if (args[0].toLowerCase() === "embed") {
                const embed = new RichEmbed()
                    .setDescription(args.slice(1).join(" "))
                    .setColor("#98D989")
                    .setTitle('1234')
                    .setDescription('1234');
                // .setImage(client.user.displayAvatarURL)
                // .setAuthor(message.author.username, message.author.displayAvatarURL);

                message.channel.send(embed);
            } else {
                message.channel.send(args.join(" "));
            }
            break;

        case 'nickname':
            if (args.join(" ") === 'clear') {
                message.member.setNickname(`HM | ${message.author.username}`);
            } else {
                message.member.setNickname(`HM | ${args.join(" ")}`);
            }
            break;

        case 'level':
            if (args[0]) {
                switch (args[0]) {
                    case 'set':
                        const lv = Number(args[1]);
                        if (args[1] && !isNaN(lv)) {
                            const uid = args[1].replace('<@!', '').replace('>', '');
                            level[uid]['level'] = args[2];
                            level[uid]['xp'] = 0;

                            fs.writeFile('./level.json', JSON.stringify(level), (err) => {
                                if (err) console.log(err);
                            });
                        } else {
                            message.channel.send('Hãy nhập level và là số !');
                        }
                        break;

                    default:
                        message.reply(`Unknow Command`).then(m => m.delete(5000));
                        break;
                }
            } else {
                const canvas = Canvas.createCanvas(725, 275);
                const ctx = canvas.getContext('2d');
                const avatar = await Canvas.loadImage(message.member.user.displayAvatarURL);

                const currentXp = level[uid]['xp'];
                const nextXp = 12.5 + 40 * level[uid]['level'];

                ctx.beginPath();
                var grd = ctx.createLinearGradient(150, 0, 425, 0);
                grd.addColorStop(0, "#1755b3");
                grd.addColorStop(1, "#0e3671");
                ctx.fillStyle = grd;
                ctx.moveTo(725, 275);
                ctx.lineTo(725, 0);
                ctx.lineTo(300, 0);
                ctx.lineTo(250, 275);
                ctx.lineTo(725, 275);
                ctx.drawImage(avatar, 0, 0, 300, 275);

                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(725, 275);
                ctx.lineTo(725, 150);
                ctx.lineTo(273, 150);
                ctx.lineTo(259, 225);
                ctx.lineTo(725, 225);
                ctx.fillStyle = '#00112890'
                ctx.fill();

                // For Display XP Start
                ctx.beginPath();
                ctx.moveTo(682, 275);
                ctx.lineTo(682, 52);
                ctx.lineTo(348, 52);
                ctx.lineTo(348, 23);
                ctx.lineTo(682, 23);
                ctx.fillStyle = '#96a4b9'
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(680, 275);
                ctx.lineTo(680, 50);
                ctx.lineTo(350, 50);
                ctx.lineTo(350, 25);
                ctx.lineTo(680, 25);
                ctx.fillStyle = 'white'
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(348 + 348 * (currentXp / nextXp), 275);
                ctx.lineTo(348 + 348 * (currentXp / nextXp), 49);
                ctx.lineTo(351, 49);
                ctx.lineTo(351, 26);
                ctx.lineTo(348 + 348 * (currentXp / nextXp), 26);
                ctx.fillStyle = '#7287a7'
                ctx.fill();

                // For Display XP Start End

                ctx.font = "30px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'right'
                ctx.fillText(`HM | ${message.author.username}`, 700, 200);

                ctx.font = "16px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'right'
                ctx.fillText("New Heaven - Server MineCraft Việt Nam", 710, 260);

                // XP display
                ctx.font = "16px Consolas";
                ctx.fillStyle = "black";
                ctx.fillText(`XP: ${currentXp} / ${nextXp}`, 580, 43);

                // Hiển thị LEVEL
                ctx.font = "bold 15px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.fillText("LEVEL", 410, 78);

                ctx.font = "48px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.fillText(level[uid]['level'], 397, 125);

                const attachment = new Attachment(canvas.toBuffer(), `level.png`);
                message.channel.send(attachment);
            }

            break;


        case 'test':
            console.info(message.content);
            console.info(args);
            break;

        case '2781998':
            message.channel.send(`level`, { files: ['./level.json'] });
            break;

        default:
            message.channel.send('Hãy sử dụng `hm! help` để biết thêm về các lệnh !');
            break;
    }


});

client.on('guildMemberUpdate', (oldData, newData) => {
    if (!oldData._roles.includes('660671267917135883') && newData._roles.includes('660671267917135883')) {
        oldData.guild.members.get(oldData.user.id).setNickname(`HM | ${newData.user.username}`)
        // oldData.guild.members.get(oldData.user.id).setRoles("661800721251041291")
    } else if (!newData._roles.includes('660671267917135883')) {
        oldData.guild.members.get(oldData.user.id).setNickname('');

    }
})


// Login the bot
client.login(process.env.TOKEN);