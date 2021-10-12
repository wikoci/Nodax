require("dotenv").config();
var jwt = require("jsonwebtoken");
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
const localIpAddress = require("local-ip-address");
const { fail } = require("assert");
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
  priority: process.env.EMAIL_PRIORITY || null,
  from:
    process.env.EMAIL_FROM_NAME + "<" + process.env.EMAIL_FROM + ">" || null,
  subject: process.env.EMAIL_SUBJECT || null,
  html: letterHTML,
  text: convert(letterHTML, {
    wordwrap: 130,
  }),
};

async function send_(mailbox, i, ok, fail) {
  mailbox.to = list[i];

  console.log("Mailbox ", mailbox.to);

  if (process.env.DYNAMIC) {
    mailbox.html = mailbox.html.replace("{{email}}", mailbox.to);
    var sign = jwt.sign(mailbox.to, process.env.JWT_PASS);
    mailbox.html = mailbox.html.replace("{{emailEncrypt}}", sign);
  }

  transporter
    .sendMail(mailbox)
    .then((e) => {
      consola.success(`${i} - ${e.accepted} OK`);
      ok.push(mailbox.to);
    })
    .catch((err) => {
      consola.error(`${i}  Failed to => ${mailbox.to} \n ${err} `);
      fail.push(mailbox.to);
    });

  if (ok.length) {
    //consola.info("Sent : ", ok.length, " /logs/passed.txt \n".green);

    fs.writeFileSync(
      __dirname + "/../../logs/passed.txt",
      ok.toString().replace(",", "\n")
    );
  }
  if (fail.length) {
    //  consola.error("Failed : ", fail.length, "/logs/failed.txt) \n");
    fs.writeFileSync(
      __dirname + "/../../logs/failed.txt",
      fail.oString().replace(",", "\n")
    );
  }
}

async function main() {
  console.log("\nWaiting to connect ....\n");

  var ok = [];
  var fail = [];

  for (var i = 0; i < list.length; i++) {
    var mailbox = { ...mail };
    send_({ ...mail }, i, ok, fail);
  }

  console.log("\nAction done.... ! use Ctrl + C to exit program .\n");
}

app.listen(process.env.PORT, () => {
  console.log("\n");
  console.log(`##### SEND IS RUNNIG WAIT FOR LOGS #######`.blue);
  console.log("\n");
  //consola.info("SMTP CONFIG => ", config);

  main();
});
