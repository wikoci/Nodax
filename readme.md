### Install the dependencies

```bash
npm install
```

#### CMD TEST SMTP : Verify smtp configuration

```bash
npm run test-smtp
```

#### CMD FOR SEND , and make sure your config is correct in .env file

```bash
npm run send
```

### Env variable .env

```bash

######## --- CONFIG SMTP --- ###########

SMTP_HOST=""
SMTP_PORT=465
SMTP_AUTH_TYPE="login"
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE=TRUE
SMTP_TLS=FALSE

SMTP_PROXY=

SMTP_DKIM_DOMAINE_NAME=""
SMTP_DKIM_KEY_SELECTOR=""
SMTP_DKIM_PRIVATE_KEY=""

###################### --- CONFIG HEADER MAIL --- #######

EMAIL_FROM=""
EMAIL_FROM_NAME=""
EMAIL_REPLY_TO=""
EMAIL_SUBJECT=""
EMAIL_PRIORITY="normal"

####### CONFIG MAILER ######

MAILER_TIMEOUT =0
MAILER_MODE="TO"

#### MAILER FOLDER FOR MAILIST AND ADRESSE : /mailer/ ####
## Set name of list  ex: adresses.txt
## Set name of letter  ex: letter.html

MAILIST_NAME="adresses.txt"
LETTER_NAME = "letter.html"


### CONFIG APP
PORT=5000

```

// Put your mailist in : / mailer/adresses.txt
// Put your letter in : /mailer/letter.html

#

Version: 1.0
