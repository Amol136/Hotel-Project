const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

export async function apiFetch(endpoint, options = {}) {
  const savedUser = localStorage.getItem("loggedInUser");

  let token = null;

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      token = user?.token || null;
    } catch (error) {
      console.error("Invalid loggedInUser data:", error);
    }
  }

  const headers = new Headers(options.headers || {});

  // FormData असल्यास Content-Type manually set करू नका.
  // Browser boundary स्वतः तयार करतो.
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body) {
    if (!headers.has("Content-Type")) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  return response;
}