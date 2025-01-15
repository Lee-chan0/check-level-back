import Joi from 'joi';

const adminCredentialSchema = Joi.object({
  adminLoginId: Joi.string().min(1).max(15).required(),
  adminPassword: Joi.string().min(1).max(100).required(),
});

const adminSignUpSchema = adminCredentialSchema.keys({
  adminName: Joi.string().min(1).max(20).required()
});

const adminSignInSchema = adminCredentialSchema;


// 카테고리

const categorySchema = Joi.object({
  categoryName: Joi.string().required()
});

// 기사 타입

const articleTypeSchema = Joi.object({
  articleType: Joi.string().required()
});

// 기사
const articleSchema = Joi.object({
  articleTitle: Joi.string().required().min(1).max(30),
  articleContent: Joi.string().required(),
  articleSubTitle: Joi.string().required(),
})

export { adminSignUpSchema, adminSignInSchema, categorySchema, articleTypeSchema };