'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const request = require("request");
const express = require("express");
var prom, currentPromise = 0;
const app = express();
app.use(express.static(__dirname + '/frontend'));

const jsonParser = express.json();


function startWorker(path, cb) {
    let w = new Worker(path, {workerData: null});
    w.on('message', (msg) => {
        cb(null, msg)
    })
    w.on('error', cb);
    w.on('exit', (code) => {
        if(code != 0)
            console.error(new Error(`Worker stopped with exit code ${code}`))
    });
    return w;
}

app.post("/user", jsonParser, function (request, response) {
    let counter = 0;
    let result = [];
    if(!request.body) return response.sendStatus(400);
    let n = request.body.userAge;
    let files = request.body.userName.split(" ");
//    console.log(files);
    for (let i = 0; i < files.length; i++) {
        let myWorker = startWorker(__dirname + '/workerCode.js', (err, result) => {
            if(err) return console.error(err);
          //  console.log("Computation function finished");
            console.log(result.values);
            counter++;
            result += "" + result.values[2].cnt;
            if (counter == files.length) {
                console.log("End");
//                 console.log(result);
                response.send(result);
            }
        });
        myWorker.postMessage({finished: true, pth: files[i], n: n});
    }

});


app.get("/", function(request, response){
    response.sendFile(__dirname + "/frontend/index.html");
});

app.listen(3000);







/*
app.post("/user", jsonParser, function (request, response) {
    console.log(request.body.userName);
    if(!request.body) return response.sendStatus(400);
    var n = request.body.userAge;
    fs.readFile(String(request.body.userName), 'utf-8', function(err, contents) {
        var myStem = new MyStem();

//        console.log(contents);
        myStem.start();
        var words = contents.toString().split(/[(\r\n|\n|\r). ]/gm);
        var proc;
        let promises = words.map(function(word) {
            currentPromise += 1;
//            response.write(jsonString);
            return myStem.lemmatize(word)
        });
        Promise.all(promises).then(function(lemmas) {
            proc = lemmas;
            for(let i = 0; i < proc.length; i++) {
//                proc[i] += proc[i];
                if ((proc[i] == "") || (isNaN(proc[i].charCodeAt(0)))) {
                    delete proc[i];
 //                   console.log(proc);
                }
            }
            proc  = proc.filter(function (el) {
                return el != null;
            });

            let n_gram = [proc];
            let counts = [[]];
            n_gram[0].forEach(function(x) { counts[0][x] = (counts[0][x] || 0)+1; });
            for (let N = 2; N <= n; N++) {
                for (let i = 0; i < proc.length - (N - 1); i++) {
                    n_gram.push([]);

                    n_gram[N-1][i] = "";
                    for (let j = 0; j < N; j++) {
                        n_gram[N-1][i] += " " + proc[i + j];
                    }
                    console.log(n_gram[N-1][i]);
                }
                counts.push([]);
                n_gram[N-1].forEach(function(x) { counts[N-1][x] = (counts[N-1][x] || 0)+1; });
            }

            let n_gram_tree = [];
            for (let N = 0; N < n; N++) {
                for (let j = 0; j < n_gram[N].length; j++) {
                    n_gram_tree.push([]);
                    for (let i = 0; i < n_gram[N + 1].length; i++) {
//                        console.log((Object.keys(n_gram).map(key => n_gram[key]))[N+1][i]);
                        let check = (Object.keys(n_gram).map(key => n_gram[key]))[N+1][i]
                             .search((Object.keys(n_gram).map(key => n_gram[key]))[N][j]);
 //                       console.log("Search " + n_gram[N][j] + " in " + n_gram[N+1][i] + " where  target key is " +
 //                         (Object.keys(n_gram).map(key => n_gram[key]))[N][j] + " and found key is " +
//                           (Object.keys(n_gram).map(key => n_gram[key]))[N+1][i]);
                        if (check != -1) {
//                           console.log("Found " + n_gram[N+1][i]);
                            n_gram_tree[j].push([n_gram[N+1][i]]);
                        }
                    }
                }
            }
            console.log(n_gram_tree);

            let keys = Object.keys(counts);
            const values = (Object.keys(counts).map(key => counts[key]));
            let arr = [];
            for (let i = 0; i < keys.length; ++i) {
 //               console.log(values[i]);
//                console.log(keys[i]);
                let obj = {
                    word: keys[i],
                    cnt: values[i]
                };
                arr.push(obj);
            }
            arr.sort((a,b) => (a.cnt > b.cnt) ? -1 : ((b.cnt  > a.cnt) ? 1 : 0));

            let jsonArray = (JSON.parse(JSON.stringify(arr))).slice(0, parseInt(n) + 1);

//            console.log(jsonArray);
            response.send(jsonArray); // отправляем пришедший ответ обратно
            myStem.stop();
        });
    });

});
*/

/*
app.post("/user", jsonParser, function (request, response) {
    console.log(request.body.userName);
    if(!request.body) return response.sendStatus(400);
    var n = request.body.userAge;

    fs.readFile(String(request.body.userName), 'utf-8', function(err, contents) {
        var myStem = new MyStem();

 //       console.log(contents);
        myStem.start();
        var words = contents.toString().split(/[\n\r. ]/);
        var proc;

        let promises = words.map(function(word, currentPromise) {
            currentPromise += 1;
            response.write("" + currentPromise);
            return myStem.lemmatize(word)
        });
//        setInterval(() => myFunc(currentPromise), 1000);
        Promise.all(promises).then(function(lemmas) {
//            console.log(lemmas);
            proc = lemmas;
            console.log(proc);
            let counts = {};
            proc.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
            let keys = Object.keys(counts);
            const values = Object.keys(counts).map(key => counts[key]);
            let arr = [];
            for (let i = 0; i < keys.length; ++i) {
                console.log(values[i]);
                console.log(keys[i]);
                let obj = {
                    word: keys[i],
                    cnt: values[i]
                };
                arr.push(obj);
            }
            arr.sort((a,b) => (a.cnt > b.cnt) ? -1 : ((b.cnt  > a.cnt) ? 1 : 0));

            let jsonArray = (JSON.parse(JSON.stringify(arr))).slice(0, parseInt(n) + 1);
            console.log(jsonArray);
            response.write("Meow"); // отправляем пришедший ответ обратно
            response.end(0);
            myStem.stop();
        });
    });

});

*/