// Simulación de persistencia de usuario en localStorage
export const authService = {
    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const user = {
                        id: "user-1",
                        nombre: "Carlos Rodríguez",
                        email: email,
                        instrumento: "Guitarra",
                        avatarBg: "bg-orange-500 text-zinc-950",
                        initials: "CR",
                    };
                    localStorage.setItem("ensamblia_user", JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error("Por favor introduce credenciales válidas."));
                }
            }, 600);
        });
    },

    register: async (userData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (userData.email && userData.password && userData.nombre) {
                    const user = {
                        id: `user-${Date.now()}`,
                        nombre: userData.nombre,
                        email: userData.email,
                        instrumento: userData.instrumento || "Músico",
                        avatarBg: "bg-emerald-400 text-zinc-950",
                        initials: userData.nombre.substring(0, 2).toUpperCase(),
                    };
                    localStorage.setItem("ensamblia_user", JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error("Por favor completa todos los campos requeridos."));
                }
            }, 600);
        });
    },

    logout: () => {
        localStorage.removeItem("ensamblia_user");
    },

    getCurrentUser: () => {
        const user = localStorage.getItem("ensamblia_user");
        return user ? JSON.parse(user) : null;
    },
};