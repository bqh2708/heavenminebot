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
                    if (level[id]['xp'] > 12.5 + 25 * level[id]['level']) {
                        level[id]['xp'] = level[id]['xp'] - (12.5 + 25 * level[id]['level']);
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
            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext('2d');

            const background = await Canvas.loadImage('./backgoundLevel.jpg');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#74037b';
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            // Slightly smaller text placed above the member's display name
            ctx.font = '28px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('test,', canvas.width / 2.5, canvas.height / 3.5);

            // Add an exclamation point here and below
            ctx.font = applyText(canvas, `${message.member.displayName}!`);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${message.member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatar = await Canvas.loadImage(message.member.user.displayAvatarURL);
            ctx.drawImage(avatar, 25, 25, 200, 200);

            const attachment = new Attachment(canvas.toBuffer(), `level.png`);
            message.channel.send(`test`, attachment);

            // const levelInfo = level[message.author.id];

            // level['id'] = { xp: 0, level: 1 };
            // fs.writeFile('./level.json', JSON.stringify(level), (err) => {
            //     if (err) console.log(err);
            // });
            break;


        case 'test':
            break;

        case 'mylevel':
            if (!level[message.member.id]) {
                level[message.member.id] = { xp: 0, level: 1 };
            }

            message.channel.send(`level: ${level[message.member.id]['level']}     xp: ${level[message.member.id]['xp']}`);
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