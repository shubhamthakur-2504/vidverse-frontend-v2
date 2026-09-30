type ApiErrorBody = {
  message?: string;
  errors?: { field?: string; message?: string }[];
};

// human-readable message for a failed API call: the first field error when the API sent
// validation details (e.g. "Password must be at least 8 characters"), otherwise its message
export function getApiErrorMessage(
  error: unknown,
  fallback = "Please try again."
): string {
  if (error && typeof error === "object") {
    const { response, message } = error as {
      response?: { data?: ApiErrorBody };
      message?: string;
    };
    const data = response?.data;
    return (
      data?.errors?.find((e) => e?.message)?.message ||
      data?.message ||
      message ||
      fallback
    );
  }
  return fallback;
}
