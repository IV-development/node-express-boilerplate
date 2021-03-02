const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Translation } = require('../../src/models');

setupTestDB();

describe('Translation routes', () => {
  describe('POST /v1/translation', () => {
    let newTranslation;

    beforeEach(() => {
      newTranslation = {
        text: 'Bunny',
        target_lang: 'DE',
        source_lang: 'EN',
        cache: true,
      };
    });

    test('should return 200 and successfully create new translation if data is ok', async () => {
      const res = await request(app).post('/v1/translation').send(newTranslation).expect(httpStatus.OK);
      expect(res.body.target_text).toEqual('Hase');
      const hash = Translation.generateHash(newTranslation.text, newTranslation.target_lang);
      const dbTranslation = await Translation.findOne({ MD5Hash: hash });
      expect(dbTranslation).toBeDefined();
      expect(dbTranslation.target_text).toEqual('Hase');
    });
  });
});
