const {  parentPort } = require('worker_threads');
var fs = require('fs');
var MyStem = require('mystem3');
var Promise = require('bluebird');

parentPort.on('message', (msg) => {
    console.log("Limon cake!");
    fs.readFile(msg.pth, 'utf-8', function(err, contents) {
        let progress = 0;
        let total = 0;
        var myStem = new MyStem();
        myStem.start();
        var words = contents.toString().split(/[\n\r. ]/);

        let promises = words.map(function(word) {

            return myStem.lemmatize(word)
        });

        Promise.all(promises).then(function(lemmas) {
            proc = lemmas;
            let counts = {};
            proc.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
            let keys = Object.keys(counts);
            const values = Object.keys(counts).map(key => counts[key]);
            let arr = [];
            for (let i = 0; i < keys.length; ++i) {
                let obj = {
                    word: keys[i],
                    cnt: values[i]
                };
                arr.push(obj);
            }
            arr.sort((a,b) => (a.cnt > b.cnt) ? -1 : ((b.cnt  > a.cnt) ? 1 : 0));

            let jsonArray = (JSON.parse(JSON.stringify(arr))).slice(0, parseInt( msg.n) + 1);
            myStem.stop();
            parentPort.postMessage({ values: jsonArray});
        });
    });
});

