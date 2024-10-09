import Joi from "joi";

const userCreationValidation = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().required()
    .email({tlds: {allow: false}})
    .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|mil|in|biz|info|mobi|ai|io|co.in)(?!\.\1)$/i,
    )
    .messages({
        'string.pattern.base': 'Email must be a valid email',
    }),
    fullName: Joi.string().required(),
});

const userLoginValidation = Joi.object({
    username: Joi.string().min(3),
    email: Joi.string()
    .email({tlds: {allow: false}})
    .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|mil|in|biz|info|mobi|ai|io|co.in)(?!\.\1)$/i,
    )
    .messages({
        'string.pattern.base': 'Email must be a valid email',
    }),
    password: Joi.string().min(6).required(),
}).or("username", "email"); // Either username or email is required

const changePasswordValidation = Joi.object({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$')).required(),
});

const updateAccountDetailsValidation = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().required()
    .email({tlds: {allow: false}})
    .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|mil|in|biz|info|mobi|ai|io|co.in)(?!\.\1)$/i,
    )
    .messages({
        'string.pattern.base': 'Email must be a valid email',
    }),
});

const videoDetailsValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    owner: Joi.string().required(),
    isPublished: Joi.boolean(),
});

// Allowed video file types
const videoMimes = [
    'video/mp4',
    'video/x-msvideo', // AVI
    'video/x-matroska', // MKV
    'video/ogg', // OGG
    'video/webm', // WEBM
    'video/quicktime', // MOV
];

// Allowed thumbnail file types
const thumbnailMimes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
];

const filesValidation = Joi.object({
    videoFile: Joi
    .array()
    .items(
        Joi.object({
        mimetype: Joi.string().valid(...videoMimes).required(),
        size: Joi.number().max(15*1024*1024).required(),
        }).unknown(true)
    )
    .min(1)
    .required(),
    thumbnail: Joi
    .array()
    .items(
        Joi.object({
            mimetype: Joi.string().valid(...thumbnailMimes).required(),
        }).unknown(true)
    )
    .min(1)
    .required(),
});

const updateVideoDetailsValidation = Joi.object({
    id: Joi.string().required(),
    title: Joi.string(),
    description: Joi.string(),
    thumbnail: Joi.object({
        mimetype: Joi.string().valid(...thumbnailMimes).required(),
    }).unknown(true),
}).or("title", "description", "thumbnail");

export { userCreationValidation, userLoginValidation, changePasswordValidation, updateAccountDetailsValidation, videoDetailsValidation,  filesValidation, updateVideoDetailsValidation };