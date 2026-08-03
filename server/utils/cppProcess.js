import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cppProcess = null;

const CPP_HOST = process.env.CPP_HOST || "127.0.0.1";
const CPP_PORT = process.env.CPP_PORT || 18080;

const CPP_URL = `http://${CPP_HOST}:${CPP_PORT}`;

function getExecutablePath() {
    const executable =
        process.platform === "win32"
            ? "CppEngine.exe"
            : "CppEngine";

    return path.join(
        __dirname,
        "../../cpp-engine/build/bin",
        executable
    );
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startCppServer() {
    if (cppProcess) {
        return;
    }

    const executablePath = getExecutablePath();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Starting C++ Search Engine...");
    

    cppProcess = spawn(executablePath, [], {
        cwd: path.dirname(executablePath),
        windowsHide: false,
        detached: false,
        stdio: ["ignore", "pipe", "pipe"],
    });

    cppProcess.on("error", (err) => {
        console.error("Failed to start CppEngine:");
        console.error(err);
    });

    cppProcess.stdout.on("data", (data) => {
        process.stdout.write(`[CPP] ${data}`);
    });

    cppProcess.stderr.on("data", (data) => {

    const text = data.toString();

    if (text.includes("[INFO]")) {
        process.stdout.write(`[CPP] ${text}`);
    } else {
        process.stderr.write(`[CPP ERROR] ${text}`);
    }

});
    cppProcess.on("exit", (code, signal) => {

        console.log("CppEngine exited.");
        console.log("Exit Code:", code);
        console.log("Signal:", signal);

        cppProcess = null;
    });
}

export async function waitForCppServer(maxRetries = 50) {
    console.log("Waiting for C++ Engine...");

    for (let i = 0; i < maxRetries; i++) {
        try {
            await axios.get(`${CPP_URL}/`);

            console.log("✓ C++ Engine Ready");

            return;
        } catch {
            await sleep(200);
        }
    }

    throw new Error("Unable to connect to C++ Engine.");
}

export function stopCppServer() {
    if (!cppProcess) return;

    console.log("Stopping C++ Engine...");

    cppProcess.kill();

    cppProcess = null;
}