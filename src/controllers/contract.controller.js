const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createContract = async (req, res) => {
    const clientId = req.user.id
    try {
        const { budget, phone, discription, startDate, freelancerId, dueDate, designLink } = req.body;

        const newContract = await prisma.contract.create({
            data: {
                clientId,
                budget,
                phone,
                discription,
                startDate,
                freelancerId,
                dueDate: new Date(dueDate),
                designLink,
                status: "PENDING",
            },
        });

        return res.status(201).json({ success: true, data: newContract });
    } catch (error) {
        console.error("Error creating contract:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getContractById = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await prisma.contract.findUnique({
            where: { id: id },
            include: {
                client: true,
                freelancer: true
            }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: "Contract not found" });
        }

        return res.status(200).json({ success: true, data: contract });
    } catch (error) {
        console.error("Error fetching contract:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, budget, phone, discription, startDate, freelancerId, dueDate, designLink, status } = req.body;

        const updatedContract = await prisma.contract.update({
            where: { id: id },
            data: {
                clientId,
                budget,
                phone,
                discription,
                startDate,
                freelancerId,
                dueDate: new Date(dueDate),
                designLink,
                status,
            },
        });

        return res.status(200).json({ success: true, data: updatedContract });
    } catch (error) {
        console.error("Error updating contract:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const {  status } = req.body;

        const updatedContract = await prisma.contract.update({
            where: { id: id },
            data: {
                status,
            },
            include:{
                client:true,
                freelancer:true
            }
        });

        return res.status(200).json({ success: true, data: updatedContract });
    } catch (error) {
        console.error("Error updating contract:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.contract.delete({
            where: { id: id },
        });

        return res.status(200).json({ success: true, message: "Contract deleted successfully" });
    } catch (error) {
        console.error("Error deleting contract:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllContracts = async (req, res) => {

    try {
        const contracts = await prisma.contract.findMany({
            include: {
                client: true,
                freelancer: true
            }
        });
        return res.status(200).json({ success: true, data: contracts });
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
