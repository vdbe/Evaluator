
const Discord = require("discord.js");
const Client = new Discord.Client({intents: ["GUILDS","GUILD_MESSAGES"]});
const {PythonShell} = require('python-shell')
const {exec} = require("child_process")
const fs = require('fs')
const dotenv = require('dotenv')
const tmp = require('tmp')
dotenv.config()
Client.on('ready', () => {
    console.log("Evalutor bot ready");
})

const commands = {
  "execute": [`${process.env.PREFIX}execute`, `${process.env.PREFIX}eval`, `${process.env.PREFIX}e`]
}

let options = {
  timeout: 100,
  stdio: 'inherit',
  shell: true,
  //uid: 8877
}


Client.on('messageCreate', async(message) => {
    const args = message.content.split(" ").slice(1);
    const command = message.content.split(" ")[0]
    


    if(commands.execute.includes(command)){
      let language = args[0].split("\n")[0].replace('\`\`\`', '')
      let code;
      switch(language){
        case "js":
            code = args.join(" ").replace('\`\`\`js', '').replace('\`\`\`', '')
        case "javascript":
           
            if(!code) code = args.join(" ").replace('\`\`\`javascript', '').replace('\`\`\`', '')

            
          try{
            let tmpfile = tmp.fileSync({postfix:".js"})

            await fs.writeFileSync(tmpfile.name, code)
            exec(`node ${tmpfile.name}`, options, async (error,stdout,stderr)=>{
                  let original = args.join(" ")
                  let out = `\`\`\`xl\n${stdout}\n\`\`\``
                 
                    message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n${out}`).catch(async () => {
                      let tmpout = tmp.fileSync({postfix:".txt"})
                      await fs.writeFileSync(tmpout.name, stdout)
                      message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n`)
                      await message.channel.send({files: [{attachment:tmpout.name}]})
                      tmpout.removeCallback();
                    })
                    tmpfile.removeCallback();
              }); 
            
          
          }
          catch (err){
            console.log(`${err}`)
          }
          break;
        case "py":
            code = args.join(" ").replace('\`\`\`py', '').replace('\`\`\`', '')
        case "python":
          try{
            
            if(!code) code = args.join(" ").replace('\`\`\`python', '').replace('\`\`\`', '')

              
            
            
            let tmpfile = tmp.fileSync({postfix:".py"})
            await fs.writeFileSync(tmpfile.name, code)
              exec(`python3 ${tmpfile.name}`, options, async (error,stdout,stderr)=>{
                  let original = args.join(" ")
                  let out = `\`\`\`xl\n${stdout}\n\`\`\``
                 
                    message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n${out}`).catch(async () => {
                      let tmpout = tmp.fileSync({postfix:".txt"})

                      await fs.writeFileSync(tmpout.name, stdout)
                      message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n`)
                      message.channel.send({files: [{attachment:tmpout.name}]})
                      tmpout.removeCallback()
                    })
                    tmpfile.removeCallback()
              });  
          
          }
          catch (err){
            console.log(`${err}`)
          }
          break;      
        case "c":
          
          try{
              code = args.join(" ").replace('\`\`\`c', '').replace('\`\`\`', '')
           
              input = `#include <stdio.h>\nint main(){\n${code}\nreturn 0;\n}`
            let tmpfile = tmp.fileSync({postfix:".c"})
            let compiledtmp = tmp.fileSync({mode:0777, discardDescriptor: true})
          
            await fs.writeFileSync(tmpfile.name, input)
            exec(`gcc ${tmpfile.name} -o ${compiledtmp.name}`, (error, stdout, stderr) => {
              if(stderr){
                let err = `\`\`\`xl\n${stderr}\n\`\`\``
                let original = args.join(" ")

                message.channel.send(`✍️ Input:\n${original}\n❌ Error:\n${err}`)
                return;
              }
              exec(compiledtmp.name, options, async (error,stdout,stderr)=>{
                if(error)
                {
                  console.log(error)
                }
                  let original = args.join(" ")
                  let out = `\`\`\`xl\n${stdout}\n\`\`\``
                 
                  message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n${out}`).catch(async () => {
                     let tmpout = tmp.fileSync({postfix:".txt"})
                      await fs.writeFileSync(tmpout.name, stdout)
                      message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n`)
                      await message.channel.send({files: [{attachment:tmpout.name}]})
                      tmpout.removeCallback()
                    })
                    tmpfile.removeCallback()
                    compiledtmp.removeCallback()
              });
              
              
            });
            
 
             

          
          }
          catch (err){
            console.log(`${err}`)
          }
          break;
        case "cpp":
          code = args.join(" ").replace('\`\`\`cpp', '').replace('\`\`\`', '')
        case "c++":
          if(!code) code = args.join(" ").replace('\`\`\`c++', '').replace('\`\`\`', '')

          try{
            let input;
            
           
            input = `#include <iostream>\nint main(){\n${code}\nreturn 0;\n}`
            let tmpfile = tmp.fileSync({postfix:".cpp"})
            let compiledtmp = tmp.fileSync({mode:0777, discardDescriptor: true})
            await fs.writeFileSync(tmpfile.name, input)
            exec(`g++ ${tmpfile.name} -o ${compiledtmp.name}`, (error, stdout, stderr) => {
              if(stderr){
                let err = `\`\`\`xl\n${stderr}\n\`\`\``
                let original = args.join(" ")

                message.channel.send(`✍️ Input:\n${original}\n❌ Error:\n${err}`)
                return;
              }
              exec(compiledtmp.name, options, async (error,stdout,stderr)=>{
                  let original = args.join(" ")
                  let out = `\`\`\`xl\n${stdout}\`\`\``                 
                  message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n${out}`).catch(async () => {
                      let tmpout = tmp.fileSync({postfix:".txt"})
                      await fs.writeFileSync(tmpout.name, stdout)
                      message.channel.send(`✍️ Input:\n${original}\n📝 Output:\n`)
                      message.channel.send({files: [{attachment:tmpout.name}]})
                      tmpout.removeCallback()
                    })
                  tmpfile.removeCallback()
                  compiledtmp.removeCallback()
              });  

          });
          
          }
          catch (err){
            console.log(`${err}`)
          }
          break;
        default:
          message.channel.send("This language is not supported or you did not provide a language!")
          break;
      }
    }
})



Client.login(process.env.TOKEN);
