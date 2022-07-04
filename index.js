#!/usr/bin/env node
const redis = require('redis');
const db = redis.createClient({
  url: process.env.QREC_DATABASE || null,
});

const handleResp = (code) => {
  if (code == 1) {
    console.log('success');
    process.exit(0);
  } else {
    console.log('failure');
    process.exit(1);
  }
};

const usage = () => {
  console.error(`usage: qrec options...
    -a shortcut longURL\tadd a new redirect from /shortcut to logURL
    -d shortcut\t\tdelete an existing redirect
    -h\t\t\tshow this help`);
  process.exit(1);
};

const addRedirect = async (shortcut, longURL) => {
  const resp = await db.hSet('redirects', shortcut, longURL);
  handleResp(resp);
};

const removeRedirect = async (shortcut) => {
  const resp = await db.hDel('redirects', shortcut);
  handleResp(resp);
};

const main = async () => {
  if (process.argv.length <= 2) usage();
  await db.connect();
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] == '-h') {
      usage();
    } else if (process.argv[i] == '-a') {
      if (process.argv.length < i+3) usage();
      await addRedirect(process.argv[i+1], process.argv[i+2]);
      i += 2;
    } else if (process.argv[i] == '-d') {
      if (process.argv.length < i+2) usage();
      await removeRedirect(process.argv[i+1]);
      i++;
    } else {
      console.error('unknown option: ' + process.argv[i]);
      process.exit(1);
    }
  }
};
main();
