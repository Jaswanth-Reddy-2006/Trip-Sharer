// validation.js - Enhanced with comprehensive Indian license formats

// Vehicle number pattern for Telangana: TG07HD2006 or TS07HD2006
export const vehicleNumberPattern = /^(TG|TS)\d{2}[A-Z]{2}\d{4}$/;

// Comprehensive Indian Driving License patterns - Based on official research
// Covers all valid formats including Sarathi, legacy, and state variations

export const licenseNumberPatterns = [
  // === NEW SARATHI FORMATS (2018+) ===
  
  // Standard 15-character format: TG + 2-digit RTO + 4-digit year + 7-digit serial
  // Example: TG0720240001234
  /^[A-Z]{2}\d{2}\d{4}\d{7}$/,
  
  // Extended 16-character format: TG + 2-digit RTO + additional digit + 4-digit year + 7-digit serial  
  // Example: TG01320240009352 (your friend's format!)
  /^[A-Z]{2}\d{3}\d{4}\d{7}$/,
  
  // Alternative 17-character format: Some states use longer RTO codes
  // Example: TG0123220240009352
  /^[A-Z]{2}\d{4}\d{4}\d{7}$/,
  
  // === FORMATS WITH SEPARATORS ===
  
  // With hyphens: TG-01-2024-0009352
  /^[A-Z]{2}\-\d{2}\-\d{4}\-\d{7}$/,
  /^[A-Z]{2}\-\d{3}\-\d{4}\-\d{7}$/,
  /^[A-Z]{2}\-\d{4}\-\d{4}\-\d{7}$/,
  
  // With spaces: TG 01 2024 0009352  
  /^[A-Z]{2}\s\d{2}\s\d{4}\s\d{7}$/,
  /^[A-Z]{2}\s\d{3}\s\d{4}\s\d{7}$/,
  /^[A-Z]{2}\s\d{4}\s\d{4}\s\d{7}$/,
  
  // Mixed separators: TG-01 2024-0009352
  /^[A-Z]{2}\-\d{2}\s\d{4}\-\d{7}$/,
  /^[A-Z]{2}\s\d{2}\-\d{4}\s\d{7}$/,
  
  // === OLD FORMATS (Pre-2018) with 2-digit years ===
  
  // Legacy format: TG + RTO + 2-digit year + 7-digit serial
  // Example: TG0724001234 or TG07240001234
  /^[A-Z]{2}\d{2}\d{2}\d{7}$/,
  /^[A-Z]{2}\d{3}\d{2}\d{7}$/,
  
  // With separators
  /^[A-Z]{2}\-\d{2}\-\d{2}\-\d{7}$/,
  /^[A-Z]{2}\s\d{2}\s\d{2}\s\d{7}$/,
  /^[A-Z]{2}\-\d{3}\-\d{2}\-\d{7}$/,
  /^[A-Z]{2}\s\d{3}\s\d{2}\s\d{7}$/,
  
  // === SPECIFIC STATE PATTERNS ===
  
  // Telangana specific patterns
  /^TG\d{2,4}\d{4}\d{7}$/,
  /^TG\-\d{2,4}\-\d{4}\-\d{7}$/,
  /^TG\s\d{2,4}\s\d{4}\s\d{7}$/,
  
  // Andhra Pradesh (still valid for some)
  /^AP\d{2,4}\d{4}\d{7}$/,
  /^AP\-\d{2,4}\-\d{4}\-\d{7}$/,
  /^AP\s\d{2,4}\s\d{4}\s\d{7}$/,
  
  // Telangana State (transitional period)
  /^TS\d{2,4}\d{4}\d{7}$/,
  /^TS\-\d{2,4}\-\d{4}\-\d{7}$/,
  /^TS\s\d{2,4}\s\d{4}\s\d{7}$/,
  
  // === VERY FLEXIBLE PATTERNS for edge cases ===
  
  // Any Indian state + flexible RTO + 4-digit year + 7-digit serial
  /^[A-Z]{2}\d{2,5}(19|20)\d{2}\d{7}$/,
  
  // With any separators
  /^[A-Z]{2}[\-\s]?\d{2,5}[\-\s]?(19|20)\d{2}[\-\s]?\d{7}$/,
  
  // === ULTRA FLEXIBLE (catches most valid licenses) ===
  
  // State + RTO + Year + Serial with flexible separators and lengths
  /^[A-Z]{2}[\-\s]?\d{2,5}[\-\s]?\d{2,4}[\-\s]?\d{6,8}$/,
];

