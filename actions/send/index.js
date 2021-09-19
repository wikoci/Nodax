require("dotenv").config();
const consola = require("consola");
const colors = require("colors");
const express = require("express");
const app = express();
const moment = require("moment");
const nodemailer = require("nodemailer");
const cleanDeep = require("clean-deep");
const fs = require("fs");
const emailRegexSafe = require("email-regex-safe");
const { convert } = require("html-to-text");
const config_ = {
  connectionTimeout: 5200,

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
    proxy: process.env.SMTP_PROXY || null,
    auth: {
      type: process.env.SMTP_AUTH_TYPE || null,
      user: process.env.SMTP_USER || null,
      pass: process.env.SMTP_PASS || null,
    },
  };

  config = cleanDeep(config);
}

console.log("Config : ", config);

const adresses = fs.readFileSync(
  __dirname + "/../../mailer/" + process.env.MAILIST_NAME || "",
  "utf-8"
);

const letterHTML = fs.readFileSync(
  __dirname + "/../../mailer/" + process.env.LETTER_NAME || "",
  "utf8"
);

var list = adresses.split("\n");
list = list.filter((e) => e.length && emailRegexSafe().test(e || ""));
list = [...new Set(list)];

const transporter = nodemailer.createTransport(config);

if (config.proxy) {
  transporter.set("proxy_socks_module", require("socks"));
}

const mail = {
  priority: EMAIL_PRIORITY || null,
  from:
    process.env.EMAIL_FROM_NAME + "<" + process.env.EMAIL_FROM + ">" || null,
  subject: process.env.EMAIL_SUBJECT || null,
  html: letterHTML,
  text: convert(letterHTML, {
    wordwrap: 130,
  }),
};

async function main() {
  console.log("\nWaiting to connect ....\n");
  var i = 0;
  var ok = [];
  var fail = [];
  for await (var email of list) {
    mail.to = email;
    mail.date = moment();

    await transporter
      .sendMail(mail)
      .then((e) => {
        consola.success(`${i} - ${email} OK`);
        ok.push(email);
      })
      .catch((err) => {
        consola.error(`${i} - ${email} Failed `);
        fail.push(email);
      });

    i++;
  }

  console.log("\n");
  if (ok.length) {
    consola.info("Sent : ", ok.length, " /logs/passed.txt \n".green);

    fs.writeFileSync(
      __dirname + "/../../logs/passed.txt",
      ok.toString().replace(",", "\n")
    );
  }
  if (fail.length) {
    consola.error("Failed : ", fail.length, "/logs/failed.txt) \n");
    fs.writeFileSync(
      __dirname + "/../../logs/failed.txt",
      fail.oString().replace(",", "\n")
    );
  }

  console.log("\nAction done ....\n");
}

app.listen(process.env.PORT, () => {
  console.log("\n");
  console.log(`##### SEND IS RUNNIG WAIT FOR LOGS #######`.blue);
  console.log("\n");
  //consola.info("SMTP CONFIG => ", config);

  main();
});
