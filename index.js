const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
const Canvas = require('canvas');
const commando = require('discord.js-commando');

let votingFlg = false;


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

var curentChannel;


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

    commandBotChannel = client.channels.filter(c => c.id === '665733268477444165').get('665733268477444165');
    musicVoiceChannel = client.channels.filter(c => c.id === '533527442132828163').get('533527442132828163');
    musicTextChannel = client.channels.filter(c => c.id === '534043453042982933').get('534043453042982933');

    client.guilds.get('533289582213726209').members.get('376557542177767445').send('Online!');

    setInterval(() => {
        const voiceChannels = client.channels.filter(c => c.type === 'voice');
        for (const [id, voiceChannel] of voiceChannels) {
            for (const [uid, member] of voiceChannel.members) {
                if (member.selfMute || member.selfDeaf) {
                    upExp(0.5, uid);
                } else {
                    upExp(1.25, uid);
                }
            }
        }
    }, 60000);
})

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    if (!message.member) {
        return;
    }

    const prefix = "hm!";
    const uid = message.member.id;

    // If the author's a bot, return
    // If the message was not sent in a server, return
    // If the message doesn't start with the prefix, return
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.toLowerCase().startsWith(prefix)) {
        upExp(0.0625, uid);
        return;
    };

    // Arguments and command variable
    // cmd is the first word in the message, aka the command
    // args is an array of words after the command
    // !say hello I am a bot
    // cmd == say (because the prefix is sliced off)
    // args == ["hello", "I", "am", "a", "bot"]
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = (args.shift()).toLowerCase();

    let embed = new RichEmbed();

    switch (cmd) {

        case 'help':
            replyHelpMessage(message);
            break;

        case 'say':
            // Check if you can delete the message
            if (message.deletable) message.delete();

            let idChannel = args.shift();
            let channelToSend = client.channels.filter(c => c.id === idChannel).get(idChannel);
            channelToSend.send(args.join(" "));
            break;

        case 'nickname':
            if (args.join(" ") === 'clear') {
                message.member.setNickname(`HM | ${message.author.username}`);
            } else {
                message.member.setNickname(`HM | ${args.join(" ")}`);
            }
            break;

        case 'level': case '-l':
            if (args[0]) {
                switch (args[0]) {

                    case 'resetshdgfhjs':

                        let sqlDelete = 'DELETE FROM TBL_EXP';

                        pool.query(sqlDelete, (err, result) => {

                        });
                        break;

                    case 'help': case '-h':
                        replyLevelHelpMessage(message);
                        break;

                    case 'top': case '-t':

                        let sql = 'SELECT * FROM TBL_EXP ORDER BY LEVEL DESC, EXP DESC LIMIT 5';

                        if (args[1]) {
                            let numberChoice = Number(args[1]).toFixed(0);;
                            if (args[1] && !isNaN(numberChoice)) {
                                if (numberChoice > 0) {
                                    sql = 'SELECT * FROM TBL_EXP ORDER BY LEVEL DESC, EXP DESC LIMIT ' + numberChoice;
                                } else {
                                    message.reply('Hãy nhập số dương !').then(m => m.delete(10000));
                                }
                            } else {
                                if (args[1] === 'all') {
                                    sql = 'SELECT * FROM TBL_EXP ORDER BY LEVEL DESC, EXP DESC';
                                } else {
                                    message.reply('Hãy nhập số dương !').then(m => m.delete(10000));
                                }
                            }
                        }

                        pool.query(sql, (err, result) => {
                            if (err) {
                                console.info(err);
                                return;
                            };

                            let content = '';

                            result.rows.some((item, index) => {
                                content += `
                                Top ${index + 1} : <@!${item.user_id}> - Level: ${item.level}`
                            });

                            content += `
                            ...`;

                            const embedTop = new RichEmbed()
                                .setColor("#98D989")
                                .setDescription(content).setAuthor('Xếp hạng level discord - NewHeaven', client.user.displayAvatarURL);

                            message.channel.send(embedTop);
                        });

                        break;

                    default:
                        message.reply('Hãy sử dụng `hm! level help` để biết thêm về các lệnh !').then(m => m.delete(10000));
                        break;
                }
            } else {

                upExp(0.0625, uid);

                let sql = 'SELECT * FROM TBL_EXP ORDER BY LEVEL DESC, EXP DESC';

                const canvas = Canvas.createCanvas(725, 275);
                const ctx = canvas.getContext('2d');
                const avatar = !message.member.user.displayAvatarURL.startsWith('https://discordapp.com/assets') ?
                    await Canvas.loadImage(message.member.user.displayAvatarURL)
                    : await Canvas.loadImage('./avatarDefault.jpg');


                pool.query(sql, ((err, result) => {
                    if (err) {
                        console.info(err);
                    };

                    var info = result.rows.find(x => x.user_id === uid);
                    const top = result.rows.indexOf(info) + 1;
                    let countLevel = info['level'] - 1;

                    let totalExp = 142.25 * countLevel + info['exp'];
                    let count = 0;

                    for (let index = 0; index < countLevel; index++) {
                        count += index
                    }

                    totalExp += 100 * count;

                    const currentXp = info['exp'];
                    const nextXp = 342.25 + 100 * info['level'];

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
                    ctx.moveTo(351 + 328 * (currentXp / nextXp), 275);
                    ctx.lineTo(351 + 328 * (currentXp / nextXp), 49);
                    ctx.lineTo(351, 49);
                    ctx.lineTo(351, 26);
                    ctx.lineTo(351 + 328 * (currentXp / nextXp), 26);
                    ctx.fillStyle = '#7287a7'
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(441, 220);
                    ctx.lineTo(441, 135);
                    ctx.lineTo(440, 135);
                    ctx.lineTo(440, 70);
                    ctx.lineTo(441, 70);
                    ctx.fillStyle = 'white'
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

                    ctx.font = "17px Arial";
                    ctx.fillStyle = "#fffffff9";
                    ctx.textAlign = 'left'
                    ctx.fillText("Server rank : ", 460, 90);

                    ctx.font = "17px Consolas";
                    ctx.fillStyle = "#fffffff9";
                    ctx.textAlign = 'left'
                    ctx.fillText(`#${top}`, 580, 90);

                    ctx.font = "17px Arial";
                    ctx.fillStyle = "#fffffff9";
                    ctx.textAlign = 'left'
                    ctx.fillText("Server exp : ", 460, 125);

                    ctx.font = "17px Consolas";
                    ctx.fillStyle = "#fffffff9";
                    ctx.textAlign = 'left'
                    ctx.fillText(totalExp.toFixed(0), 580, 125);

                    const attachment = new Attachment(canvas.toBuffer(), `level.png`);
                    message.channel.send(attachment);

                }).bind(this));
            }

            break;

        /** Music Bot - NewHeaven */
        case 'music':
        case '-m':
            if (args[0]) {
                switch (args[0]) {
                    case 'play': case '-p':
                        if (args[1]) {
                            if (!curentChannel) {
                                if (!message.member.voiceChannelID) {
                                    message.reply('Hãy tham gia voice channel !').then(m => m.delete(10000));
                                    break;
                                }
                                curentChannel = client.channels.filter(c => c.id === message.member.voiceChannelID).get(message.member.voiceChannelID);
                            }
                            await curentChannel.join();

                            // Search trên youtube 
                            let results = await search(args.slice(1).join(" "), opts).catch(err => console.log(err));
                            if (results) {
                                let youtubeResults = results.results;
                                await run(message, youtubeResults)
                            }
                        }
                        break;
                    case 'next': case '-n':
                        // Check if you can delete the message
                        if (message.deletable) message.delete();

                        if (curentChannel) {
                            if (!votingFlg) {
                                let countDown = 30;
                                let interval;

                                embed = new RichEmbed()
                                    .setColor("#CC99FF")
                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                    .setDescription(`<@!${message.author.id}> vừa yêu cầu chuyển bài hát. 
                            Thời gian còn lại : ${countDown}
                            :iconYes: : Đồng ý    :iconNo: Không đồng ý`);
                                message.channel.send(embed).then((msg) => {
                                    msg.react('667753397490941982');
                                    msg.react('667753909418459178');
                                    votingFlg = true;

                                    interval = setInterval(() => {
                                        countDown--;
                                        embed = new RichEmbed()
                                            .setColor("#CC99FF")
                                            .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                            .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                Thời gian còn lại : ${countDown}
                                <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                        msg.edit(embed);
                                        if (countDown === 1) {
                                            let countYes = msg.reactions.get('iconYes:667753397490941982').count;
                                            let countNo = msg.reactions.get('iconNo:667753909418459178').count;

                                            if (countYes > countNo) {
                                                embed = new RichEmbed()
                                                    .setColor("#CC99FF")
                                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                                    .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                        Kết quả : Chuyển bài
                                        <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                                if (dispatcherStream) {
                                                    dispatcherStream.end();
                                                }
                                            } else {
                                                embed = new RichEmbed()
                                                    .setColor("#CC99FF")
                                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                                    .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                        Kết quả :Không chuyển bài
                                        <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                            }

                                            msg.edit(embed).then(m => m.delete(2000));
                                            clearInterval(interval);

                                            votingFlg = false;
                                        }
                                    }, 1000);
                                });
                            } else {
                                message.reply('Đang vote rồi kìa má ==! ').then(m => m.delete(5000));
                            }

                        } else {
                            message.reply('Đùa tôi à ! Có phát nhạc đâu mà next :| ').then(m => m.delete(5000));
                        }
                        break;

                    case 'loop': case '-l':
                        if (loopMusicFlg) {
                            loopMusicFlg = false;
                            message.reply('Đã tắt chế dộ lặp bài hát !').then(m => m.delete(10000));
                        } else {
                            loopMusicFlg = true;
                            message.reply('Đã bật chế dộ lặp bài hát !').then(m => m.delete(10000));
                        }
                        break;
                    case 'help | -h':
                    default:
                        replyMusicHelpMessage(message);
                        break;
                }
            } else {

            }
            break;

        default:
            message.channel.send('Hãy sử dụng `hm! help` để biết thêm về các lệnh !');
            break;
    }

});

