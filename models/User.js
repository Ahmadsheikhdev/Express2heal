// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }, // Track if user is verified
  resetPasswordToken: { type: String }, // Token for password reset
  resetPasswordExpires: { type: Date }, // Expiry date for the token
  role: { 
    type: String, 
    enum: ['user', 'admin', 'content_validator'], 
    default: 'user' 
  },
  permissions: {
    canApproveContent: { type: Boolean, default: false },
    canEditContent: { type: Boolean, default: false },
    canDeleteContent: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false }
  },
  // Privacy settings
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
    dataSharing: { type: Boolean, default: true }, // For research purposes (anonymized)
    aiModelTraining: { type: Boolean, default: true }, // Participation in AI model training
    thirdPartyIntegrations: { type: Boolean, default: true }, // Third-party integration permissions
  },
  displayName: { type: String }, // Custom display name for group chats
  useDisplayNameInChats: { type: Boolean, default: false }, // Whether to use display name instead of email in chats
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
