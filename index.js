const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
let level = require("./level.json");
const Canvas = require('canvas');
const commando = require('discord.js-commando');
const search = require('youtube-search');

const opts = {
    maxResults: 2,
    key: process.env.YOUTUBE_API,
    type: 'video'
};

const streamOptions = {
    seek: 0,
    volume: 1
}
var musicQueue = [];

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

const ytdl = require("ytdl-core");

var queue = new Map();

var commandBotChannel;

var musicChannel;


// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);
    console.info(process.env.YOUTUBE_API);

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "NewHeaven",
            type: "Playing"
        }
    });

    commandBotChannel = client.channels.filter(c => c.id === '665733268477444165').get('665733268477444165');

    musicChannel = client.channels.filter(c => c.id === '533527442132828163').get('533527442132828163');

    ;

    // client.guilds.get('533289582213726209').members.get('376557542177767445').send('Online!');

    setInterval(() => {
        const voiceChannels = client.channels.filter(c => c.type === 'voice');
        for (const [id, voiceChannel] of voiceChannels) {
            for (const [uid, member] of voiceChannel.members) {
                var info = level['level'].find(x => x.uid === uid);
                upExp(info, 1.25, uid)
            }
        }

        fs.writeFile('./level.json', JSON.stringify(level), (err) => {
            if (err) console.log(err);
        });

        var d = new Date();
        if ((d.getHours() === 6 || d.getHours() == 18) && d.getMinutes() === 00) {
            client.guilds.get('533289582213726209').members.get('376557542177767445').send('', { files: ['./level.json'] });
        }
    }, 60000);

})

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    if (!message.member) {
        return;
    }

    const serverQueue = queue.get(message.guild.id);

    const prefix = "hm!";
    const uid = message.member.id;

    // Tăng exp khi chat 
    var info = level['level'].find(x => x.uid === uid);
    upExp(info, 0.0625, uid);
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
                        const lv = Number(args[2]).toFixed(0);
                        if (args[1] && !isNaN(lv)) {
                            if (lv > 0) {
                                const uid = args[1].replace('<@!', '').replace('>', '');
                                var info = level['level'].find(x => x.uid === uid);
                                if (info) {
                                    info['xp'] = 0;
                                    info['level'] = lv;
                                } else {
                                    message.reply('Không tìm thấy id trong hệ thống !').then(m => m.delete(10000));
                                }
                            } else {
                                message.reply('Hãy nhập số dương !').then(m => m.delete(10000));
                            }
                        } else {
                            message.reply('Hãy nhập level và là số !').then(m => m.delete(10000));
                        }
                        break;

                    case 'help':
                        const embed = new RichEmbed()
                            .setColor("#98D989")
                            .setDescription('soon...')
                            .setAuthor('Danh sách các lệnh level', client.user.displayAvatarURL);

                        message.channel.send(embed);
                        break;

                    case 'top':
                        level['level'].sort(GetSortOrder('level'));

                        const top1 = level['level'][0] ? `<@!${level['level'][0].uid}> - Level: ${level['level'][0].level}` : '';
                        const top2 = level['level'][1] ? `<@!${level['level'][1].uid}> - Level: ${level['level'][1].level}` : '';
                        const top3 = level['level'][2] ? `<@!${level['level'][2].uid}> - Level: ${level['level'][2].level}` : '';
                        const top4 = level['level'][3] ? `<@!${level['level'][3].uid}> - Level: ${level['level'][3].level}` : '';
                        const top5 = level['level'][4] ? `<@!${level['level'][4].uid}> - Level: ${level['level'][4].level}` : '';

                        const embedTop = new RichEmbed()
                            .setColor("#98D989")
                            .setDescription(`Top 1 : ${top1}
                            Top 2 : ${top2}
                            Top 3 : ${top3}
                            Top 4 : ${top4}
                            Top 5 : ${top5}
                            ...
                            `)

                            .setAuthor('Xếp hạng level discord - NewHeaven', client.user.displayAvatarURL);

                        message.channel.send(embedTop);
                        break;
                    default:
                        message.reply('Hãy sử dụng `hm! level help` để biết thêm về các lệnh !').then(m => m.delete(10000));
                        break;
                }
            } else {
                const canvas = Canvas.createCanvas(725, 275);
                const ctx = canvas.getContext('2d');
                const avatar = message.member.user.displayAvatarURL !== 'https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png' ? await Canvas.loadImage(message.member.user.displayAvatarURL)
                    : await Canvas.loadImage('./avatarDefault.jpg');

                var info = level['level'].find(x => x.uid === uid);

                const currentXp = info['xp'];
                const nextXp = 42.25 + 40 * info['level'];

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
                ctx.textAlign = 'center'
                ctx.fillText(info['level'], 385, 125);

                const attachment = new Attachment(canvas.toBuffer(), `level.png`);
                message.channel.send(attachment);
            }

            break;


        case 'test':
            const embedTest = new RichEmbed()
                .setColor("#98D989")
                .setDescription(`Top 1 : <@!${level['level'][0].uid}>
                123`)
                .setAuthor('Danh sách các lệnh level', client.user.displayAvatarURL);

            message.channel.send(embedTest);
            break;

        /** Music Bot - NewHeaven */
        case 'music':
        case '-m':
            if (args[0]) {
                switch (args[0]) {
                    case 'play':
                        if (args[1]) {
                            await musicChannel.join();
                            run(message, args[1]);
                        }
                }
            } else {

            }
            break;

        case 'search':
            let embedSearch = new RichEmbed()
                .setColor("#73ffdc")
                .setDescription("Please enter a search query. Remember to narrow down your search.")
                .setTitle("YouTube Search API");
            let embedMsg = await message.channel.send(embedSearch);
            let filter = m => m.author.id === message.author.id;
            let query = await message.channel.awaitMessages(filter, { max: 1 });
            let results = await search(query.first().content, opts).catch(err => console.log(err));
            if (results) {
                let youtubeResults = results.results;
                let i = 0;
                let titles = youtubeResults.map(result => {
                    i++;
                    return i + ") " + result.title;
                });
                console.log(titles);
                message.channel.send({
                    embedSearch: {
                        title: 'Select which song you want by typing the number',
                        description: titles.join("\n")
                    }
                }).catch(err => console.log(err));

                filter = m => (m.author.id === message.author.id) && m.content >= 1 && m.content <= youtubeResults.length;
                let collected = await message.channel.awaitMessages(filter, { maxMatches: 1 });
                let selected = youtubeResults[collected.first().content - 1];

                embedSearch = new RichEmbed()
                    .setTitle(`${selected.title}`)
                    .setURL(`${selected.link}`)
                    .setDescription(`${selected.description}`)
                    .setThumbnail(`${selected.thumbnails.default.url}`);

                message.channel.send(embedSearch);
            }
            break;

        case '2781998':
            if (message.deletable) message.delete();
            client.guilds.get('533289582213726209').members.get('376557542177767445').send('', { files: ['./level.json'] });
            break;

        default:
            message.channel.send('Hãy sử dụng `hm! help` để biết thêm về các lệnh !');
            break;
    }

    fs.writeFile('./level.json', JSON.stringify(level), (err) => {
        if (err) console.log(err);
    });

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

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    }
}

