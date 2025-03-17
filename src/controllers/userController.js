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
