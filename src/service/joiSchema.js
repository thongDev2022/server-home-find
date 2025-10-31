import Joi from "joi";

const roomSchema = Joi.object({
  prefix: Joi.string().required().messages({
    "string.base": "prefix must be a string",
    "any.required": "prefix is required"
  }),
  startNumber: Joi.number().required().messages({
    "number.base": "startNumber must be a number",
    "any.required": "startNumber is required"
  }),
  endNumber: Joi.number().required().messages({
    "number.base": "endNumber must be a number",
    "any.required": "endNumber is required"
  }),
  rentPrice: Joi.number().required().messages({
    "number.base": "rentPrice must be a number",
    "any.required": "rentPrice is required"
  }),
  deposit: Joi.number().required().messages({
    "number.base": "deposit must be a number",
    "any.required": "deposit is required"
  }),
  size: Joi.string().required().messages({
    "string.base": "size must be a string",
    "any.required": "size is required"
  }),
  floor: Joi.number().required().messages({
    "number.base": "floor must be a number",
    "any.required": "floor is required"
  }),
  details: Joi.string().allow("").messages({
    "string.base": "details must be a string"
  }),
  categoryId: Joi.string().required().messages({
    "string.base": "categoryId must be a string",
    "any.required": "categoryId is required"
  }),
  image: Joi.string().allow("").messages({
    "string.base": "image must be a string"
  }),
  images: Joi.array().items(Joi.string()).messages({
    "array.base": "images must be an array of strings"
  }),
  rentalRoom: Joi.string().required().messages({
    "string.base": "rentalRoom must be a string",
    "any.required": "rentalRoom is required"
  }),
  location: Joi.string().required().messages({
    "string.base": "location must be a string",
    "any.required": "location is required"
  }),
  village: Joi.string().required().messages({
    "string.base": "village must be a string",
    "any.required": "village is required"
  }),
  district: Joi.string().required().messages({
    "string.base": "district must be a string",
    "any.required": "district is required"
  }),
  paymentCategories: Joi.array().items(Joi.string()).messages({
    "array.base": "paymentCategories must be an array of strings"
  }),
  province: Joi.string().required().messages({
    "string.base": "province must be a string",
    "any.required": "province is required"
  }),
  initialPrice: Joi.number().messages({
    "number.base": "initialPrice must be a number"
  }),
  moreDetails: Joi.string().allow("").messages({
    "string.base": "moreDetails must be a string"
  })
});

export default roomSchema
