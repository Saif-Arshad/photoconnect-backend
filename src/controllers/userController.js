const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





exports.registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            banner,
            profile,
            userType,
            designerType,
            location,
            about,
            phone,
            website
        } = req.body;

        const name = `${firstName} ${lastName}`;
        console.log("🚀 ~ exports.registerUser= ~ userType:", userType);
        console.log("🚀 ~ exports.registerUser= ~ password:", password);
        console.log("🚀 ~ exports.registerUser= ~ email:", email);
        console.log("🚀 ~ exports.registerUser= ~ name:", name);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Build the base user data
        const userData = {
            name,
            email,
            password: hashedPassword,
            userType,
            bannerImage: banner,
            profileImage: profile,
            followerCount: 0,
            followingCount: 0,
            follower: [],
            following: []
        };

        // If the user is a photographer ("DESIGNER"), add extra fields
        if (userType === "DESIGNER") {
            userData.designerType = designerType;
            userData.Location = location;
            userData.about = about;
            userData.phoneNumber = phone;
            userData.website = website;
        }

        const newUser = await prisma.user.create({
            data: userData,
        });

        const { password: _, ...userWithoutPassword } = newUser;

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, userType: newUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            data: {
                ...userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.log("🚀 ~ exports.registerUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            data: {
                ...userWithoutPassword,
                token,

            },
        });
    } catch (error) {
        console.log("🚀 ~ exports.loginUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const { profile, banner, userId, name } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                bannerImage: banner,
                profileImage: profile,
                name: name
            }

        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                user,

            },
        });
    } catch (error) {
        console.log("🚀 ~ exports.loginUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDesigners = async (req, res) => {
    try {

        const designers = await prisma.user.findMany({
            where: {
                userType: 'DESIGNER'
            }
        })
        return res.status(200).json({
            success: true,
            data: designers
        });
    } catch (error) {
        console.log("🚀 ~ exports.loginUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
}
exports.getDesignerById = async (req, res) => {
    const { id } = req.params
    try {


        const designer = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                Post: true
            }
        })
        if (!designer) {
            return res.status(500).json({ success: false, message: "No Designer Found with this ID" });

        }
        return res.status(200).json({
            success: true,
            data: designer
        });
    } catch (error) {
        console.log("🚀 ~ exports.loginUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.followUser = async (req, res) => {
    const { userId, clientId } = req.body;

    if (!userId || !clientId) {
        return res.status(400).json({
            success: false,
            message: "Both userId and clientId are required",
        });
    }

    try {
        const userToFollow = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userToFollow) {
            return res
                .status(404)
                .json({ success: false, message: "No user found with this ID" });
        }

        if (userToFollow.follower.includes(clientId)) {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    follower: userToFollow.follower.filter((id) => id !== clientId),
                    followerCount: { decrement: 1 },
                },
            });

            const clientUser = await prisma.user.findUnique({
                where: { id: clientId },
            });
            const updatedClient = await prisma.user.update({
                where: { id: clientId },
                data: {
                    following: clientUser.following.filter((id) => id !== userId),
                    followingCount: { decrement: 1 },
                },
            });

            return res.status(200).json({
                success: true,
                message: "Unfollow successful",
                data: {
                    unfollowedUser: updatedUser,
                    clientUser: updatedClient,
                },
            });
        } else {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    follower: { push: clientId },
                    followerCount: { increment: 1 },
                },
            });

            const updatedClient = await prisma.user.update({
                where: { id: clientId },
                data: {
                    following: { push: userId },
                    followingCount: { increment: 1 },
                },
            });

            return res.status(200).json({
                success: true,
                message: "Follow successful",
                data: {
                    followedUser: updatedUser,
                    clientUser: updatedClient,
                },
            });
        }
    } catch (error) {
        console.error("Error in followUser:", error);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};