export default {
  port: 3000,
  dbUri: "mongodb://localhost:27017/user-api-tutorial",
  logLevel: "info",
  smtp: {
    //don't use this test credentials in production
    //use proper smtp server in production
    user: "stge2gpquybweri6@ethereal.email",
    pass: "c6vVxEHUY9s6pnR45g",
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, //set secure to true in production
  },
};
