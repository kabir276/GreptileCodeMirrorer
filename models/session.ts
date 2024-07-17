import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  idealRepo: String,
  userRepo: String,
  idealBranch: String,
  userBranch: String,
  createdAt: { type: Date, default: Date.now },
  extractedFeature: String,
  compatibilityAnalysis: String,
  implementationSuggestions: String,
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);