const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
    try {
        const { title, description, image, userId } = req.body;

        const newPost = await prisma.post.create({
            data: {
                title,
                description,
                image,
                userId,
                likes: [],
            },
        });

        return res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.getPosts = async (req, res) => {
    const { id } = req.params;

    try {
        const posts = await prisma.post.findMany(
            {
                where: {
                    userId: id
                }
            }
        );
        return res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllPosts = async (_, res) => {

    try {
        const posts = await prisma.post.findMany(
            {
                include: {
                    User: true
                }
            }
        );
        return res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        return res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error("Error fetching post by id:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image } = req.body;

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { title, description, image },
        });

        return res.status(200).json({ success: true, data: updatedPost });
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.post.delete({
            where: { id },
        });

        return res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
