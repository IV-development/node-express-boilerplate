const catchAsync = require('../utils/catchAsync');
const { translationService } = require('../services');

// Simple controller to pass to the service
const translateText = catchAsync(async (req, res) => {
  const translation = await translationService.translate(
    req.body.text,
    req.body.target_lang,
    req.body.source_lang,
    req.body.cache
  );
  res.send(translation);
});

module.exports = {
  translateText,
};
