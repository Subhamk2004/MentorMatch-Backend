const Profile = require('../models/Profile');
const User = require('../models/User');

exports.createProfile = async (req, res) => {
  try {
    const { name, bio, skills, interests, experience, availability } = req.body;
    
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    profile = new Profile({
      user: req.user.id,
      name,
      bio,
      skills,
      interests,
      experience,
      availability
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchProfiles = async (req, res) => {
  try {
    const { role, skills, availability } = req.query;
    let query = {};

    // Don't show current user in results
    query.user = { $ne: req.user._id };

    if (role) {
      const users = await User.find({ role }).select('_id');
      query.user = { $in: users.map(user => user._id), $ne: req.user._id };
    }

    if (skills) {
      query.skills = { 
        $regex: skills.split(',').map(skill => skill.trim()).join('|'), 
        $options: 'i' 
      };
    }

    if (availability) {
      query.availability = availability;
    }

    const profiles = await Profile.find(query)
      .populate('user', 'email role')
      .select('-__v')
      .lean();

    res.json(profiles);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};