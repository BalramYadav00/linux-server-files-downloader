const Koa = require("koa");
const Router = require("koa-router");
const Client = require("ssh2-sftp-client");
const { Readable } = require("node:stream");

const app = new Koa();
const router = new Router();

class SFTPService {
    constructor(config) {
        this.config = config;
        this.client = new Client();
    }

    async downloadFile(path) {
        try {
            await this.client.connect({
                host: this.config.sftp.host,
                port: this.config.sftp.port || 22,
                username: this.config.sftp.username,
                password: this.config.sftp.password,
            });

            const sftpStream = await this.client.get(path);
            return sftpStream;
        } catch (error) {
            throw new Error(`Error downloading file: ${error.message}`);
        } finally {
            await this.client.end();
        }
    }

    async listDirectory(path) {
        try {
            await this.client.connect({
                host: this.config.sftp.host,
                port: this.config.sftp.port || 22,
                username: this.config.sftp.username,
                password: this.config.sftp.password,
            });

            const directoryListing = await this.client.list(path);
            return directoryListing;
        } catch (error) {
            throw new Error(`Error listing directory: ${error.message}`);
        } finally {
            await this.client.end();
        }
    }
}

router.get("/download", async (ctx) => {
    try {
        const sftpService = new SFTPService({
            sftp: {
                host: "64.227.169.22",
                port: 22,
                username: "root",
                password: "#qb,6W,WeSt#/dg", // Replace with your actual password
            },
        });

        const sftpFileStream = await sftpService.downloadFile(
            "/root/AwesomeProject/android/app/build/outputs/apk/release/app-release.apk"
        );

        // Set the response headers
        ctx.response.set({
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=app.apk",
        });

        // Stream the file to the response
        ctx.body = sftpFileStream;
    } catch (error) {
        console.error("Error downloading file:", error.message);
        ctx.status = 500;
        ctx.body = "Internal Server Error";
    }
});

router.get("/list", async (ctx) => {
    try {
        const sftpService = new SFTPService({
            sftp: {
                host: "64.227.169.22",
                port: 22,
                username: "root",
                password: "#qb,6W,WeSt#/dg", // Replace with your actual password
            },
        });

        const directoryListing = await sftpService.listDirectory("/root");
        ctx.body = directoryListing;
    } catch (error) {
        console.error("Error listing directory:", error.message);
        ctx.status = 500;
        ctx.body = "Internal Server Error";
    }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 8080; // Replace with your desired port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
