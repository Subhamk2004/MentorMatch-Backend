// server/routes/connection.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendRequest,
  getMyConnections,
  getPendingRequests,
  respondToRequest
} = require('../controllers/connectionController');

router.post('/request', auth, sendRequest);
router.get('/my-connections', auth, getMyConnections);
router.get('/pending-requests', auth, getPendingRequests);
router.put('/respond/:connectionId', auth, respondToRequest);

module.exports = router;