client.on('guildMemberUpdate', (oldData, newData) => {
    try {
        if (!oldData._roles.includes('660671267917135883') && newData._roles.includes('660671267917135883')) {
            oldData.guild.members.get(oldData.user.id).setNickname(`HM | ${newData.user.username}`)
            // oldData.guild.members.get(oldData.user.id).setRoles("661800721251041291")
        } else if (!newData._roles.includes('660671267917135883')) {
            oldData.guild.members.get(oldData.user.id).setNickname('');
        }
    } catch (error) {
        console.info('Không có quyền thay đổi nickName !');
    }
})

// Login the bot
client.login(process.env.TOKEN);

/**********************************************************  MUSIC **********************************************************/

const search = require('youtube-search');
const opts = {
    maxResults: 1,
    key: process.env.YOUTUBE_API,
    type: 'video'
};
const streamOptions = {
    seek: 0,
    volume: 1
}
var musicQueue = [];
var dispatcherStream;

var loopMusicFlg = false;
var speakingFlg = false;

async function run(msg, result) {
    youtubeUrl = result[0].link;
    let title = result[0].title;

    if (musicQueue.some(x => x.url === youtubeUrl)) {
        msg.reply(`Đã tồn tại bài hát vừa yêu cầu trong danh sách phát !`).then(m => m.delete(5000));
    } else if (ytdl.validateURL(youtubeUrl)) {
        musicQueue.push({ title: title, url: youtubeUrl, authorId: msg.author.id, username: msg.author.username, avatarURL: msg.author.displayAvatarURL });
        let vc = curentChannel;
        if (vc && vc.connection) {
            if (!vc.connection.speaking && !speakingFlg) {
                await playSong(vc.connection, msg);
                speakingFlg = true;
            }
            else {
                msg.reply(`Đã thêm bài hát : ${title} vào danh sách phát !`);
            }
        }
    } else {
        msg.reply(`Có lỗi xảy ra khi tìm kiếm bài hát !`).then(m => m.delete(5000));
    }
}

