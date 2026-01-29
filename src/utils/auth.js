export const saveUser = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const getRole = () => localStorage.getItem('role');
export const logout = () => localStorage.clear();
export const isLoggedIn = () => !!localStorage.getItem('token');
