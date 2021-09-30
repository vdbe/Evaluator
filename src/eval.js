const Discord = require("discord.js");
const Client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const { MessageEmbed } = require('discord.js');
const { exec } = require("child_process")
const fs = require('fs')
const dotenv = require('dotenv')
const tmp = require('tmp');
const puppeteer = require('puppeteer');
const Brainfuck = require("./brainfuck")

dotenv.config()
const langregex = /`{3}.*\n/

Client.on('ready', () => {
  console.log('\x1b[32m%s\x1b[0m', 'Evaluator bot ready!');
})

const commands = {
  "execute": [`${process.env.PREFIX}execute`, `${process.env.PREFIX}eval`, `${process.env.PREFIX}e`],
  "executefull": [`${process.env.PREFIX}executefull`, `${process.env.PREFIX}efull`, `${process.env.PREFIX}ef`],
  "help": [`${process.env.PREFIX}help`, `${process.env.PREFIX}h`],
  "brainfuck": [`${process.env.PREFIX}brainfuck`, `${process.env.PREFIX}bf`]
}

let options = {
  timeout: 100,
  stdio: 'inherit',
  shell: true,
  uid: 8877,
  gid: 8877
}

let langs = {
  javascript: {
    type: "interpreter",
    command: "node",
    postfix: ".js",
    name: "Javascript",
    template: "{CODE}"
  },
  python: {
    type: "interpreter",
    command: "python3",
    postfix: ".py",
    name: "Python",
    template: "{CODE}"
  },
  php: {
    type: "interpreter",
    command: "php",
    postfix: ".php",
    name: "PHP",
    template: "<?php\n{CODE}\n?>",
    callback(command, message, output) {
      if (commands.executefull.includes(command))
        sendScreenshotHTML(message, output);
    }
  },
  c: {
    type: "compiler",
    command: "gcc",
    postfix: ".c",
    name: "C",
    template: "#include <stdio.h>\nint main(){\n{CODE}\nreturn 0;\n}"
  },
  cpp: {
    type: "compiler",
    command: "g++",
    postfix: ".cpp",
    name: "Cpp",
    template: "#include <iostream>\nint main(){\n{CODE}\nreturn 0;\n}"
  },
  rust: {
    type: "compiler",
    command: "rustc",
    postfix: ".rs",
    name: "Rust",
    template: "fn main(){\n{CODE}}"
  }
}

let shortenedlangs = {
  js: langs.javascript,
  py: langs.python,
  "c++": langs.cpp,
  rs: langs.rust
}

Client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) return;
  const args = message.content.split(" ").slice(1);
  const command = message.content.split(" ")[0]


  if (commands.help.includes(command)) {
    sendHelp(message)
  } else {
    if (args.length < 1) return;

    if (args[0][0] == "\n") {
      args[0] = args[0].slice(1)
    }
    let language = args[0].split("\n")[0].replace('\`\`\`', '') // This causes a \n to not work right after command.
    let code = args.join(" ").replace(langregex, '').replace(/`{3}/, '')
    let langobject = langs[language] || shortenedlangs[language]

    if (commands.execute.includes(command) || commands.executefull.includes(command)) {

      let tmpfile = tmp.fileSync({
        postfix: langobject.postfix,
        mode: 0777
      })
      let input;
      if (commands.execute.includes(command)) input = langobject.template.replace("{CODE}", code);
      else input = code
      await fs.writeFileSync(tmpfile.name, input)
    

      switch (langobject.type) {
        case "interpreter":
          try {
            exec(`${langobject.command} ${tmpfile.name}`, options, async (error, stdout, stderr) => {
              let original = args.join(" ")
              sendResult(message, true, langobject.name, original, stdout)
              if (langobject.callback)
                langobject.callback(command, message, stdout)
              
              tmpfile.removeCallback();
            });
          } catch (err) {
            console.log(`${err}`)
          }
          break;
        case "compiler":
          try {

            let compiledtmp = tmp.fileSync({
              mode: 0777,
              discardDescriptor: true
            })
            exec(`${langobject.command} ${tmpfile.name} -o ${compiledtmp.name}`, (error, stdout, stderr) => {
              if (stderr) {
                let original = args.join(" ")
                sendResult(message, false, langobject.name, original, stderr)
                tmpfile.removeCallback()
                compiledtmp.removeCallback()
                return;
              }
              exec(compiledtmp.name, options, async (error, stdout, stderr) => {
                if (error) {
                  console.log(error)
                }
                let original = args.join(" ")
                sendResult(message, true, langobject.name, original, stdout)
                tmpfile.removeCallback()
                compiledtmp.removeCallback()
              });
            });
          } catch (err) {
            console.log(`${err}`)
          }
          break;
        default:
          sendUnsupported(message)
          break;
      }
    }
    else if(commands.brainfuck.includes(command)){
      let bf = new Brainfuck()
      try{
        let result = bf.evaluate(code)
        sendResult(message, true, "Brainfuck", args.join(" "), result)
      }
      catch(error){
        sendBrainFuckError(message,error)
      }
    }

  }
})

