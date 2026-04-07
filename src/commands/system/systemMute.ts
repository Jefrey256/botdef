import fs from "fs"


const path = "../../../database/json/mute.json"

function readDB(){
    return JSON.parse(fs.readFileSync(path, "utf-8"))
}


function saveDB(data: any){
    fs.writeFileSync(path, JSON.stringify(data, null, 2 ))
}

export function addMute(user: string, group: string, time: number){
    const db = readDB()
    const expires = Date.now() + time

    db.push({
        user,
        group,
        expires
    })

    saveDB(db)
}

export function removeMute(user: string, group: string) {
    let db = readDB();

    db = db.filter((m: any) => !(m.user === user && m.group === group));

    saveDB(db);
}

// Verificar mute
export function isMuted(user: string, group: string) {
    const db = readDB();

    const mute = db.find((m: any) => m.user === user && m.group === group);

    if (!mute) return false;

    // Expirou?
    if (Date.now() > mute.expires) {
        removeMute(user, group);
        return false;
    }

    return true;
}
