/**
 * Validates password based on:
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One symbol
 * - Minimum 8 characters
 */
export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
    }
    if (!hasUpper) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!hasLower) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
        return "Password must contain at least one number.";
    }
    if (!hasSymbol) {
        return "Password must contain at least one symbol.";
    }

    return null; // Valid
};
