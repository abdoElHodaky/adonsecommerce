import vine from '@vinejs/vine'

/**
 * Validator for the contact form
 */
export const contactFormValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().email(),
    subject: vine.string().trim().minLength(5).maxLength(200),
    message: vine.string().trim().minLength(10).maxLength(2000),
  })
)
