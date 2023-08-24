const path = require('path');
const fs = require('fs');
const Firestore = require('@google-cloud/firestore');

const KEYS_PATH = path.join(process.cwd(), 'keys.json');

const loadKeys = async () => {
  const content = await fs.promises.readFile(KEYS_PATH);
  const keys = JSON.parse(content);
  return keys;
};

const db = new Firestore({
  projectId: loadKeys().project_id,
  keyFilename: KEYS_PATH,
});

module.exports = {db};
