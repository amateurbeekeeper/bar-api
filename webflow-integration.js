/**
 * BAR Keela Bridge - Webflow Integration Script
 * 
 * This script integrates your Webflow form with the BAR API to submit data to Keela CRM
 * via Browserless automation. Place this script in your Webflow site's custom code.
 * 
 * Features:
 * - Form validation
 * - API submission to https://bar-api.vercel.app/signup
 * - Success/error handling
 * - Loading states
 * - Accessibility support
 */

(function() {
    'use strict';

    // Configuration
    const API_URL = 'https://bar-api.vercel.app/signup';
    const FORM_SELECTOR = '[data-form="bar-signup"]'; // Add this attribute to your form
    const LOADING_CLASS = 'form-loading';
    const SUCCESS_CLASS = 'form-success';
    const ERROR_CLASS = 'form-error';

    // Form field selectors (customize these to match your Webflow form)
    const FIELD_SELECTORS = {
        firstName: 'input[name="firstName"], input[placeholder*="First"], input[placeholder*="first"]',
        lastName: 'input[name="lastName"], input[placeholder*="Last"], input[placeholder*="last"]',
        email: 'input[name="email"], input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]',
        isScientist: 'input[name="isScientist"], input[value="true"], input[value="false"]'
    };

    // Utility functions
    function showMessage(element, message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', 'alert');
        
        // Remove existing messages
        const existingMessages = element.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        element.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    function setLoadingState(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        if (isLoading) {
            form.classList.add(LOADING_CLASS);
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText = submitButton.textContent;
                submitButton.textContent = 'Submitting...';
            }
            inputs.forEach(input => input.disabled = true);
        } else {
            form.classList.remove(LOADING_CLASS);
            if (submitButton) {
                submitButton.disabled = false;
                if (submitButton.dataset.originalText) {
                    submitButton.textContent = submitButton.dataset.originalText;
                }
            }
            inputs.forEach(input => input.disabled = false);
        }
    }

    function validateForm(formData) {
        const errors = [];
        
        // Required field validation
        if (!formData.firstName || formData.firstName.trim().length < 1) {
            errors.push('First name is required');
        }
        
        if (!formData.lastName || formData.lastName.trim().length < 1) {
            errors.push('Last name is required');
        }
        
        if (!formData.email || formData.email.trim().length < 1) {
            errors.push('Email is required');
        } else {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.push('Please enter a valid email address');
            }
        }
        
        return errors;
    }

    function extractFormData(form) {
        const formData = {};
        
        // Extract firstName
        const firstNameField = form.querySelector(FIELD_SELECTORS.firstName);
        if (firstNameField) {
            formData.firstName = firstNameField.value.trim();
        }
        
        // Extract lastName
        const lastNameField = form.querySelector(FIELD_SELECTORS.lastName);
        if (lastNameField) {
            formData.lastName = lastNameField.value.trim();
        }
        
        // Extract email
        const emailField = form.querySelector(FIELD_SELECTORS.email);
        if (emailField) {
            formData.email = emailField.value.trim();
        }
        
        // Extract isScientist (default to false if not found)
        const scientistField = form.querySelector(FIELD_SELECTORS.isScientist);
        if (scientistField) {
            if (scientistField.type === 'radio') {
                formData.isScientist = scientistField.checked && scientistField.value === 'true';
            } else if (scientistField.type === 'checkbox') {
                formData.isScientist = scientistField.checked;
            } else {
                formData.isScientist = scientistField.value === 'true';
            }
        } else {
            formData.isScientist = false; // Default value
        }
        
        return formData;
    }

    async function submitToAPI(formData) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error('API submission error:', error);
            throw error;
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        
        // Extract form data
        const formData = extractFormData(form);
        
        // Validate form data
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
            showMessage(form, validationErrors.join(', '), 'error');
            return;
        }
        
        // Set loading state
        setLoadingState(form, true);
        
        // Submit to API
        submitToAPI(formData)
            .then(result => {
                // Success
                form.classList.add(SUCCESS_CLASS);
                showMessage(form, 'Thank you! Your information has been submitted successfully.', 'success');
                
                // Reset form
                form.reset();
                
                // Track conversion (if you have analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': 'bar_signup'
                    });
                }
                
                // Optional: Redirect or show success page
                // window.location.href = '/thank-you';
            })
            .catch(error => {
                // Error
                form.classList.add(ERROR_CLASS);
                showMessage(form, 'Sorry, there was an error submitting your information. Please try again.', 'error');
                console.error('Form submission failed:', error);
            })
            .finally(() => {
                // Reset loading state
                setLoadingState(form, false);
            });
    }

    // Initialize forms when DOM is ready
    function initializeForms() {
        const forms = document.querySelectorAll(FORM_SELECTOR);
        
        forms.forEach(form => {
            // Remove existing event listeners
            form.removeEventListener('submit', handleFormSubmit);
            
            // Add new event listener
            form.addEventListener('submit', handleFormSubmit);
            
            // Add ARIA attributes for accessibility
            form.setAttribute('aria-label', 'Signup form for Beyond Animal Research');
            
            // Add loading indicator if not present
            if (!form.querySelector('.form-loading-indicator')) {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'form-loading-indicator';
                loadingIndicator.style.display = 'none';
                loadingIndicator.innerHTML = '<div class="spinner"></div>';
                form.appendChild(loadingIndicator);
            }
        });
    }

    // CSS for styling (you can customize this)
    const styles = `
        .form-loading {
            opacity: 0.7;
            pointer-events: none;
        }
        
        .form-loading .form-loading-indicator {
            display: block !important;
        }
        
        .form-message {
            padding: 12px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: 500;
        }
        
        .form-message-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .form-message-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .form-message-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForms);
    } else {
        initializeForms();
    }

    // Re-initialize on Webflow page changes (if using Webflow's page transitions)
    if (typeof Webflow !== 'undefined') {
        Webflow.push(() => {
            initializeForms();
        });
    }

    // Make functions available globally for debugging
    window.BARFormAPI = {
        submitToAPI,
        validateForm,
        extractFormData,
        initializeForms
    };

})(); 