// List of valid Indian state codes for better validation
export const validStateCodes = [
  'TG', 'TS', 'AP', 'KA', 'TN', 'KL', 'MH', 'GJ', 'RJ', 'MP', 'UP', 'BR', 'JH', 'WB', 
  'OR', 'CG', 'HR', 'PB', 'HP', 'JK', 'UK', 'GA', 'MN', 'ML', 'AS', 'NL', 'MZ', 'TR', 
  'SK', 'AR', 'DL', 'CH', 'AN', 'DN', 'DD', 'LD', 'PY'
];

// Username pattern: 8-16 characters, letters, numbers, underscore only
export const usernamePattern = /^[a-zA-Z0-9_]{8,16}$/;

// Phone number pattern: exactly 10 digits
export const phonePattern = /^\d{10}$/;

// Name pattern: letters, spaces, hyphens, dots only
export const namePattern = /^[a-zA-Z\s\-\.]{2,50}$/;

// Enhanced validation functions

export function validateCreateTripForm(data) {
  const errors = {};
  const requiredFields = [
    "startLocation",
    "endLocation", 
    "date",
    "time",
    "vehicleType",
    "vehicleNumber",
    "licenseNumber",
  ];

  // Check required fields
  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors[field] = `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`;
    }
  });

  // Validate seats for cars
  if (data.vehicleType === "Car") {
    if (!data.seatsAvailable || Number(data.seatsAvailable) <= 0) {
      errors.seatsAvailable = "Please specify number of seats available for cars";
    } else if (Number(data.seatsAvailable) > 8) {
      errors.seatsAvailable = "Maximum 8 seats allowed for cars";
    }
  }

  // Validate locations are different
  if (data.startLocation && data.endLocation) {
    if (data.startLocation.toLowerCase().trim() === data.endLocation.toLowerCase().trim()) {
      errors.endLocation = "Start and end locations cannot be the same";
    }
  }

  // Validate date and time
  if (data.date && data.time) {
    const selectedDateTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year in advance

    if (selectedDateTime <= now) {
      errors.date = "Trip date and time must be in the future";
    } else if (selectedDateTime > maxDate) {
      errors.date = "Cannot schedule trips more than 1 year in advance";
    }

    // Check if time is too soon (at least 30 minutes from now)
    const timeDiff = selectedDateTime.getTime() - now.getTime();
    if (timeDiff < 30 * 60 * 1000) { // 30 minutes in milliseconds
      errors.time = "Please schedule at least 30 minutes in advance";
    }
  }

  // Validate vehicle number
  if (data.vehicleNumber && !validateVehicleNumber(data.vehicleNumber)) {
    errors.vehicleNumber = "Vehicle number must be in format TG07HD2006 or TS07HD2006";
  }

  // Validate license number with comprehensive patterns
  if (data.licenseNumber && !validateLicenseNumber(data.licenseNumber)) {
    errors.licenseNumber = "Please enter a valid Indian driving license number";
  }

  // Validate description length
  if (data.description && data.description.length > 500) {
    errors.description = "Description cannot exceed 500 characters";
  }

  return errors;
}