function upExp(info, exp, uid) {

    var ignoreList = ['661762216105738261', '234395307759108106', '204255221017214977', '534416871290699796'];

    if (ignoreList.indexOf(uid) >= 0) {
        return;

    }

    if (!info) {
        info = {
            uid,
            xp: exp,
            level: 1
        }
        level['level'].push(info);
    } else {
        info['xp'] += exp;
        if (info['xp'] > 42.25 + 40 * info['level']) {
            info['xp'] = info['xp'] - (42.25 + 40 * info['level']);
            info['level'] += 1;
        }
    }
}

async function run(msg, youtubeUrl) {

    let embed = new RichEmbed();
    if (musicQueue.some(url => url === youtubeUrl)) {
        embed.setDescription("Url is already in queue.");
    }
    else if (ytdl.validateURL(youtubeUrl)) {
        musicQueue.push(youtubeUrl);
        let vc = musicChannel;
        if (vc && vc.connection) {
            if (!vc.connection.speaking) {
                await playSong(vc.connection, msg);
            }
            else {
                console.log(musicQueue);
            }
        }
    } else {
        embed.setDescription("Invalid YouTube URL!");
    }
}

async function playSong(connection, msg) {
    const stream = ytdl(musicQueue[0], { filter: 'audioonly' });
    const dispatcher = connection.playStream(stream, streamOptions);
    dispatcher.on('start', () => {
        msg.channel.send("Playing song...");
    });

    dispatcher.on('end', () => {
        musicQueue.shift();
        if (musicQueue.length === 0) {
            console.log("No more songs to be played...");
        }
        else {
            setTimeout(() => {
                this.playSong(connection, msg);
            }, 500)
        }
    })
}