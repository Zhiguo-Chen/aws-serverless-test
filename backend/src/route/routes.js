const express = require("express");
const { register, login } = require("../controller/userController");

const router = express.Router();

router.use("/test", (req, res) => {
  res.json({ id: 1, name: "Leo Messi" });
});

router.use("/register", register);
router.use("/login", login);

module.exports = router;
