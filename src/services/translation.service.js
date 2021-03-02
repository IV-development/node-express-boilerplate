const httpStatus = require('http-status');
const deepL = require('deepl');
const { Translation } = require('../models');

const config = require('../config/config');

const ApiError = require('../utils/ApiError');

const translate = async (sourceText, originalTargetLang, originalSourceLang = '', useCache = true) => {
  // uppercase the languages in case user forgot it
  const targetLang = originalTargetLang.toUpperCase();
  const sourceLang = originalSourceLang.toUpperCase();

  if (!config.translation.languages.includes(targetLang)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid language specified');
  }
  const hash = Translation.generateHash(sourceText, targetLang);
  let needsFreshTranslation = false;
  let needsInserting = false;

  // update nonetheless if we're skipping cache
  if (!useCache) {
    needsFreshTranslation = true;
  }

  // check if we need to hit the cache
  let translation = await Translation.findOne({ MD5Hash: hash });

  if (!translation) {
    // translation not in DB, so define holder values
    translation = {
      source_text: sourceText,
      target_lang: targetLang,
    };

    // optional source language
    if (sourceLang) {
      translation.source_lang = sourceLang;
    }
    needsFreshTranslation = true;
    needsInserting = true;
  } else {
    // translation in DB, set the expiry date to the future
    const expires = new Date(translation.fetched);
    expires.setDate(translation.fetched.getDate() + config.translation.expires_in);
    if (expires <= new Date()) {
      // already expired
      needsFreshTranslation = true;
    }
  }

  if (needsFreshTranslation) {
    // we need to re-get the values from the server
    const postData = {
      text: sourceText,
      target_lang: targetLang,
      auth_key: config.translation.api_key,
    };
    // optional source language, will be auto detected if not set
    if (sourceLang) {
      postData.source_lang = sourceLang;
    }
    // translation.target_text = await deepL(postData);
    const result = await deepL(postData);

    // sanity check if API responded properly, if it did save the data and update fetched data
    if (
      result &&
      result.data &&
      result.data.translations &&
      Array.isArray(result.data.translations) &&
      result.data.translations.length > 0
    ) {
      Object.assign(translation, {
        target_text: result.data.translations[0].text,
        source_lang: result.data.translations[0].detected_source_language,
        fetched: new Date(),
      });
    }
  }

  if (needsInserting) {
    // new data
    translation = await Translation.create(translation);
  } else {
    // we're updating already existing data
    translation.hit += 1;

    // if we fetched fresh data, update that counter as well
    if (needsFreshTranslation) {
      translation.deepl_lookUps += 1;
    }
    await translation.save();
  }

  // if you need to return more data, just add it here
  return {
    source_text: translation.source_text,
    source_lang: translation.source_lang,
    target_text: translation.target_text,
    target_lang: translation.target_lang,
  };
};

module.exports = {
  translate,
};