async function playSong(connection, msg) {
    const stream = ytdl(musicQueue[0].url, { filter: 'audioonly' });
    dispatcherStream = connection.playStream(stream, streamOptions);

    dispatcherStream.on('start', () => {
        embed = new RichEmbed()
            .setColor("#98D989")
            .setAuthor(musicQueue[0].username, musicQueue[0].avatarURL)
            .setDescription(`${musicQueue[0].title}
            「<@!${musicQueue[0].authorId}>」`);
        msg.channel.send(embed);
    });

    dispatcherStream.on('end', () => {
        var musicTemp = musicQueue.shift();

        if (loopMusicFlg) {
            musicQueue.push(musicTemp);
        } else {

        }

        if (musicQueue.length === 0) {
            curentChannel.leave();
            curentChannel = null;
            speakingFlg = false;
        } else {
            setTimeout(() => {
                playSong(connection, msg);
            }, 500)
        }
    })
}

/**********************************************************  MUSIC END **********************************************************/
const parse = require("pg-connection-string");
const { Pool } = require('pg');
let pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    port: 5432,
    host: process.env.HOST,
    database: process.env.DB,
    user: process.env.USER,
    password: process.env.PASSWORD,
    ssl: true,
});


/**********************************************************  LEVEL **********************************************************/

