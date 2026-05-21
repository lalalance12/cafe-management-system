/** Plain-language messages for purchase order flows */

export function poDraftSavedMessage(): string {
  return "Purchase order saved as draft.";
}

export function poSubmittedMessage(hasDeliveryDate: boolean): string {
  return hasDeliveryDate
    ? "Purchase order submitted. Expected delivery date saved."
    : "Purchase order submitted to supplier.";
}

export function poReceivedMessage(): string {
  return "Purchase order received. Stock levels updated.";
}

export function poCancelledMessage(): string {
  return "Purchase order cancelled.";
}

export function poFormValidationMessage(): string {
  return "Please select a supplier, add at least one line item, and check quantities.";
}

export function poActionErrorMessage(rawError: string): string {
  const message = rawError.trim().toLowerCase();

  if (message.includes("signed in") || message.includes("unauthorized")) {
    return "Please sign in again, then try again.";
  }

  if (message.includes("no branch assignment")) {
    return "Your account is not assigned to a branch. Contact your manager.";
  }

  if (
    message.includes("permission") ||
    message.includes("policy") ||
    message.includes("row-level")
  ) {
    return "You do not have permission to change purchase orders. Contact your manager if this seems wrong.";
  }

  if (
    message.includes("only draft") ||
    message.includes("only submitted")
  ) {
    return "This purchase order cannot be updated in its current status. Refresh the list and try again.";
  }

  if (message.includes("not found")) {
    return "This purchase order could not be found. It may have been removed.";
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "We could not reach the server. Check your connection and try again.";
  }

  if (message.includes("at least one line item")) {
    return "Add at least one item before saving the purchase order.";
  }

  if (message.includes("select a supplier")) {
    return "Please select a supplier before saving.";
  }

  return "Something went wrong with this purchase order. Please try again.";
}
