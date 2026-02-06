const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const settingsSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "payment", "referral", "notification", "security", "email"],
      default: "general",
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.plugin(toJSON);

// Static method to get setting by key
settingsSchema.statics.getSetting = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting
settingsSchema.statics.setSetting = async function (key, value, category = "general", description = null) {
  return this.findOneAndUpdate(
    { key },
    { value, category, description },
    { upsert: true, new: true }
  );
};

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
