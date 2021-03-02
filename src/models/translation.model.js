const mongoose = require('mongoose');
const md5 = require('md5');

/**
 * Helper function to generate MD5 hash from the text/language combo
 * @param {string} sourceText Source text to be translated
 * @param {string} targetLang Target language to translate to
 * @returns {string}
 */
const generateHash = function (sourceText, targetLang) {
  return md5(sourceText.toLowerCase().trim() + targetLang.toLowerCase().trim());
};

const translationSchema = mongoose.Schema(
  {
    // MD5 hash is generated automatically
    MD5Hash: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      default() {
        return generateHash(this.source_text, this.target_lang);
      },
    },
    // source language can be autodetected by deepL, no need to hardcode it in, in case the user wants to use a new language
    source_lang: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
    },
    target_lang: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      validate(value) {
        // fetch languages from the env, if user set them
        let enabledLanguages = process.env.TRANSLATION_LANGS.split(',');

        // user didn't set-up the languages, so use the default ones
        if (!Array.isArray(enabledLanguages) || !(enabledLanguages.length > 0)) {
          enabledLanguages = ['EN', 'DE', 'FR', 'ES', 'PT', 'IT', 'NL', 'PL', 'RU'];
        }

        // make sure to uppercase so we actually match
        if (!enabledLanguages.includes(value.toUpperCase())) {
          throw new Error('Target translation language not supported');
        }
      },
    },
    source_text: {
      type: String,
      required: true,
    },
    target_text: {
      type: String,
      required: true,
    },
    deepl_lookUps: {
      type: Number,
      default: 1,
    },
    hit: {
      type: Number,
      default: 1,
    },
    fetched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check if translation is in database
 * @param {string} sourceText Source text to be translated
 * @param {string} targetLang Target language to translate to
 * @returns {string}
 */
translationSchema.statics.translationExists = async function (sourceText, targetLang) {
  const translation = await this.findOne({ MD5Hash: generateHash(sourceText, targetLang) });
  return !!translation;
};

// Export the hash generation method, for re-usability
translationSchema.statics.generateHash = generateHash;

/**
 * @typedef Translation
 */
const Translation = mongoose.model('Translation', translationSchema);

module.exports = Translation;
