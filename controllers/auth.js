const express = require("express");
const router = express.Router();

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

module.exports = router;