export function validateUsername(username) {
  if (!username) {
    return "Username is required";
  }

  if (username.length < 8) {
    return "Username must be at least 8 characters long";
  }

  if (username.length > 16) {
    return "Username cannot exceed 16 characters";
  }

  if (!usernamePattern.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }

  // Check for profanity or inappropriate words (basic check)
  const inappropriateWords = ['admin', 'root', 'system', 'null', 'undefined'];
  if (inappropriateWords.some(word => username.toLowerCase().includes(word))) {
    return "Username contains inappropriate content";
  }

  return null;
}

export function validatePhone(phone) {
  if (!phone) {
    return "Phone number is required";
  }

  if (!phonePattern.test(phone)) {
    return "Phone number must be exactly 10 digits";
  }

  // Check if it starts with valid Indian mobile number prefix
  const validPrefixes = ['6', '7', '8', '9'];
  if (!validPrefixes.includes(phone[0])) {
    return "Please enter a valid Indian mobile number";
  }

  return null;
}

export function validateName(name) {
  if (!name) {
    return "Name is required";
  }

  if (name.length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (name.length > 50) {
    return "Name cannot exceed 50 characters";
  }

  if (!namePattern.test(name)) {
    return "Name can only contain letters, spaces, hyphens, and dots";
  }

  return null;
}

export function validateVehicleNumber(vehicleNumber) {
  if (!vehicleNumber) return false;
  const cleaned = vehicleNumber.toUpperCase().replace(/[\s\-]/g, '');
  return vehicleNumberPattern.test(cleaned);
}

// ENHANCED LICENSE VALIDATION - Now supports your friend's format!
export function validateLicenseNumber(licenseNumber) {
  if (!licenseNumber) return false;
  
  // Clean the license number - remove spaces and hyphens for testing
  const cleaned = licenseNumber.toUpperCase().replace(/[\s\-]/g, '');
  
  // Test against all patterns
  const isValid = licenseNumberPatterns.some(pattern => {
    // Test both cleaned and original formats
    return pattern.test(cleaned) || pattern.test(licenseNumber.toUpperCase());
  });
  
  if (!isValid) return false;
  
  // Additional validation: check if state code is valid
  const stateCode = cleaned.substring(0, 2);
  if (!validStateCodes.includes(stateCode)) {
    return false;
  }
  
  // Length validation (most Indian licenses are 13-17 characters)
  if (cleaned.length < 13 || cleaned.length > 17) {
    return false;
  }
  
  return true;
}

export function validateProfileForm(data) {
  const errors = {};
  const requiredFields = ["name", "username", "gender", "phone"];
  
  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors[field] = `Please enter ${field}`;
    }
  });

  // Name validation
  const nameError = validateName(data.name);
  if (nameError) {
    errors.name = nameError;
  }

  // Username validation
  const usernameError = validateUsername(data.username);
  if (usernameError) {
    errors.username = usernameError;
  }

  // Phone validation
  const phoneError = validatePhone(data.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  // Gender validation
  const validGenders = ["Male", "Female", "Other", "Prefer not to say"];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.gender = "Please select a valid gender option";
  }

  // Vehicle details validation if user has vehicle
  if (data.hasVehicle) {
    if (!data.vehicleNumber || !data.licenseNumber) {
      if (!data.vehicleNumber) errors.vehicleNumber = "Vehicle number is required";
      if (!data.licenseNumber) errors.licenseNumber = "License number is required";
    } else {
      // Validate vehicle number format
      if (!validateVehicleNumber(data.vehicleNumber)) {
        errors.vehicleNumber = "Vehicle number must be in format TG07HD2006 or TS07HD2006";
      }

      // Validate license number format with comprehensive patterns
      if (!validateLicenseNumber(data.licenseNumber)) {
        errors.licenseNumber = "Please enter a valid Indian driving license number";
      }
    }

    // Vehicle model validation (optional but if provided should be reasonable)
    if (data.vehicleModel) {
      if (data.vehicleModel.length < 2) {
        errors.vehicleModel = "Vehicle model must be at least 2 characters";
      } else if (data.vehicleModel.length > 50) {
        errors.vehicleModel = "Vehicle model cannot exceed 50 characters";
      }
    }
  }

  return errors;
}

