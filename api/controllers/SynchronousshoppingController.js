/**
 * SynchronousshoppingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
//Functions to process a request modified by David Jm, original code by https://www.hackerrank.com/rest/contests/master/challenges/synchronous-shopping/hackers/hedgemeister/download_solution
var _=require('underscore');

function newMap(N, K) {
    var map = {cities: N, K: K, roads: [], roads2: [], fishes: [], states: [], allFishes: 0};
    for (var i = 0; i<N*N; ++i) {
        map.roads[i] = null;
    }
    for (var j = 0; j<N; ++j) {
        map.fishes[j] = [];
        map.states[j] = [];
        map.roads2[j] = [];
    }
    map.allFishes = allFishes(map);
    return map;
}

function fishArrayToInt(fishArray) {
    var ret = 0;
    _.each(fishArray, function(elem) { ret = ret | (1 << (elem - 1)); });
    return ret;
}

function allFishes(map) {
    return fishArrayToInt(_.range(1,map.K+1));
}

function setMap(map, x, y, val) {
    x--;
    y--;
    map.roads[x*map.cities+y] = val;
    map.roads[y*map.cities+x] = val;
}

function finalizeMap(map) {
    for (var i=0; i<map.cities; ++i) {
        var ret = [];
        _.each(map.roads.slice(i*map.cities, (i+1)*map.cities),
            function(elem, index) {
                if (elem != null) ret.push({city: index, time: elem});
            }
        );
        map.roads2[i] = ret;
    }
}

function newState(fishes0, city, map, time) {
    return {
        fishes: map.fishes[city] | fishes0,
        time: time,
    };
}

function moves(map, from) {
    return map.roads2[from];
}

function isSuperset(superset, subset) {
    return ((~superset) & subset) == 0;
}

function executeMove(map, queue, state0, to, time) {
    if (!state0)
        return false;
    var state1 = newState(state0.fishes, to, map, time+state0.time);
    var states = map.states[to];
    // If there is already a state with all my fish or more, but quicker, return.
    if (_.some(states, function(existingState) {
            return existingState != null &&
                existingState.time < state1.time &&
                isSuperset(existingState.fishes, state1.fishes);
        })) {
        return false;
    }
    // Eliminate all states that cost more than this one, but don't get any more fish.
    // Keep the states that get you more fish.  Keep the states with time less than this one.
    map.states[to] = _.filter(states, function(existingState) {
        return existingState != null && (
            state1.time > existingState.time ||
            !isSuperset(state1.fishes, existingState.fishes)
        );
    });
    // Add this new state to the queue, and to the states.
    queue.Enqueue(to, state1.fishes, state1.time);
    map.states[to].push(state1);
    return true;
}

function findBestPair(map) {
    var end = map.states[map.cities-1];
    var minTime = Number.MAX_SAFE_INTEGER;
    for (var i=0; i<end.length; ++i) {
        for (var j=0; j<end.length; ++j) {
            if ((end[i].fishes | end[j].fishes) == map.allFishes) {
                var newTime = (end[i].time > end[j].time) ? end[i].time : end[j].time;
                if (minTime > newTime) {
                    minTime = newTime;
                }
            }
        }
    }
    if (minTime == Number.MAX_SAFE_INTEGER) {
        return null;
    }
    return minTime;
}

function earlyExit(map, queue) {
    var minQueueTime = queue.Top().time;
    var minFinishTime = findBestPair(map);
    if (minFinishTime == null) {
        return null;
    }
    if (minFinishTime < minQueueTime) {
        return minFinishTime;
    }
    return null;
}

// Find the state in the map given the city and fishes.
// Returns the least expensive state that satisfies all the fishes.
function findStateInMap(map, city, fishes) {
    var statesWithFishes = _.filter(map.states[city], function(state) {
        return isSuperset(state.fishes, fishes);
    });
    if (statesWithFishes.length == 0) {
        return null;
    }
    return _.min(statesWithFishes, function(state) {return state.time;});
}

function InitQueue() {
    var queue = {
        arr: [{city: 0, fishes: 0, time: 0}],
    };
    queue.Empty = function() {
        return queue.arr.length == 0;
    }
    var _swap = function(index1, index2) {
        var tmp = queue.arr[index1];
        queue.arr[index1] = queue.arr[index2];
        queue.arr[index2] = tmp;
    }
    queue.Enqueue = function(city, fishes, time) {
        // Add element to the end.
        queue.arr.push({city: city, fishes: fishes, time: time});
        // Heapify up.
        var index = queue.arr.length-1;
        while (index > 0) {
            var indexAbove = ((index+1) >> 1) - 1;
            if (queue.arr[indexAbove].time > queue.arr[index].time) {
                _swap(indexAbove, index);
            } else {
                return;
            }
            index = indexAbove;
        }
    }
    queue.Dequeue = function() {
        var toRet = queue.arr[0];
        queue.arr[0] = queue.arr[queue.arr.length-1];
        delete queue.arr[queue.arr.length-1];
        queue.arr.length--;
        // Heapify down.
        var index = 0;
        while (((index+1) << 1) - 1 < queue.arr.length) {
            var index2 = ((index+1) << 1) - 1;
            if (index2+1 < queue.arr.length && queue.arr[index2].time > queue.arr[index2+1].time) {
                index2 = index2 + 1;
            }
            if (queue.arr[index].time > queue.arr[index2].time) {
                _swap(index, index2);
            }
            index = index2;
        }
        return toRet;
    }
    var _verify = function() {  // Returns the index of the first violation of heapify, or null
        var index = queue.arr.length-1;
        while (index > 0) {
            var indexAbove = ((index+1) >> 1) - 1;
            if (queue.arr[indexAbove].time > queue.arr[index].time) {
                return index;
            }
            index--;
        }
        return null;
    }
    queue.Sort = function() {
        //queue.arr = _.sortBy(queue.arr, 'time');
        var verifyResult = null;//_verify();
        if (verifyResult != null) {
            console.log(verifyResult);
            console.log(queue.arr);
        }
    }
    queue.Top = function() {
        return queue.arr[0];
    }
    return queue;
}

function eval(map) {
    var state = newState(0, 0, map, 0);
    map.states[0].push(state);
    var queue = InitQueue();
    var i = 0;
    while(!queue.Empty()) {
        //console.log("Step ", i, "Queue size", queue.length);
        queue.Sort();
        //console.log("Step ",i);
        //printQueue(queue);
        //printStates(map);
        var qi = queue.Dequeue();
        var state0 = findStateInMap(map, qi.city, qi.fishes);
        if (state0.time < qi.time) {
            // We have already been here.
            continue;
        }
        var mvs = moves(map, qi.city);
        var checkEarlyExit = false;
        _.each(mvs, function(move) {
            if (executeMove(map, queue, state0, move.city, move.time) && move.city==map.cities-1){
                checkEarlyExit = true;
            };
        });
        ++i;
        if (checkEarlyExit) {
            var earlyExitSolution = earlyExit(map, queue);
            if (earlyExitSolution != null) {
                return earlyExitSolution;
            }
        }
    }
    //printEndStates(map);
    var bestPair = findBestPair(map);
    if (bestPair == null) {
        printEndStates(map);
    }
    return bestPair;
}

// === Printing

function getRoadMapCell(road) {
    // print 8 characters for road.
    if (road==null) {
        return " null   ";
    }
    var ret = " "+road;
    while (ret.length < 8) {
        ret = ret+' ';
    }
    return ret;
}

function printRoadMap(map) {
    console.log("Road Map:");
    for (var i=0; i<map.cities; ++i) {
        var line = map.roads.slice(i*map.cities, (i+1)*map.cities);
        console.log(_.map(line, getRoadMapCell).join(''));
    }
}

function printStates(map) {
    console.log("States: ");
    _.each(map.states, function(stateArray, city) {
        if (stateArray.length==0) {
            return;
        }
        console.log("City: ", city);
        _.each(stateArray, function(state) {console.log("   = { fishes: "+state.fishes.toString(2)+", time: "+state.time+" }");});
    });
}

function printEndStates(map) {
    var toPrint = map.states[map.cities-1];
    _.each(toPrint, function(item) {
        console.log("Fishes: ", item.fishes.toString(2));
        console.log("Time: ", item.time);
    });
}

function printMap(map) {
    console.log("Map: ");
    console.log(" Cities: ", map.cities);
    console.log(" K:", map.K);
    console.log(" Fishes:", _.map(map.fishes, function(elem) {return elem.toString(2);}));
    console.log(" All fishes: ", map.allFishes.toString(2));
    printRoadMap(map);
    printStates(map);
}

function printQueue(queue) {
    console.log("Queue:");
    _.each(queue, function(elem, index) {console.log("* ",index,
        elem
        //"{ city: "+elem.city+ ", fishes: "+elem.fishes.toString(2)+" }"
    );});
}

// === End Printing

function processData(input) {
    var lines = input.split('\n');
    var nmk = lines[0].split(' ');
    var N = parseInt(nmk[0]), M = parseInt(nmk[1]), K = parseInt(nmk[2]);
    var map = newMap(N, K);
    var line = 1;
    for (var i = 0; i<N; ++i) {
        var linearr = lines[line].split(' ');
        var numFishes = parseInt(linearr[0]);
        linearr = linearr.slice(1);
        map.fishes[i] = fishArrayToInt(_.map(linearr, function(elem) {return parseInt(elem);}));
        ++line;
    }
    for (var j=0; j<M; ++j) {
        var linearr2 = lines[line].split(' ');
        var x = parseInt(linearr2[0]), y = parseInt(linearr2[1]), time = parseInt(linearr2[2]);
        setMap(map, x, y, time);
        ++line;
    }
    finalizeMap(map);

    return eval(map);
}

module.exports = {
    /**
    * Function to save data and resulst in database.
    */
    process: async function(request, response){
        request.setEncoding('ascii');
        //Bad Request
        if ( !_.isString( request.param('parameters') ) && !_.isString( request.param('shoping_centers') ) && !_.isString( request.param('roads') ) ) {
            return response.badRequest('Validate your input');
        }
        //
        var input = '';
        var scI = '';
        var roI = '';
        //Process data to input format
        var para = request.query.parameters.replace(/[,]/g, " ");
        var sc = request.query.shoping_centers.replace(/[,]/g, " ");
        var ro = request.query.roads.replace(/[,]/g, " ");
        var sc2 = sc.replace(/[-]/g, " ");
        var ro2 = ro.replace(/[-]/g, " ");
        //Shopping centers
        scI = sc2.split(/((?:\w+ ){2})/g).filter(Boolean).join("\n");
        //Roads
        roI = ro2.split(/((?:\w+ ){3})/g).filter(Boolean).join("\n");
        //Added data to input
        input += para+'\n';
        input += scI+'\n';
        input += roI;
        var res = processData(input);
        //Use model and create a record
        await Synchronousshopping.create({parameters:request.query.parameters, shoping_centers:request.query.shoping_centers, roads:request.query.roads, result: res})
        .intercept((err)=>{
            // Return a modified error here (or a special exit signal)
            // and .create() will throw that instead
            return response.send({
                'succes':false,
                'minimum_time':'error'+err  
            })
        });        
        //Return response
        return response.send({
            'succes':true,
            'minimum_time':res
        })
          
    }
};

