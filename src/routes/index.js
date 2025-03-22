const { Router } = require("express");
const router = Router();
const userRoutes = require("./user.routes")
const postRoutes = require("./post.routes")
const contractRoutes = require("./contract.routes")


router.use("/user", userRoutes);
router.use("/post", postRoutes);
router.use("/contract", contractRoutes);
module.exports = router;

