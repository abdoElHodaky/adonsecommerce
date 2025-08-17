import vine, { SimpleMessagesProvider } from '@vinejs/vine';
vine.messagesProvider = new SimpleMessagesProvider({
    required: 'The {{ field }} field is required',
    email: 'The {{ field }} must be a valid email address',
    min: 'The {{ field }} must be at least {{ min }} characters long',
    max: 'The {{ field }} must not exceed {{ max }} characters',
    confirmed: 'The {{ field }} confirmation does not match',
    unique: 'The {{ field }} has already been taken',
});
vine.createRule('strongPassword', (value, _, field) => {
    if (typeof value !== 'string') {
        return;
    }
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        field.report('The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 'strongPassword', field);
    }
});
export default vine;
//# sourceMappingURL=validator.js.map