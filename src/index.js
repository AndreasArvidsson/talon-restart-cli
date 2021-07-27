#!/usr/bin/env node
"use strict";

const os = require("os");
const tasklist = require("tasklist");
const wmic = require("wmic-js");

const process = require("process");
const pressAnyKey = require("./pressAnyKey");
const runBatFile = require("./runBatFile");

if (os.platform() !== "win32") {
  throw Error("Only windows is supported");
}

async function findTalonProcess() {
  const processes = await tasklist();
  const talonProcess = processes.find((p) => p.imageName === "talon.exe");
  if (!talonProcess) {
    throw Error("Can't find Talon process");
  }
  return talonProcess;
}

async function killProcess(process) {
  // wmic process where "name="talon.exe"" delete
  try {
    await wmic().alias("process").where("name", process.imageName).delete();
  } catch (e) {
    throw Error("Can't kill Talon: " + e);
  }
}

async function startTalon() {
  const talonHome = "C:\\Program Files\\Talon";
  const batContent = `@echo off\nstart /d "${talonHome}" talon.exe`;
  try {
    await runBatFile(batContent);
  } catch (e) {
    throw Error("Can't start Talon: " + e);
  }
}

(async () => {
  try {
    const talonProcess = await findTalonProcess();
    await killProcess(talonProcess);
    await startTalon();
    console.log("Talon restarted");
  } catch (e) {
    console.error(e);
    await pressAnyKey();
    process.exit(0);
  }
})();
