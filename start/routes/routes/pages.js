import router from '@adonisjs/core/services/router'

// Static pages routes
router.get('/about', async ({ view }) => {
  return view.render('pages/about/index')
})

router.get('/faq', async ({ view }) => {
  return view.render('pages/faq/index')
})

router.get('/contact', async ({ view }) => {
  return view.render('pages/contact/index')
})

// Contact form submission
router.post('/contact', async ({ request, response, session }) => {
  // Validate form data
  const payload = await request.validateUsing({
    schema: {
      firstName: 'required|string|max:50',
      lastName: 'required|string|max:50',
      email: 'required|email',
      subject: 'required|string',
      message: 'required|string|max:1000',
      terms: 'required'
    },
    messages: {
      'required': 'The {{ field }} field is required',
      'email': 'Please provide a valid email address',
      'max': 'The {{ field }} must not exceed {{ options.max }} characters'
    }
  })

  try {
    // Here you would typically save the contact form to the database
    // and/or send an email notification
    
    // For now, we'll just flash a success message
    session.flash('success', 'Thank you for your message! We will get back to you soon.')
    return response.redirect('/contact')
  } catch (error) {
    session.flash('error', 'There was a problem submitting your message. Please try again.')
    return response.redirect('/contact')
  }
})

// Terms and Privacy Policy routes
router.get('/terms', async ({ view }) => {
  return view.render('pages/terms/index')
})

router.get('/privacy', async ({ view }) => {
  return view.render('pages/privacy/index')
})

export default router

