var fs = require('fs');
const data = require('./roomdata.json');

for (let room of data) {
    delete room.cores;
    delete room.index;
}

fs.writeFile(".roomdata_out.json", JSON.stringify(data, null, null), function (err) {
    if (err) {
        console.log(err);
    }
});
