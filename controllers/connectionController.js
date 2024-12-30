const Connection = require('../models/Connection');
const User = require('../models/User');
const Profile = require('../models/Profile');

exports.sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Get both users
    const sender = await User.findById(req.user._id);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { mentor: sender._id, mentee: recipientId },
        { mentor: recipientId, mentee: sender._id }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    // Determine mentor and mentee based on roles
    let mentorId, menteeId;
    if (sender.role === 'mentor') {
      mentorId = sender._id;
      menteeId = recipientId;
    } else {
      mentorId = recipientId;
      menteeId = sender._id;
    }

    // Create new connection
    const connection = new Connection({
      mentor: mentorId,
      mentee: menteeId,
      status: 'pending'
    });

    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this to your routes if not already present
exports.getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }]
    })
      .populate('mentor', 'email role')
      .populate('mentee', 'email role');
    
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





exports.getPendingRequests = async (req, res) => {
  try {
    // First, ensure we have the user
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get both incoming and outgoing pending requests
    const pendingConnections = await Connection.find({
      $or: [
        { mentor: req.user._id, status: 'pending' },
        { mentee: req.user._id, status: 'pending' }
      ]
    })
      .populate('mentor', 'email role')
      .populate('mentee', 'email role');

    res.json(pendingConnections);

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { connectionId } = req.params;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Verify the user is the mentor of this connection
    if (connection.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    connection.status = status;
    await connection.save();

    const updatedConnection = await Connection.findById(connectionId)
      .populate('mentor', 'email role')
      .populate('mentee', 'email role');

    res.json(updatedConnection);
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};