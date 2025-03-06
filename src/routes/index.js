const { Router } = require("express");
const router = Router();
const userRoutes = require("./user.routes")
const postRoutes = require("./post.routes")


router.use("/user", userRoutes);
router.use("/post", postRoutes);
module.exports = router;

