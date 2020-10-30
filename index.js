const { JSDOM } = require("jsdom");
const path=require("path")
const fs=require("fs").promises

async function listAllHtm(folder){
    return Promise.all((await fs.readdir(folder)).map(async name => {
        let fullPath = path.join(folder,name);
        let stats=await fs.stat(fullPath)
        if(stats.isFile() && /.*\.htm$/.test(name)){
            return [fullPath]
        }

        if(stats.isDirectory()){
            return (await listAllHtm(fullPath))
        }
        return []
    })).then(v=>v.reduce((a,b)=>[...a,...b],[]))
}

function extractPsalms(text){
    const fonts = [
        ...new JSDOM(text).window.document.getElementsByTagName('FONT')
    ]
    let ret= fonts
    .map((fontElement,index)=>({fontElement,index}))
    .filter(({fontElement,index})=>fontElement.innerHTML.includes("Salmo "))
    .map(({fontElement,index})=>index)
    .map(index => ({
        title:fonts[index].innerHTML.split('\n').join('').split('<br>').join('').trim(),
        content:fonts[index+1].innerHTML
            .split('\n').map(s=>s.trim()).join('')
            .split('<br>').join('\n'),
    }))
    console.log(ret)
    return ret
}

async function doAllThings(){
    let htmlFiles = await listAllHtm("sync")
    let psalms = Promise.all(htmlFiles.map(async (f)=>{
        let text = await fs.readFile(f,{ encoding:'utf8'})
        return extractPsalms(text)
    })).then(v=>v.reduce((a,b)=>[...a,...b],[]))
    psalms.then(console.log)
}



doAllThings()