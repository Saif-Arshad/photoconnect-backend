const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { verifyUserToken } = require('../middlewares/jwt-middleware');

router.post('/',verifyUserToken, contractController.createContract);

router.get('/', contractController.getAllContracts);

router.get('/:id', contractController.getContractById);

router.put('/:id', contractController.updateContract);
router.patch('/status/:id', contractController.updateStatus);

router.delete('/:id', contractController.deleteContract);

module.exports = router;
