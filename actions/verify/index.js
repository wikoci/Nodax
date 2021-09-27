require("dotenv").config();
const localIpAddress = require("local-ip-address");
const consola = require("consola");
const colors = require("colors");
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cleanDeep = require("clean-deep");

const config_ = {
  connectionTimeout: 5200,
  localAddress: localIpAddress(),
  host: process.env.SMTP_HOST || null,
  port: Number(process.env.SMTP_PORT) || null,
  secure: Boolean(process.env.SMTP_SECURE) || null,
  tls: Boolean(process.env.SMTP_TLS) || null,
  proxy: process.env.SMTP_PROXY || null,
  auth: {
    type: process.env.SMTP_AUTH_TYPE || null,
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
  },
};

var config = cleanDeep(config_);

if (process.env.SMTP_SERVICE) {
  config = {
    service: process.env.SMTP_SERVICE,
    auth: {
      type: process.env.SMTP_AUTH_TYPE || null,
      user: process.env.SMTP_USER || null,
      pass: process.env.SMTP_PASS || null,
    },
    proxy: process.env.SMTP_PROXY || null,
  };

  config = cleanDeep(config);
}

console.log("Config : ", config);

const transporter = nodemailer.createTransport(config);
transporter.set("proxy_socks_module", require("socks"));

async function main() {
  console.log("\nWaiting to connect ....");

  await transporter
    .verify()
    .then((e) => {
      console.log("\n");
      consola.success(
        "SMTP AUTH SUCCESSFULLY , You are ready to send :)  ".green
      );
    })
    .catch((err) => {
      consola.error(err + "".green);
    });

  console.log("\nAction done ....\n");
  process.exit(1);
}

app.listen(process.env.PORT, () => {
  console.log("\n");
  console.log(
    `##### SMTP TEST IS RUNNIG  | IP : ${localIpAddress()} ####### `.blue
  );
  console.log("\n");
  //consola.info("SMTP CONFIG => ", config);

  main();
});
