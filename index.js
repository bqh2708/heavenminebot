const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
const Canvas = require('canvas');

const translate = require('@vitalets/google-translate-api');

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

// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "17ZV",
            type: "Playing"
        }
    });

})


// Login the bot
client.login(process.env.TOKEN);

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    if (!message.member) {
        return;
    }

    const prefix = "zv!";
    const uid = message.member.id;

    // If the author's a bot, return
    // If the message was not sent in a server, return
    // If the message doesn't start with the prefix, return
    if (message.author.bot) return;
    if (!message.guild) return;

    // Arguments and command variable
    // cmd is the first word in the message, aka the command
    // args is an array of words after the command
    // !say hello I am a bot
    // cmd == say (because the prefix is sliced off)
    // args == ["hello", "I", "am", "a", "bot"]

    var roles = message.member._roles;
    var isbOT = roles.indexOf('693852491917295616') === -1 ? false : true;
    if (isbOT) {
        return;
    }

    if (message.content.toLowerCase().startsWith('-rolemenu')) {
        return;
    }

    if (!message.content.toLowerCase().startsWith(prefix)) {
        var currentLanguage;
        var maybeEnValue, maybeViValue;
        console.info(message);

        if (message.content === '') {
            return;
        }

        translate(message.content, { to: 'en' }).then(res => {
            currentLanguage = res.from.language.iso;

            maybeEnValue = currentLanguage !== 'en' ? `English : ${res.text}

            ` : '';

            translate(message.content, { to: 'vi' }).then(res => {
                maybeViValue = currentLanguage !== 'vi' ? `Vietnamese : ${res.text}

                ` : '';

                var content = `${message.content}
                --------------------------------------------------
                ${maybeEnValue}${maybeViValue}`;

                embed = new RichEmbed()
                    .setColor("#cc66ff")
                    .setAuthor(`ZV Translate`, client.user.displayAvatarURL)
                    .setDescription(content);
                message.channel.send(embed);

            }).catch(err => {
                viValue = 'error';
            });

        }).catch(err => {
            enValue = 'error'
        });
        return;
    };

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = (args.shift()).toLowerCase();


    switch (cmd) {

        case 'logo':
            var name = '';
            if (args.length > 0) {
                name = args.join(' ');
            }

            const canvas = Canvas.createCanvas(671, 671);
            const ctx = canvas.getContext('2d');
            const background = await Canvas.loadImage('./ZV.png');
            ctx.drawImage(background, 0, 0, 671, 671);

            ctx.font = "61px Bahnschrift";
            ctx.fillStyle = "white";
            ctx.textAlign = 'center'
            ctx.fillText(name, 335.5, 450);

            const attachment = new Attachment(canvas.toBuffer(), `ZV.png`);
            message.channel.send(attachment);
            break;

        case 'aoo':
            // switch (args[0].toUpperCase()) {
            //     case '17ZV':
            //         getMemberAOO(message, '17ZV', '722342492522938369');
            //         break;

            //     case '17FV':
            //         getMemberAOO(message, '17FV', '722248375986028658');
            //         break;

            //     case 'QZ7':
            //         getMemberAOO(message, 'QZ_7', '722248654823489597');
            //         break;

            //     case 'QZ8':
            //         getMemberAOO(message, 'QZ_8', '722255625572057179');
            //         break;
            // }
            break;

        default:
            break;


    }
});


function getMemberAOO(message, alliName, id) {
    var nickname;
    var arrMember = client.guilds.get(
        '693830119676051477').members.filter(member => member._roles.indexOf(id) > -1);
    var content = '';
    for (const item of arrMember) {
        nickname = arrMember.get(item[0]).nickname;
        if (nickname === null) {
            nickname = arrMember.get(item[0]).user.username;
            content += `
            ${nickname}`
        }
    }

    embed = new RichEmbed()
        .setColor("#cc66ff")
        .setAuthor(` List of participants in AOO in ${alliName}`, client.user.displayAvatarURL)
        .setDescription(content);
    message.channel.send(embed);
};