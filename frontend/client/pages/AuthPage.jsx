import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import { Eye, EyeOff, Heart, Guitar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
    const [mode, setMode] = useState(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estados del formulario
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [instrumento, setInstrumento] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === "login") {
                const user = await authService.login(usuario, password);
                toast.success(`¡Bienvenido de nuevo, ${user.nombre}!`);
            } else {
                const user = await authService.register({
                    nombre,
                    email: usuario,
                    password,
                    instrumento,
                });
                toast.success(`¡Cuenta creada con éxito! Bienvenido a Ensamblia.`);
            }
            navigate("/anuncios");
        } catch (err) {
            toast.error(err.message || "Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white text-zinc-900 font-sans overflow-hidden">

            {/* ================= COLUMNA IZQUIERDA: FORMULARIO ================= */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-white z-10">

                {/* Header superior */}
                <div className="flex items-center justify-between w-full">
                    <Link to="/" className="flex items-center gap-2 font-black text-lg tracking-tight text-zinc-950">
                        <span className="w-5 h-5 bg-yellow-400 flex items-center justify-center rounded-sm text-zinc-950 font-bold text-[10px]">
                            ✦
                        </span>
                        ENSAMBLIA
                    </Link>
                    <Link
                        to="/"
                        className="text-sm font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
                    >
                        Volver a la web
                    </Link>
                </div>

                {/* Bloque Central de Formulario */}
                <div className="max-w-md w-full mx-auto my-auto py-8">
                    <h1 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight mb-3">
                        {mode === "login" ? "Vuelve al escenario" : "Únete al escenario"}
                    </h1>
                    <p className="text-zinc-600 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
                        {mode === "login"
                            ? "Entra para ver quién ha respondido a tus anuncios y qué se cuece cerca de ti."
                            : "Crea tu cuenta gratis para publicar anuncios, hacer match y conectar con otros músicos."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Campo Nombre (solo Registro) */}
                        {mode === "register" && (
                            <div>
                                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Tu nombre o alias"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-zinc-900 transition-all"
                                />
                            </div>
                        )}

                        {/* Campo Usuario / Email */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                                {mode === "login" ? "Usuario" : "Correo electrónico"}
                            </label>
                            <input
                                type={mode === "login" ? "text" : "email"}
                                required
                                placeholder={mode === "login" ? "tu_usuario" : "tu@email.com"}
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className="w-full bg-white border-2 border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-[0_0_0_2px_rgba(250,204,21,0.5)]"
                            />
                        </div>

                        {/* Campo Instrumento (solo Registro) */}
                        {mode === "register" && (
                            <div>
                                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                                    Instrumento principal
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej. Batería, Guitarra, Voz..."
                                    value={instrumento}
                                    onChange={(e) => setInstrumento(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-zinc-900 transition-all"
                                />
                            </div>
                        )}

                        {/* Campo Contraseña */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 pr-11 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-zinc-900 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Botón Entrar / Registrarse */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1e2320] hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 uppercase tracking-wider text-xs shadow-md border-b-2 border-yellow-400 flex items-center justify-center gap-2 mt-6 cursor-pointer"
                        >
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : mode === "login" ? (
                                "ENTRAR"
                            ) : (
                                "CREAR CUENTA"
                            )}
                        </button>
                    </form>

                    {/* Alternar entre Login y Registro */}
                    <div className="mt-6 text-sm text-zinc-600">
                        {mode === "login" ? (
                            <>
                                ¿Aún no tienes cuenta?{" "}
                                <button
                                    onClick={() => setMode("register")}
                                    className="font-bold text-zinc-950 underline decoration-yellow-400 decoration-2 underline-offset-2 hover:text-black transition-colors cursor-pointer"
                                >
                                    Crea una gratis
                                </button>
                            </>
                        ) : (
                            <>
                                ¿Ya tienes cuenta?{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="font-bold text-zinc-950 underline decoration-yellow-400 decoration-2 underline-offset-2 hover:text-black transition-colors cursor-pointer"
                                >
                                    Inicia sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="hidden lg:block text-xs text-zinc-400">
                    © {new Date().getFullYear()} Ensamblia
                </div>
            </div>

            {/* ================= COLUMNA DERECHA: BANNER AMARILLO ================= */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#facc15] relative overflow-hidden flex-col justify-between p-16 select-none">

                {/* Círculo concéntrico gigante de fondo */}
                <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full border border-yellow-500/30 pointer-events-none" />
                <div className="absolute -top-16 -right-16 w-[550px] h-[550px] rounded-full border border-yellow-500/20 pointer-events-none" />

                {/* Título gigante */}
                <div className="relative z-10 pt-10 max-w-lg">
                    <h2 className="text-6xl font-black text-zinc-950 tracking-tight leading-[1.02]">
                        Tu próxima banda está a un mensaje.
                    </h2>
                </div>

                {/* Tarjetas flotantes con la disposicion escalonada exacta */}
                <div className="relative z-10 space-y-4 max-w-sm ml-auto mr-12 mb-6">

                    {/* Tarjeta 1 */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-zinc-100 flex items-center justify-between transform translate-x-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#fcd34d] text-zinc-900 font-bold flex items-center justify-center text-sm">
                                M
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                                    Marina · Indie
                                </h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <span>📍 Valencia</span> · 92% match
                                </p>
                            </div>
                        </div>
                        <button className="text-zinc-600 hover:text-rose-500 transition-colors p-1">
                            <Heart size={18} />
                        </button>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-zinc-100 flex items-center justify-between transform -translate-x-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#cbd5e1] text-zinc-900 font-bold flex items-center justify-center text-sm">
                                A
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                                    Alex · Rock
                                </h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <span>📍 Barcelonès</span> · 88% match
                                </p>
                            </div>
                        </div>
                        <button className="text-zinc-600 transition-colors p-1">
                            <Guitar size={18} />
                        </button>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-zinc-100 flex items-center justify-between transform translate-x-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#d1fae5] text-zinc-900 font-bold flex items-center justify-center text-sm">
                                L
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                                    Leo busca batería
                                </h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <span>📍 Pop alternativo</span> · a 2 km
                                </p>
                            </div>
                        </div>
                        <button className="text-zinc-600 transition-colors p-1">
                            <Guitar size={18} />
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}