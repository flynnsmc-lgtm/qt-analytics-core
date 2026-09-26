const fs = require('fs');
const readline = require('readline');

const filePath = 'C:/Users/44790/.antigravity-ide/extensions/googlecloudtools.datacloud-0.10.0-universal/datacloud_vscode.js';
const rl = readline.createInterface({
  input: fs.createReadStream(filePath),
  crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (lineNum >= 1024515 && lineNum <= 1024535) {
    console.log(`L${lineNum}: ${line}`);
  }
  if (lineNum > 1024535) {
    rl.close();
  }
});
