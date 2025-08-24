// src/components/validation.js

export const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/; // e.g., TS08HD2006

export const licenseNumberPattern = /^DL[-\s]?[A-Z0-9]{13}$/i; // e.g., DL-142011223344 (16 chars incl. 'DL-')

export function validateCreateTripForm(data) {
  const errors = {};
  const requiredFields = [
    "startLocation",
    "endLocation",
    "date",
    "time",
    "vehicleType",
    "seatsAvailable",
    "vehicleNumber",
    "licenseNumber",
  ];
  requiredFields.forEach((field) => {
    if (!data[field] || String(data[field]).trim() === "") {
      errors[field] = `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`;
    }
  });

  if (data.seatsAvailable && Number(data.seatsAvailable) <= 0) {
    errors.seatsAvailable = "Seats must be at least 1";
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
