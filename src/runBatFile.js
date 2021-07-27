const os = require("os");
const open = require("fs/promises").open;
const { v4: uuidv4 } = require("uuid");
const shell = require("shelljs");

async function createFile(content) {
  const path = `${os.tmpdir()}\\${uuidv4()}.bat`;
  let filehandle;
  try {
    filehandle = await open(path, "w");
    await filehandle.writeFile(content);
  } finally {
    await filehandle?.close();
  }
  return path;
}

function runFile(path) {
  const { code, stderr } = shell.exec(path);
  if (code !== 0) {
    throw Error(stderr);
  }
}

module.exports = async function runBatFile(content) {
  const path = await createFile(content);
  runFile(path);
};
