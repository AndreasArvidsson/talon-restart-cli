const process = require("process");

module.exports = function pressAnyKey() {
  console.log("Press enter key to continue");
  return new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });
};
