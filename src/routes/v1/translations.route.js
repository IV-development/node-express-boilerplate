const express = require('express');
const validate = require('../../middlewares/validate');
const translationValidation = require('../../validations/translation.validation');
const translationController = require('../../controllers/translation.controller');

const router = express.Router();

router.route('/').post(validate(translationValidation.translationRequest), translationController.translateText);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Translation
 *   description: Text translation
 */

/**
 * @swagger
 * /translation:
 *   post:
 *     summary: Translates a string
 *     description: Translates a string using deepL library
 *     tags: [Translation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - target_lang
 *             properties:
 *               text:
 *                 type: string
 *               target_lang:
 *                 type: string
 *                 enum: [EN, DE, FR, ES, PT, IT, NL, PL, RU]
 *                 description: Optional, uppercase, selected language must be enabled in the ENV
 *               source_lang:
 *                 type: string
 *                 enum: [EN, DE, FR, ES, PT, IT, NL, PL, RU]
 *                 description: Optional, uppercase, selected language must be enabled in the ENV
 *               cache:
 *                 type: boolean
 *             example:
 *               text: Bunny
 *               target_lang: DE
 *               source_lang: EN
 *               cache: false
 *     responses:
 *       "200":
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Translation'
 *
 */
