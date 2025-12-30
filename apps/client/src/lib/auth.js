export function saveAuth({ accessToken, user }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin() {
  const user = getUser();
  return user?.role === "admin";
}