// Enhanced helper functions

export function formatLicenseNumber(license) {
  if (!license) return '';
  
  // Remove all non-alphanumeric characters
  const cleaned = license.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try to format based on length and pattern
  if (cleaned.length >= 15) {
    // Try different formatting patterns
    
    // 15-char format: TG + 2 + 4 + 7 = TG07 2024 0001234
    if (cleaned.length === 15) {
      const state = cleaned.substring(0, 2);
      const rto = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      const serial = cleaned.substring(8);
      return `${state}${rto} ${year} ${serial}`;
    }
    
    // 16-char format: TG + 3 + 4 + 7 = TG013 2024 0001234  
    if (cleaned.length === 16) {
      const state = cleaned.substring(0, 2);
      const rto = cleaned.substring(2, 5);
      const year = cleaned.substring(5, 9);
      const serial = cleaned.substring(9);
      return `${state}${rto} ${year} ${serial}`;
    }
    
    // 17-char format: TG + 4 + 4 + 7 = TG0123 2024 0001234
    if (cleaned.length === 17) {
      const state = cleaned.substring(0, 2);
      const rto = cleaned.substring(2, 6);
      const year = cleaned.substring(6, 10);
      const serial = cleaned.substring(10);
      return `${state}${rto} ${year} ${serial}`;
    }
  }
  
  // For shorter or other formats, return cleaned version
  return cleaned;
}

export function formatVehicleNumber(vehicleNumber) {
  if (!vehicleNumber) return '';
  
  // Remove all non-alphanumeric characters
  const cleaned = vehicleNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try to format as TG XX XX XXXX (standard display format)
  if (cleaned.length >= 10) {
    const state = cleaned.substring(0, 2);
    const rto = cleaned.substring(2, 4);
    const series = cleaned.substring(4, 6);
    const number = cleaned.substring(6);
    return `${state} ${rto} ${series} ${number}`;
  }
  
  // For partial input, return as-is but cleaned
  return cleaned;
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX XXX XXXX for display
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return cleaned;
}

// Test function to verify specific license numbers
export function testLicenseNumber(licenseNumber) {
  console.log(`Testing license: ${licenseNumber}`);
  console.log(`Is valid: ${validateLicenseNumber(licenseNumber)}`);
  console.log(`Formatted: ${formatLicenseNumber(licenseNumber)}`);
  return validateLicenseNumber(licenseNumber);
}

// Additional validation helpers

export function validateEmail(email) {
  if (!email) return "Email is required";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  if (email.length > 254) {
    return "Email address is too long";
  }
  return null;
}

export function validateTripDescription(description) {
  if (!description) return null; // Description is optional
  if (description.length > 500) {
    return "Description cannot exceed 500 characters";
  }
  if (description.length < 10) {
    return "Description should be at least 10 characters for meaningful information";
  }
  return null;
}

export function validateLocation(location, fieldName = "location") {
  if (!location) return `${fieldName} is required`;
  if (location.length < 3) {
    return `${fieldName} must be at least 3 characters long`;
  }
  if (location.length > 100) {
    return `${fieldName} cannot exceed 100 characters`;
  }
  return null;
}

export function validateTripTime(date, time) {
  if (!date || !time) {
    return "Both date and time are required";
  }

  const selectedDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  
  if (isNaN(selectedDateTime.getTime())) {
    return "Invalid date or time format";
  }

  if (selectedDateTime <= now) {
    return "Trip date and time must be in the future";
  }

  // Check if time is too soon (at least 30 minutes from now)
  const timeDiff = selectedDateTime.getTime() - now.getTime();
  if (timeDiff < 30 * 60 * 1000) {
    return "Please schedule at least 30 minutes in advance";
  }

  // Check if too far in future (1 year max)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (selectedDateTime > maxDate) {
    return "Cannot schedule trips more than 1 year in advance";
  }

  return null;
}