const axios = require("axios")
const token = "mfa.mh1pkNXigfkcxteQXI3t15b-DE1XHFU-ehIJF7TqyccEo3jgUd709pHQ_ghNFHJRrAmv03zd0Wxo5DPgiRCm";
const Discord = require("discord.js");
const Client = new Discord.Client();
const {PythonShell} = require('python-shell')
const {exec} = require("child_process")
const fs = require('fs')
Client.on('ready', () => {
    console.log("Shortener bot ready");
})
Client.on('message', async(message) => {
    if(Client.user.id != message.author.id){
        return;
    }
    const args = message.content.split(" ").slice(1);
    
    if(message.content.startsWith(";eval")){
        try {
            const code = args.join(" ").replace('\`\`\`js', '').replace('\`\`\`','')
            let evaled = await eval(`( async () => {
                ${code}
              })()`);
            
      
            if (typeof evaled !== "string")
         
              evaled = require("util").inspect(evaled);

            let original = args.join(" ")
            let output = `\`\`\`xl\n${clean(evaled)}\n\`\`\``
            await message.edit(`✍️ Input:\n${original}\n📝 Output:\n${output}`)

          } catch (err) {
            console.log(`${clean(err)}`);
          }
          
    }
    else if(message.content.startsWith(";python")){
      try {
          const code = args.join(" ").replace('\`\`\`py', '').replace('\`\`\`','')
          PythonShell.runString(code,null , async (err,output) => {
            let evaled = output.join("\n")
            
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
          let original = args.join(" ")
          let out = `\`\`\`xl\n${clean(evaled)}\n\`\`\``
          await message.edit(`✍️ Input:\n${original}\n📝 Output:\n${out}`)
          })
    

        } catch (err) {
          console.log(`${clean(err)}`);
        }
        
  }

  else if(message.content.startsWith(";gcc")){
    let options = {
      timeout: 100,
      stdio: 'inherit',
      shell: true,
  }
    try{
      let input;
      let code;
      if(args[0] == "-d"){
        args.splice(0,1)
        input = args.join(" ").replace('\`\`\`c', '').replace('\`\`\`', '')
      }
      else {
        code = args.join(" ").replace('\`\`\`c', '').replace('\`\`\`', '')
     
        input = `#include <stdio.h>\nint main(){\n${code}\nreturn 0;\n}`
      }
      await fs.writeFileSync("./gcc/compile.c", input)
      exec('gcc ./gcc/compile.c -o ./gcc/compiled', (error, stdout, stderr) => {
        exec('./gcc/compiled', options, async (error,stdout,stderr)=>{
            let original = args.join(" ")
            let out = `\`\`\`xl\n${clean(stdout)}\n\`\`\``
            await message.edit(`✍️ Input:\n${original}\n📝 Output:\n${out}`)
           
    
            if (error) {
                await message.edit(`✍️ Input:\n${original}\n ❌ Error:\n${stderr}`)

                return;
              }
        });  
    });
    
    }
    catch (err){
      console.log(`${clean(err)}`)
    }
  }
})




const clean = text => {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
  }


Client.login(token);
