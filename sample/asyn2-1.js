var fs = require('fs');

console.log('첫번째 기능입니다.');
var data = 'none';
fs.readFile('example/test.txt', 'utf8', function (err, result) {
    if (err) {
        console.error(err);
        throw err;
    }
    else {
        data = result;
        console.error("두번째 기능인데 파일을 읽어오느라 시간이... 조금... 걸려요");
        console.log(data);
    }
});
console.log('마지막 기능입니다.');


//파일을 읽어오는데 시간이 많이 걸리기 때문에 파일내용이 제일 마지막에 출력된다.
