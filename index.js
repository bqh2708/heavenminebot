const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
const Canvas = require('canvas');



config({
    path: __dirname + "/.env"
})

// Declares our bot,
// the disableEveryone prevents the client to ping @everyone
const client = new Client({
    disableEveryone: true
});

// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "Forever !",
            type: "17ZV"
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

            ctx.font = "45px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = 'center'
            ctx.fillText(name, 335.5, 440);

            const attachment = new Attachment(canvas.toBuffer(), `ZV.png`);
            message.channel.send(attachment);
            break;

        default:
            break;


    }
});
