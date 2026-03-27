import pino from "pino";
import readline from "readline";
import { text } from "stream/consumers";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
 const question =(text:string):Promise<string>=>{
    return new Promise((resolve)=>{
        rl.question(text, resolve)
    })
 }


 const logger = pino({
    level:'silent'
 })



 export {
    question,
    logger
 }