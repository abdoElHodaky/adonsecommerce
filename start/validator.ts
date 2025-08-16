/*
|--------------------------------------------------------------------------
| Validator
|--------------------------------------------------------------------------
|
| This file is used to configure the validator for the application.
|
*/

import vine from '@vinejs/vine'
import { string } from '@adonisjs/core/helpers'

/**
 * Extend vine with custom rules
 */
vine.extend('slug', function (value, _, field) {
  if (typeof value !== 'string') {
    return
  }

  if (value !== string.slugify(value)) {
    field.report('The {{ field }} must be a valid slug', 'slug', field)
  }
})

/**
 * Define custom error messages
 */
vine.messagesProvider.setMessages({
  required: 'The {{ field }} field is required',
  string: 'The {{ field }} field must be a string',
  email: 'The {{ field }} field must be a valid email address',
  min: 'The {{ field }} field must be at least {{ min }} characters',
  max: 'The {{ field }} field must not exceed {{ max }} characters',
  confirmed: 'The {{ field }} confirmation does not match',
  unique: 'The {{ field }} has already been taken',
  exists: 'The selected {{ field }} is invalid',
  slug: 'The {{ field }} must be a valid slug format',
})