// pool.connect(err => {
//     if (err) throw err;
//     console.info('Ket noi thanh cong');
// })

// pool.query(`CREATE TABLE TBL_EXP(
//     USER_ID varchar(18) PRIMARY KEY,
//     EXP float,
//     LEVEL integer)`, (err, result) => {
//     if (err) {
//         console.info(err);
//     } else if (result) {
//         console.info(result);
//     }
// });

// pool.query(`INSERT INTO TBL_EXP(USER_ID,EXP,LEVEL)
//         VALUES ('376557542177767445',429.5625,7),
//         ('581821782001057802',160.8125,4),
//         ('668797880517263361',90.0625,2)`, (err, result) => {
//     if (err) {
//         console.info(err);
//     } else if (result) {
//         console.info(result);
//     }
// });


// pool.query(`SELECT * FROM TBL_EXP ORDER BY LEVEL DESC, EXP DESC`, (err, result) => {
//     if (err) {
//         console.info(err);
//     } else if (result) {
//         console.info(result);
//     }
// });

function upExp(exp, uid) {
    var ignoreList = ['661762216105738261', '234395307759108106', '204255221017214977', '534416871290699796'];

    if (ignoreList.indexOf(uid) >= 0) {
        return;
    }
    let sql = `SELECT * FROM TBL_EXP WHERE USER_ID = '${uid}'`;

    pool.query(sql, (err, result) => {
        if (err) {
            console.info(err);
        } else if (result) {
            if (result.rowCount) {
                let nextXp = result.rows[0].exp + exp;
                let currentLevel = result.rows[0].level;
                if (nextXp > 342.25 + 100 * currentLevel) {
                    nextXp -= 342.25 + 100 * currentLevel;
                    sql = `UPDATE TBL_EXP SET EXP = ${nextXp}, LEVEL = ${currentLevel + 1} WHERE USER_ID = '${uid}'`;
                } else {
                    sql = `UPDATE TBL_EXP SET EXP = ${nextXp} WHERE USER_ID = '${uid}'`;
                }

                pool.query(sql, (err, result) => {
                    if (err) console.info(err);
                });
            } else {
                sql = `INSERT INTO TBL_EXP(USER_ID,EXP,LEVEL) VALUES ('${uid}',${exp},1)`;
                pool.query(sql, (err, result) => {
                    if (err) console.info(err);
                });
            }
        }
    });
}

/**********************************************************  LEVEL END **********************************************************/

/**********************************************************  MESSAGE **********************************************************/

function replyMusicHelpMessage(message) {
    var content = `
    \`hm! music <key> \`
    - \`play\` <Tên bài hát>            Thêm bài vào danh sách phát
    - \`next\`                        Chuyển bài hát tiếp theo
    - \`loop\`                        Bật/Tắt chế độ lặp lại danh sách phát
    Có thể sử dụng command tắt VD : \`hm! -m -n\` = \`hm! music next\`
    `;

    embed = new RichEmbed()
        .setColor("#98D989")
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setDescription(content);
    message.channel.send(embed);
}

function replyHelpMessage(message) {
    var content = `
    - \`hm! level help\`            Các comamnd về hệ thống level.
    - \`hm! music help\`            Các command về hệ thống music.
    Có thể sử dụng command tắt VD : \`hm! -m -h\` = \`hm! music help\`
    `;

    embed = new RichEmbed()
        .setColor("#98D989")
        .setAuthor('Danh sách các lệnh HM', client.user.displayAvatarURL)
        .setDescription(content);
    message.channel.send(embed);
}

function replyLevelHelpMessage(message) {
    var content = `
    - \`hm! level \`                 Hiển thị thông tin level.
    - \`hm! level top\`         Hiển thị top 5 level trong server.
    \`Kinh nghiệm nhận được: \`
    Khi chat : 0.0625 exp.
    Khi tham gia VoiceChannel : 1.25 exp/1m.
    Có thể sử dụng command tắt VD : \`hm! -l -t\` = \`hm! level top\`
    `;

    embed = new RichEmbed()
        .setColor("#cc66ff")
        .setAuthor('Danh sách các lệnh level', client.user.displayAvatarURL)
        .setDescription(content);
    message.channel.send(embed);
}



/**********************************************************  MESSAGE END **********************************************************/