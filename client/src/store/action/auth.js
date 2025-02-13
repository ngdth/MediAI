export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');
const token = getToken();

const response = await fetch("http://localhost:8080/api/protected-route", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`,
    },
});
