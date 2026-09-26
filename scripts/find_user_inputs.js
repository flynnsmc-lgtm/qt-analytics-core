const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/44790/.gemini/antigravity-ide/brain/a7ff50ab-7aca-4c5d-bb3d-f525213097fa/.system_generated/logs/transcript.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"')) {
    try {
      const obj = JSON.parse(line);
      console.log(`[Step ${obj.step_index}] ${JSON.stringify(obj.content.slice(0, 160))}`);
    } catch (e) {}
  }
});
