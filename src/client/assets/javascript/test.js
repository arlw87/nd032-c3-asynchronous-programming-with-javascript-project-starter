
function f1() {
    return new Promise((resolve, reject) => {
        reject('a bug')
    }).catch((err) => console.log('error'));
}

async function start() {
    console.log('Pos 1');
    const res = await f1();
    console.log(res);
    console.log('Pos 2');
}

start();