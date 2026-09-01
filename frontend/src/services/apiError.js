export function getApiErrorType(error) {
  if (!error.response) {
    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message?.toLowerCase().includes("timeout")
    ) {
      return "timeout";
    }

    return "network";
  }

  const status = error.response.status;

  if (status === 401) {
    return "unauthorized";
  }

  if (status === 403) {
    return "forbidden";
  }

  if (status >= 500) {
    return "server";
  }

  return "other";
}

export function getApiErrorMessage(error) {
  const type = getApiErrorType(error);

  switch (type) {
    case "timeout":
      return {
        title: "Request timed out",
        message:
          "The server took too long to respond. Please check your connection and try again.",
        action: "Retry",
      };

    case "unauthorized":
      return {
        title: "Session expired",
        message: "Your session has expired. Please sign in again to continue.",
        action: "Sign in again",
      };

    case "forbidden":
      return {
        title: "Permission denied",
        message:
          "You do not have permission to upload or process this document.",
        action: "Go back",
      };

    case "server":
      return {
        title: "Server error",
        message:
          "The server is temporarily unavailable. Please try again in a moment.",
        action: "Retry",
      };

    default:
      return {
        title: "Request failed",
        message:
          error.response?.data?.message ||
          "The request could not be completed.",
        action: "Retry",
      };
  }
}
