export const fetchAnuncios = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    titulo: "Buscamos Baterista potente para banda de Indie Rock",
                    descripcion: "Tenemos local propio equipado en Madrid. Repertorio de 10 temas propios listos para grabar disco y tocar en festivales.",
                    instrumento: "Batería",
                    categoria: "Banda busca Músico",
                    ciudad: "Madrid",
                    autor: "Carlos R.",
                    autorInitials: "CR",
                    avatarBg: "bg-orange-500 text-zinc-950",
                    fecha: "Hace 2 horas"
                },
                {
                    id: 2,
                    titulo: "Guitarrista solicita formación de Jazz / Fusion",
                    descripcion: "Más de 8 años de experiencia. Lectura de partituras, improvisación y equipo propio. Disponibilidad para bolos semanales.",
                    instrumento: "Guitarra Eléctrica",
                    categoria: "Busca Banda",
                    ciudad: "Barcelona",
                    autor: "Javier P.",
                    autorInitials: "JP",
                    avatarBg: "bg-emerald-400 text-zinc-950",
                    fecha: "Ayer"
                },
                {
                    id: 3,
                    titulo: "Vocalista Soul / R&B para dúo acústico",
                    descripcion: "Busco teclista o guitarrista acústico para armar repertorio de versiones y tocar en salas locales y eventos.",
                    instrumento: "Voz",
                    categoria: "Proyecto Nuevo",
                    ciudad: "Valencia",
                    autor: "Marina S.",
                    autorInitials: "MS",
                    avatarBg: "bg-purple-400 text-zinc-950",
                    fecha: "Hace 3 días"
                }
            ]);
        }, 600);
    });
};