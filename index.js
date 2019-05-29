


Promise.concurrency = function(promiseGens,concurrency){
    let concurrencyPromises = [];
    while(concurrency--){
        concurrencyPromises.push(recur(promiseGens));
    }

    return Promise.all(concurrencyPromises);

    function recur(promiseGens){
        let first = promiseGens.shift();
        first().then(function(data){
            return finishHandle();
        }).catch(function(err){
            return allowFail ? finishHandle() : err; 
        })
    }

    function finishHandle(promiseGens){
        return promiseGens.length > 0 ? recur(promiseGens) : 'finish';
    }
}


Promise.serial = function(promiseGens){
    let seq = Promise.resolove();
    promiseGens.forEach(function(item){
        seq = seq.then(item);
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

