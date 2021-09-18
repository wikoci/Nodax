require("dotenv").config();
const consola = require("consola");
const colors = require("colors");
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cleanDeep = require("clean-deep");

const config_ = {
  host: process.env.SMTP_HOST || null,
  port: Number(process.env.SMTP_PORT) || null,
  secure: Boolean(process.env.SMTP_SECURE) || null,
  tls: Boolean(process.env.SMTP_TLS) || null,
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
  };
}

const transporter = nodemailer.createTransport(config);

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
}

app.listen(process.env.PORT, () => {
  console.log("\n");
  console.log(`##### SMTP TEST  IS RUNNIG WAIT FOR LOGS #######`.blue);
  console.log("\n");
  //consola.info("SMTP CONFIG => ", config);

  main();
});
