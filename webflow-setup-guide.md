# 🎨 Webflow Integration Guide - BAR Keela Bridge

This guide will help you integrate the BAR API with your Webflow site to submit form data to Keela CRM via Browserless automation.

## 📋 Prerequisites

- Webflow site with a form
- BAR API deployed and working (https://bar-api.vercel.app/signup)
- Browserless token configured in Vercel (optional for testing)

## 🚀 Quick Setup

### Step 1: Add the Integration Script

1. **Copy the script** from `webflow-integration.js`
2. **Go to your Webflow site settings**
3. **Navigate to Custom Code**
4. **Add the script to the `<head>` section**

### Step 2: Configure Your Form

Add the `data-form="bar-signup"` attribute to your form element:

```html
<form data-form="bar-signup">
  <!-- Your form fields here -->
</form>
```

### Step 3: Configure Form Fields

The script automatically detects form fields based on these selectors. Make sure your form has:

#### Required Fields:
- **First Name**: `input[name="firstName"]` or placeholder containing "First"
- **Last Name**: `input[name="lastName"]` or placeholder containing "Last"  
- **Email**: `input[type="email"]` or placeholder containing "Email"

#### Optional Fields:
- **Scientist Status**: `input[name="isScientist"]` or radio/checkbox for scientist selection

## 🎯 Form Field Examples

### Basic Form Structure
```html
<form data-form="bar-signup">
  <input type="text" name="firstName" placeholder="First Name" required>
  <input type="text" name="lastName" placeholder="Last Name" required>
  <input type="email" name="email" placeholder="Email Address" required>
  
  <!-- Scientist selection (optional) -->
  <label>
    <input type="radio" name="isScientist" value="true"> I am a scientist
  </label>
  <label>
    <input type="radio" name="isScientist" value="false"> I am not a scientist
  </label>
  
  <button type="submit">Submit</button>
</form>
```

### Alternative Field Names
The script is flexible and will work with various field configurations:

```html
<!-- These will all work -->
<input type="text" placeholder="First Name">
<input type="text" placeholder="first name">
<input type="text" name="firstName">

<input type="text" placeholder="Last Name">
<input type="text" placeholder="last name">
<input type="text" name="lastName">

<input type="email" placeholder="Email">
<input type="email" placeholder="email address">
<input type="email" name="email">
```

## 🎨 Customization Options

### 1. Custom Field Selectors

If your form uses different field names, you can customize the selectors:

```javascript
// In the script, modify the FIELD_SELECTORS object:
const FIELD_SELECTORS = {
    firstName: 'input[name="first_name"], input[placeholder*="First"]',
    lastName: 'input[name="surname"], input[placeholder*="Last"]',
    email: 'input[name="email_address"], input[type="email"]',
    isScientist: 'input[name="scientist"], input[value="yes"]'
};
```

### 2. Custom Success/Error Messages

Modify the messages in the script:

```javascript
// Success message
showMessage(form, 'Thank you! Your information has been submitted successfully.', 'success');

// Error message  
showMessage(form, 'Sorry, there was an error submitting your information. Please try again.', 'error');
```

### 3. Custom Styling

The script includes basic CSS styling. You can customize it by modifying the `styles` variable in the script or adding your own CSS to Webflow.

## 🔧 Advanced Configuration

### 1. Redirect After Success

To redirect users after successful submission:

```javascript
// Uncomment and modify this line in the script:
window.location.href = '/thank-you';
```

### 2. Google Analytics Tracking

The script automatically tracks form submissions with Google Analytics if `gtag` is available:

```javascript
gtag('event', 'form_submit', {
    'event_category': 'engagement',
    'event_label': 'bar_signup'
});
```

### 3. Custom Validation

Add custom validation rules:

```javascript
function validateForm(formData) {
    const errors = [];
    
    // Existing validation...
    
    // Custom validation
    if (formData.firstName && formData.firstName.length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    
    return errors;
}
```

## 🧪 Testing

### 1. Test Locally
1. Add the script to your Webflow site
2. Fill out the form
3. Submit and check the browser console for any errors
4. Verify the API receives the data

### 2. Test API Response
The form will show different messages based on the API response:

- **Success**: "Thank you! Your information has been submitted successfully."
- **Error**: "Sorry, there was an error submitting your information. Please try again."

### 3. Debug Mode
The script exposes debugging functions globally:

```javascript
// In browser console:
window.BARFormAPI.submitToAPI({
    firstName: "Test",
    lastName: "User", 
    email: "test@example.com",
    isScientist: false
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **Form not submitting**
   - Check that `data-form="bar-signup"` is added to your form
   - Verify the script is loaded (check browser console)

2. **Fields not detected**
   - Ensure field names/placeholders match the selectors
   - Check browser console for field detection errors

3. **API errors**
   - Verify the API URL is correct: `https://bar-api.vercel.app/signup`
   - Check that the API is working (test with curl)

4. **CORS errors**
   - The API has CORS enabled, but if you see CORS errors, contact support

### Debug Steps:

1. **Open browser console** (F12)
2. **Fill out and submit the form**
3. **Check for error messages**
4. **Verify network requests** in the Network tab
5. **Test API directly** with curl or Postman

## 📱 Mobile Compatibility

The script is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Tablets
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

## 🔒 Security Features

- **Input validation** on both client and server
- **XSS protection** through proper escaping
- **CSRF protection** (handled by the API)
- **Rate limiting** (handled by Vercel)

## 📊 Analytics & Tracking

The script automatically tracks:
- Form submissions
- Validation errors
- API errors
- Loading states

## 🎯 Best Practices

1. **Test thoroughly** before going live
2. **Use descriptive field names** for better detection
3. **Add proper labels** for accessibility
4. **Include loading states** (handled automatically)
5. **Provide clear error messages** (customizable)
6. **Test on multiple devices** and browsers

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Test the API directly with curl
3. Verify your form structure matches the examples
4. Contact the development team with specific error messages

---

**Ready to integrate?** Copy the script from `webflow-integration.js` and follow the setup steps above! 🚀 