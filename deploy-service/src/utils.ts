// this should be containerized with docker
import { exec, spawn } from "child_process";
import path from "path";

//project id from queue
export function buildProject(id: string) {
  // promisify await for build to finish
  return new Promise((resolve) => {
    const child = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npm run build`
    ); // this path could be a container volume

    // debugging purposes
    child.stdout?.on("data", function (data) {
      console.log("stdout: " + data);
    });
    child.stderr?.on("data", function (data) {
      console.log("stderr: " + data);
    });

    // when process exits, resolve promise
    child.on("close", function (code) {
      resolve("");
    });
  });
}
