const db = new PouchDB('pan');
let addPan = async (pan) => {
    let result = false;
    try {
        pan['_id'] = pan['surl']
        console.log(pan['_id'])
        let doc = await db.get(pan['_id']);
        pan['_rev']=doc._rev;
        result = await db.put(pan);
    } catch (e) {
        console.log('add pan error: ',err);
    }
    return result;
}


let getPanCode = async (surl) => {
    let result = false
    try {
        result = await db.get(surl)['code']
    } catch (e) {
        console.log('get pancode error: ', e)
    }

    return result
}

let getPans = async (limit = 5) => {
    let items = (await db.allDocs({include_docs: true, descending: true, limit: limit})).rows.map(row => row['doc'])
    for (let item of items) {
        for (let k of Object.keys(item)) {
            if (k.startsWith('_')) {
                delete item[k]
            }
        }
    }
    return items
}

let getAllPansCount = async () => {
    return (await db.allDocs()).total_rows

}