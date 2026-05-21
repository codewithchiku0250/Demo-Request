const mongoose = require('mongoose');
const validator = require('validator');

const demoRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true
  },
  businessName: {
    type: String,
    required: [true, 'Business Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  businessType: {
    type: String,
    required: [true, 'Business Type is required'],
    enum: [
      'Shop',
      'Restaurant',
      'Clinic',
      'Hotel',
      'Salon',
      'Gym',
      'School',
      'Coaching Center',
      'Real Estate',
      'Other'
    ]
  },
  businessAddress: {
    type: String,
    trim: true
  },
  cityState: {
    type: String,
    trim: true
  },
  requiredService: {
    type: String,
    required: [true, 'Required Service is required'],
    enum: [
      'Website',
      'Android App',
      'iOS App',
      'Billing Software',
      'E-commerce',
      'Booking System',
      'Custom Software'
    ]
  },
  businessDescription: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  photosUrls: [{
    type: String
  }],
  preferredColor: {
    type: String,
    default: '#10b981' // Accent emerald green default
  },
  featuresRequired: [{
    type: String
  }],
  budgetRange: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  referenceLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Contacted', 'In Progress', 'Completed'],
    default: 'New'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);
module.exports = DemoRequest;
