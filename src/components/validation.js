
export const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/; // e.g., TS08HD2006
export const licenseNumberPattern = /^DL[-\s]?[A-Z0-9]{13}$/i; // e.g., DL-142011223344 (16 chars incl. 'DL-')
export const usernamePattern = /^[a-zA-Z0-9_]{8,16}$/; // 8-16 characters: letters, numbers, underscore

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

  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors[field] = `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`;
    }
  });

  // Only validate seats for cars
  if (data.vehicleType === "Car") {
    if (!data.seatsAvailable || Number(data.seatsAvailable) <= 0) {
      errors.seatsAvailable = "Please specify number of seats available for cars";
    }
  }

  if (data.vehicleNumber && !vehicleNumberPattern.test(data.vehicleNumber)) {
    errors.vehicleNumber = "Vehicle number must be in the format TS08HD2006";
  }

  if (data.licenseNumber) {
    if (data.licenseNumber.length !== 16) {
      errors.licenseNumber = "License number must be exactly 16 characters";
    } else if (!licenseNumberPattern.test(data.licenseNumber)) {
      errors.licenseNumber = "License number invalid, e.g., 'DL-142011223344'";
    }
  }

  return errors;
}

export function validateUsername(username) {
  if (!usernamePattern.test(username)) {
    return "Username must be 8-16 characters long and contain only letters, numbers, and underscores";
  }
  return null;
}

export function validatePhone(phone) {
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phone)) {
    return "Phone number must be exactly 10 digits";
  }
  return null;
}

export function validateProfileForm(data) {
  const errors = {};
  const requiredFields = ["name", "username", "gender", "phone"];

  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors[field] = `Please enter ${field}`;
    }
  });

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

  // Vehicle details validation if user has vehicle
  if (data.hasVehicle) {
    if (!data.vehicleNumber || !data.licenseNumber) {
      if (!data.vehicleNumber) errors.vehicleNumber = "Vehicle number is required";
      if (!data.licenseNumber) errors.licenseNumber = "License number is required";
    } else {
      if (!vehicleNumberPattern.test(data.vehicleNumber)) {
        errors.vehicleNumber = "Vehicle number must be in the format TS08HD2006";
      }

      if (data.licenseNumber.length !== 16 || !licenseNumberPattern.test(data.licenseNumber)) {
        errors.licenseNumber = "License number invalid, e.g., 'DL-142011223344'";
      }
    }
  }

  return errors;
}