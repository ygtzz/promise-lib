
Promise.serial = function(promiseGens,allowFail){
    let seq = Promise.resolve();
    promiseGens.forEach(function(item){
        seq = allowFail ? seq.then(item).catch(err => err) : seq.then(item);
    });

    return seq;
}

//单个promise reject后，继续执行
Promise.parallel = function(promiseGens){
    let allPromise = new Promise(function(resolve,reject){
        let results = [];
        promiseGens.forEach(function(item){
            item()
            .then(data => results.push(data))
            .catch(err => results.push(err))
            .finally(function(){
                if(results.length == promiseGens.length){
                    resolve(results);
                }
            })
        });
    });

    return allPromise;
}

Promise.concurrency = function(promiseGens,concurrency,allowFail){
    let promiseGenCopys = [].concat(promiseGens);
    let concurrencyPromises = [];
    let res = [];
    while(concurrency--){
        concurrencyPromises.push(recur(promiseGenCopys));
    }
    
    return Promise.all(concurrencyPromises).then(_ => res);

    // return Promise.parallel(concurrencyPromises);

    function recur(promiseGens){
        if(!promiseGens.length) return Promise.resolve();

        let first = promiseGens.shift();
        return first().then(function(data){
            res.push(data);
            return recur(promiseGens);
        }).catch(function(err){
            res.push(err);
            return allowFail ? recur(promiseGens) : err; 
        })
    }
}