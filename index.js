#!/usr/bin/env node
"use strict";

const os = require("os");
const tasklist = require("tasklist");
const wmic = require("wmic-js");
const shell = require("shelljs");
const open = require("fs/promises").open;

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
  const batFile = `${os.tmpdir()}\\talon_start.bat`;
  let filehandle;
  try {
    filehandle = await open(batFile, "w");
    await filehandle.writeFile(batContent);

    const { code, stderr } = shell.exec(batFile);
    if (code !== 0) {
      throw Error(stderr);
    }
  } catch (e) {
    throw Error("Can't start Talon: " + e);
  } finally {
    await filehandle?.close();
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
  }
})();
