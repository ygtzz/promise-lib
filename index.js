
Promise.serial = function(promiseGens,allowFail){
    let seq = Promise.resolve();
    promiseGens.forEach(function(item){
        seq = allowFail ? seq.then(item).catch(function(err){
            return err;
        }) : seq.then(item);
    });

    return seq;
}

//单个promise reject后，继续执行
Promise.parallel = function(promiseGens){
    let allPromise = new Promise(function(resolve,reject){
        let results = [];
        promiseGens.forEach(function(item){
            item().then(function(data){
                results.push(data);
            })
            .catch(function(err){
                results.push(err);
            })
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
    while(concurrency--){
        concurrencyPromises.push(recur(promiseGenCopys));
    }

    return Promise.all(concurrencyPromises);

    // return Promise.parallel(concurrencyPromises);

    function recur(promiseGens){
        let first = promiseGens.shift();
        return first().then(function(data){
            return finishHandle(promiseGens);
        }).catch(function(err){
            return allowFail ? finishHandle(promiseGens) : err; 
        })
    }

    function finishHandle(promiseGens){
        return promiseGens.length > 0 ? recur(promiseGens) : 'finish';
    }
}