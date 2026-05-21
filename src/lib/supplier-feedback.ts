/** Plain-language messages for supplier save flows */

export function supplierSaveSuccessMessage(isEditing: boolean): string {
  return isEditing
    ? "Supplier updated successfully."
    : "Supplier added successfully.";
}

export function supplierSaveErrorMessage(rawError: string): string {
  const message = rawError.trim().toLowerCase();

  if (message.includes("signed in") || message.includes("unauthorized")) {
    return "Please sign in again, then try saving the supplier.";
  }

  if (
    message.includes("duplicate") ||
    message.includes("unique") ||
    message.includes("already exists")
  ) {
    return "A supplier with these details may already exist. Check the name and try again.";
  }

  if (
    message.includes("permission") ||
    message.includes("policy") ||
    message.includes("row-level")
  ) {
    return "You do not have permission to change suppliers. Contact your manager if this seems wrong.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "We could not reach the server. Check your connection and try again.";
  }

  if (message.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("supplier name is required")) {
    return "Please enter a supplier name.";
  }

  if (message.includes("invalid supplier")) {
    return "Please check the form fields and try again.";
  }

  return "We could not save this supplier. Please review the form and try again.";
}