async function sendResult(msg, isSucces, lang, input, output) {
  // const inputDescription = `**✍️ Input code in ${lang}:**\n${input}\n`
  const inputDescription = `**✍️ Input code in ${lang}.\n` // less spam.
  let description =  inputDescription +
    `${isSucces ? '**📝 Output:**' : '**❌ Error**'}
\`\`\`
${output || 'No output from execution'}
\`\`\``

  const embed = new MessageEmbed()
    .setTitle('Evaluation')
    .setDescription(description)
    .setColor(isSucces ? '#3BA55D' : '#ED4245')

  msg.channel.send({
    embeds: [embed]
  }).catch(async () => {
    let tmpOut = tmp.fileSync({
      postfix: ".txt"
    })
    await fs.writeFileSync(tmpOut.name, output)
    msg.channel.send({
        embeds: [embed.setDescription(inputDescription + `📝 Output file:\n`)]
      })
      .then(() => msg.channel.send({
        files: [{
          attachment: tmpOut.name,
        }]
      }))
      .catch((err) => console.error('Message or attachment failed sending: ' + err))
      .finally(() => tmpOut.removeCallback())
  })
}

async function sendUnsupported(msg) {
  const embed = new MessageEmbed()
    .setTitle('Language not supported or missing')
    .setDescription('Use a codeblock with language of your choosing and code within, example:\n' +
      '\\\`\\\`\\\`cpp\nstd::cout << "hello world!";\n\\\`\\\`\\\`\n' +
      '\`\`\`cpp\nstd::cout << "hello world!";\`\`\`')
    .addField('Supported languages', 'Javascript, Python, c, c++ and rust.\n' +
      'js, py, c, c++/cpp and rs.')
    .setColor('#FAA61A')
  msg.channel.send({
    embeds: [embed]
  });
}

async function sendBrainFuckError(msg, error) {
  let title = error.message;
  let description;
  switch(error.message){
    case "Pointer too big":
      description = "You are trying to push the pointer past the limit of 1000 characters!"
      break;
    case "Negative pointer":
      description = "You can't lower the pointer below 0!"
      break;
    case "ASCII value too high":
      description = "The highest possible ASCII value is 127, don't go over it!"
      break;
    case "ASCII value too low":
      description = "There is no ASCII character with a value less than 0!"
      break;
  }
  const embed = new MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('#FAA61A')
  msg.channel.send({
    embeds: [embed]
  });
}

async function sendHelp(msg) {
  const embed = new MessageEmbed()
    .setTitle("How do I use the bot?")
    .setDescription('Use a codeblock with language of your choosing and code within, example:\n' +
      '\\\`\\\`\\\`cpp\nstd::cout << "hello world!";\n\\\`\\\`\\\`\n' +
      '\`\`\`cpp\nstd::cout << "hello world!";\`\`\`')
    .addField('Supported languages', 'Javascript, Python, PHP, c, c++ and rust.\n' +
      'js, py, php, c, c++/cpp and rs.')
    .addField("Warning!", "Abuse of the system and intentionally breaking it will result in a blacklist")
    .setFooter("Collaborators: Dodo#1948 | Toast#1042 | 0xCF80#5359")
    .setColor('#FAA61A')
  msg.channel.send({
    embeds: [embed]
  });
}

async function sendScreenshotHTML(message, content) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--use-gl=egl', '--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 2,
  });
  await page.setContent(content);
  let image = await page.screenshot();
  message.channel.send({files: [image]})
  await browser.close();
};

Client.login(process.env.TOKEN);