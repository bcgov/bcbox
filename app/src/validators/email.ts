import Joi from 'joi';

import { emailJoi } from './common';
import { validate } from '../middleware/validation';

const schema = {
  mergeSchema: {
    body: Joi.object().keys({
      body: Joi.string().required(),
      subject: Joi.string().required(),
      contexts: Joi.array().items(
        Joi.object().keys({
          to: Joi.array().items(emailJoi).required(),
          context: Joi.object().keys({
            token: Joi.string(),
            fullName: Joi.string()
          })
        })
      )
    })
  }
};

export default {
  mergeSchema: validate(schema.mergeSchema)
};
