"""
Datos de EJEMPLO para enseñar la web (issue #80). Todo es ficticio.

    python manage.py seed_demo            # crea (o completa) los datos demo
    python manage.py seed_demo --borrar   # quita solo lo que creó este comando

Reglas:
- No toca catálogos ni usuarios reales: solo crea/borra cuentas con nickname `demo_…`
  (correo `…@ejemplo.test`). Se puede repetir sin duplicar.
- Contraseña común de todas las cuentas demo: DEMO_PASSWORD (se imprime al terminar).
- Se niega a ejecutarse si DEBUG es False (producción).
- Los municipios, comarcas y estilos salen del catálogo de las migraciones.
"""
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.anuncios.models import Anuncio, Comentario, TipoAnuncio
from apps.catalogo.models import Ciudad, GeneroMusical, Instrumento
from apps.chats.models import Chat, Mensaje, MensajeLeido
from apps.eventos.models import Evento
from apps.locales.models import Local
from apps.matching.models import BusquedaAnuncio
from apps.perfiles.models import Perfil, PerfilChat, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.models import Usuario

PREFIJO = 'demo_'
DOMINIO = '@ejemplo.test'
DEMO_PASSWORD = 'DemoEnsamblia2026'

# (nick, nombre, apellido, municipio, instrumentos, estilos, edad, descripción)
MUSICOS = [
    ('nuria', 'Nuria', 'Puig', 'Barcelona', ['Batería'], ['Rock alternativo', 'Indie'], 29,
     'Batería con ocho años de escenarios. Busco proyecto de rock o indie en Barcelona.'),
    ('jordi', 'Jordi', 'Ferrer', 'Sabadell', ['Guitarra'], ['Rock', 'Blues'], 34,
     'Guitarrista de blues y rock clásico. Tengo local de ensayo propio y ganas de tocar en directo.'),
    ('laia', 'Laia', 'Serra', 'Girona', ['Voz', 'Guitarra'], ['Cantautor', 'Folk'], 26,
     'Cantautora en catalán y castellano. Escribo mis canciones y busco gente para arreglarlas.'),
    ('marc', 'Marc', 'Vidal', 'Terrassa', ['Bajo'], ['Funk', 'Soul', 'Jazz'], 31,
     'Bajista de groove. Funk, soul y jazz. Disponible para ensayos entre semana por la tarde.'),
    ('clara', 'Clara', 'Roca', 'Tarragona', ['Piano', 'Teclados'], ['Jazz', 'Bossa nova'], 38,
     'Pianista de formación clásica metida en el jazz. Doy clases y toco en cuartetos.'),
    ('pau', 'Pau', 'Soler', 'Lleida', ['Guitarra'], ['Punk', 'Ska'], 24,
     'Guitarra rítmica de punk y ska. Busco banda con ganas de girar por Ponent.'),
    ('aina', 'Aina', 'Costa', 'Manresa', ['Violín'], ['Folk', 'Música tradicional', 'Clásica'], 27,
     'Violinista. Folk, música tradicional y colaboraciones en estudio.'),
    ('oriol', 'Oriol', 'Mas', 'Granollers', ['Saxofón'], ['Jazz', 'Swing', 'Funk'], 41,
     'Saxofonista de jam sessions. Me apunto a bolos de jazz, swing y funk.'),
    ('irene', 'Irene', 'Casals', 'Barcelona', ['Voz'], ['Pop', 'Soul', 'R&B'], 28,
     'Cantante de pop y soul. Busco banda estable o músicos para montar proyecto propio.'),
    ('ferran', 'Ferran', 'Pons', 'Mataró', ['Batería'], ['Metal', 'Hard rock'], 33,
     'Batería de metal con doble bombo. Ensayo dos veces por semana.'),
    ('mireia', 'Mireia', 'Bosch', 'Vic', ['Teclados'], ['Electrónica', 'Ambient', 'Indie'], 30,
     'Teclados y sintes. Electrónica, ambient e indie. Hago bandas sonoras para corto.'),
    ('arnau', 'Arnau', 'Camps', 'Reus', ['Trompeta'], ['Ska', 'Reggae', 'Latina'], 35,
     'Trompetista de sección de vientos. Ska, reggae y música latina.'),
    ('judit', 'Judit', 'Molina', 'Igualada', ['Guitarra'], ['Flamenco', 'Rumba catalana'], 37,
     'Guitarra flamenca y de rumba catalana. Acompaño cante y toco en fiestas mayores.'),
    ('biel', 'Biel', 'Navarro', 'Figueres', ['Percusión'], ['Rumba catalana', 'Latina', 'Reggae'], 32,
     'Percusionista: cajón, congas y bongós. Busco grupo de rumba o música latina en Girona.'),
]

# (nick, nombre, municipio, estilos, descripción)
GRUPOS = [
    ('trencats', 'Trencats', 'Barcelona', ['Rock alternativo', 'Indie'],
     'Cuarteto de rock alternativo con canciones propias en catalán. Un EP grabado y bolos en salas pequeñas.'),
    ('marea_baixa', 'Marea Baixa', 'Girona', ['Pop', 'Indie'],
     'Trío de pop indie. Ensayamos en Girona los jueves y buscamos ampliar la formación.'),
    ('blues_bus', 'Blues Bus', 'Sabadell', ['Blues', 'Soul'],
     'Banda de blues y soul con versiones y temas propios. Tocamos en bares y festivales de la comarca.'),
    ('rumbeta', 'La Rumbeta', 'Granollers', ['Rumba catalana', 'Latina'],
     'Grupo de rumba catalana para fiestas mayores y celebraciones.'),
    ('ferro_vell', 'Ferro Vell', 'Mataró', ['Metal', 'Hard rock'],
     'Banda de metal y hard rock. Repertorio propio y alguna versión. Buscamos cantante.'),
]

# (nick, nombre, municipio, tipos, aforo, dirección, estilos, descripción)
LOCALES = [
    ('sala_mostra', 'Sala Mostra', 'Barcelona', ['sala'], 250, 'Carrer de l\'Exemple, 10',
     ['Rock', 'Indie', 'Pop'], 'Sala de conciertos de formato medio con backline y técnico de sonido.'),
    ('la_nau', 'Local d\'Assaig La Nau', 'Terrassa', ['ensayo'], 15, 'Carrer de la Prova, 3',
     ['Rock', 'Metal', 'Punk'], 'Salas de ensayo equipadas con batería, amplis y PA. Se alquilan por horas.'),
    ('la_cantonada', 'Bar La Cantonada', 'Girona', ['bar'], 80, 'Plaça de la Mostra, 1',
     ['Folk', 'Cantautor', 'Blues'], 'Bar con música en directo los fines de semana. Escenario pequeño y buen ambiente.'),
    ('auditori_demo', 'Auditori Demo', 'Tarragona', ['teatro'], 300, 'Avinguda de l\'Exemple, 45',
     ['Jazz', 'Clásica', 'Bossa nova'], 'Auditorio con acústica cuidada para jazz, clásica y música de cámara.'),
    ('estudi_soroll', 'Estudi Soroll', 'Sabadell', ['ensayo'], 20, 'Carrer del Soroll, 8',
     ['Rock alternativo', 'Hard rock', 'Funk'], 'Locales de ensayo y pequeño estudio de grabación.'),
    ('sala_riu', 'Sala Riu', 'Manresa', ['sala', 'bar'], 150, 'Passeig del Riu, 22',
     ['Ska', 'Reggae', 'Rumba catalana'], 'Sala con barra y programación de música en directo todo el año.'),
]

# Testimonios de ejemplo (aparecen en la portada vía /api/stats/). Son ficticios, como todo lo demo_
TESTIMONIOS = {
    'nuria': 'Me gusta poder filtrar por instrumento y por comarca: así veo enseguida quién toca cerca de mí.',
    'jordi': 'Lo que más uso son los anuncios: publico lo que busco y miro qué perfiles encajan.',
    'laia': 'Es cómodo tener perfiles, anuncios y mensajes en el mismo sitio para montar un proyecto.',
}

INSTRUMENTOS = ['Guitarra', 'Bajo', 'Batería', 'Piano', 'Voz', 'Saxofón', 'Trompeta', 'Violín', 'Teclados', 'Percusión']
TIPOS_ANUNCIO = ['Busco músico', 'Busco grupo', 'Vendo instrumento', 'Servicios']

BM, BG, VE, SV = TIPOS_ANUNCIO

# (autor, tipo, título, contenido, qué busca: (tipo_perfil, instrumento, estilos) o None, días atrás)
ANUNCIOS = [
    ('trencats', BM, 'Busco batería para grupo de rock alternativo',
     'Somos Trencats, cuarteto de Barcelona. Se nos va nuestro batería y buscamos relevo con ganas de ensayar dos veces por semana y tocar en salas. Rock alternativo e indie, canciones propias.',
     ('usuario', 'Batería', ['Rock alternativo', 'Indie']), 2),
    ('trencats', BM, 'Buscamos teclista para el segundo disco',
     'Queremos incorporar teclados y sintes para el próximo disco. Si te gusta el indie con capas y atmósferas, escríbenos.',
     ('usuario', 'Teclados', ['Indie']), 9),
    ('marea_baixa', BM, 'Busquem baixista per a trio de pop indie',
     'Som un trio de Girona i volem fer-nos quartet. Ensagem els dijous al vespre. Buscam algú amb ganes de proposar idees.',
     ('usuario', 'Bajo', ['Pop', 'Indie']), 4),
    ('marea_baixa', BM, 'Cantante o segunda voz para armonías',
     'Tenemos temas con muchas armonías vocales y nos falta una voz más. Nivel medio, ganas altas.',
     ('usuario', 'Voz', ['Pop']), 16),
    ('blues_bus', BM, 'Blues Bus busca armónica y teclados',
     'Banda de blues y soul de Sabadell. Tenemos bolos cerrados en primavera y queremos reforzar la formación.',
     ('usuario', 'Teclados', ['Blues', 'Soul']), 6),
    ('blues_bus', BM, 'Trompetista para sección de vientos',
     'Montamos una pequeña sección de vientos para los temas de soul. Se paga el caché de los bolos.',
     ('usuario', 'Trompeta', ['Soul', 'Blues']), 21),
    ('rumbeta', BM, 'La Rumbeta busca guitarra rumbera',
     'Grupo de rumba catalana para fiestas mayores. Necesitamos guitarra con compás y ganas de viajar los fines de semana.',
     ('usuario', 'Guitarra', ['Rumba catalana']), 3),
    ('rumbeta', BM, 'Percusionista para la temporada de verano',
     'Buscamos percusión (cajón o congas) para la temporada de verano. Tenemos ya doce fechas.',
     ('usuario', 'Percusión', ['Rumba catalana', 'Latina']), 12),
    ('ferro_vell', BM, 'Buscamos cantante de metal',
     'Ferro Vell necesita voz. Tenemos repertorio propio y local de ensayo en Mataró. Se valora voz rasgada y limpia.',
     ('usuario', 'Voz', ['Metal', 'Hard rock']), 5),
    ('ferro_vell', BM, 'Segunda guitarra para hard rock',
     'Buscamos segunda guitarra, nivel intermedio-alto. Influencias clásicas del hard rock.',
     ('usuario', 'Guitarra', ['Hard rock']), 25),
    ('nuria', BG, 'Batería busca banda de rock o indie en Barcelona',
     'Llevo ocho años tocando y me he quedado sin proyecto. Tengo kit propio y disponibilidad de tardes. Escucho propuestas serias.',
     ('grupo', 'Batería', ['Rock alternativo', 'Indie']), 1),
    ('jordi', BG, 'Guitarrista de blues busca grupo en el Vallès',
     'Toco desde hace veinte años y busco banda estable de blues o rock clásico. Tengo local de ensayo en Sabadell.',
     ('grupo', 'Guitarra', ['Blues', 'Rock']), 7),
    ('laia', BG, 'Cantautora busca músicos para arreglos',
     'Tengo ocho canciones y busco guitarra eléctrica, bajo y percusión para llevarlas a directo. Zona Girona.',
     ('usuario', None, ['Cantautor', 'Folk']), 10),
    ('marc', BG, 'Bajista de funk disponible para proyecto',
     'Busco banda de funk, soul o jazz con repertorio y bolos. Ensayo entre semana a partir de las 19h.',
     ('grupo', 'Bajo', ['Funk', 'Soul']), 14),
    ('pau', BG, 'Guitarra punk busca banda con ganas de girar',
     'Me gustan el punk y el ska rápido. Tengo furgoneta. Busco banda que quiera tocar fuera de Lleida.',
     ('grupo', 'Guitarra', ['Punk', 'Ska']), 18),
    ('irene', BG, 'Cantante de soul busca banda estable',
     'Cantante con experiencia en bodas y salas. Busco banda de soul/pop con repertorio propio o versiones cuidadas.',
     ('grupo', 'Voz', ['Soul', 'Pop']), 8),
    ('oriol', BG, 'Saxofonista para jam sessions y bolos de jazz',
     'Me apunto a jams, big band o formaciones pequeñas. Jazz, swing y funk. Zona Vallès y Barcelona.',
     ('grupo', 'Saxofón', ['Jazz', 'Swing']), 20),
    ('sala_mostra', BG, 'Sala Mostra busca grupos para el ciclo de otoño',
     'Programamos viernes y sábados de rock, indie y pop. Cachés a taquilla con mínimo garantizado. Enviad enlace a vuestra música.',
     ('grupo', None, ['Rock', 'Indie', 'Pop']), 3),
    ('la_cantonada', BG, 'Bar La Cantonada busca cantautores y duetos',
     'Música en directo los sábados al vespre. Formato acústico, escenario pequeño. Se paga un mínimo por actuación.',
     ('usuario', None, ['Cantautor', 'Folk', 'Blues']), 11),
    ('sala_riu', BG, 'Sala Riu busca bandas de ska y reggae',
     'Abrimos fechas de ska, reggae y rumba para la temporada de invierno. Backline disponible.',
     ('grupo', None, ['Ska', 'Reggae', 'Rumba catalana']), 15),
    ('auditori_demo', BG, 'Auditori Demo: convocatoria de jazz y música de cámara',
     'Recibimos propuestas de cuartetos y formaciones de cámara para la programación de invierno. Acústica cuidada y piano de cola.',
     ('grupo', None, ['Jazz', 'Clásica']), 22),
    ('estudi_soroll', SV, 'Local de ensayo en Sabadell por horas',
     'Sala equipada con batería, dos amplis de guitarra, bajo y PA. Reserva por horas, descuentos para bandas con abono mensual.',
     None, 5),
    ('la_nau', SV, 'Salas de ensayo en Terrassa, primera hora gratis',
     'Estrenamos salas nuevas. La primera hora de ensayo es gratis para bandas que no hayan venido antes.',
     None, 13),
    ('estudi_soroll', SV, 'Grabación de maquetas a buen precio',
     'Grabamos tu maqueta en una jornada: mezcla incluida. Pregunta por el pack para grupos.',
     None, 19),
    ('clara', SV, 'Clases de piano y teoría musical',
     'Clases individuales de piano, teoría y armonía jazz. Presenciales en Tarragona y online.',
     None, 17),
    ('mireia', SV, 'Música original para cortos y vídeo',
     'Compongo bandas sonoras para cortometrajes, vídeos corporativos y podcasts. Ambient, electrónica y piano.',
     None, 23),
    ('aina', SV, 'Violinista disponible para bodas y grabaciones',
     'Pongo violín en vivo para ceremonias, conciertos y grabaciones de estudio.',
     None, 26),
    ('jordi', VE, 'Vendo amplificador de válvulas',
     'Amplificador de guitarra de válvulas, 30W, en muy buen estado. Cambio de válvulas hecho este año. Recogida en Sabadell.',
     None, 4),
    ('pau', VE, 'Vendo guitarra eléctrica con funda',
     'Guitarra eléctrica tipo stratocaster con funda rígida y cable. Regalo cambio de cuerdas. Lleida, en mano.',
     None, 8),
    ('ferran', VE, 'Vendo juego de platos de batería',
     'Hi-hat, crash y ride en buen estado. Poco uso. Recogida en Mataró.',
     None, 27),
    ('marc', VE, 'Vendo bajo de cuatro cuerdas',
     'Bajo de cuatro cuerdas con pastillas activas. Sonido muy limpio. Incluyo funda.',
     None, 30),
    ('clara', VE, 'Vendo teclado de escenario de 88 teclas',
     'Piano de escenario con teclas contrapesadas y pedal de sustain. Ideal para directo.',
     None, 28),
    ('arnau', VE, 'Vendo trompeta con boquilla y estuche',
     'Trompeta en sib en buen estado, ideal para estudiante. Recogida en Reus.',
     None, 24),
    ('irene', BM, 'Busco guitarrista para proyecto de pop-soul propio',
     'Tengo canciones y quiero formar banda. Busco guitarra con buen gusto para arreglos. Barcelona.',
     ('usuario', 'Guitarra', ['Pop', 'Soul']), 6),
    ('mireia', BM, 'Busco voz para proyecto de electrónica',
     'Preparo un EP de electrónica y ambient y busco voz para tres temas. Zona Osona.',
     ('usuario', 'Voz', ['Electrónica', 'Ambient']), 12),
    ('judit', BM, 'Busco percusión y bajo para rumba flamenca',
     'Formación pequeña para tocar en fiestas mayores. Repertorio ya cerrado, ensayos por Igualada.',
     ('usuario', 'Percusión', ['Flamenco', 'Rumba catalana']), 10),
    ('biel', BG, 'Percusionista busca grupo de rumba o latina',
     'Toco cajón y congas y busco grupo con fechas. Tengo material de percusión propio.',
     ('grupo', 'Percusión', ['Rumba catalana', 'Latina']), 2),
    ('arnau', BG, 'Trompeta disponible para banda de ska',
     'Llevo años en secciones de vientos. Busco banda de ska o reggae con ganas de tocar en directo.',
     ('grupo', 'Trompeta', ['Ska', 'Reggae']), 13),
]

COMENTARIOS = [
    (0, 'nuria', 'Me interesa mucho, te escribo por mensaje privado.'),
    (0, 'ferran', 'Suerte con la búsqueda, buen proyecto.'),
    (2, 'marc', 'Em sona interessant, et parlo per privat.'),
    (10, 'trencats', 'Nos gusta tu perfil, hablamos.'),
    (11, 'blues_bus', '¿Tienes disponibilidad los sábados?'),
    (17, 'trencats', 'Nos encaja el formato, os escribimos.'),
    (17, 'marea_baixa', 'Mandamos enlace a nuestra música.'),
    (22, 'jordi', '¿Aún está disponible? Me interesa.'),
    (22, 'pau', 'Pregunta: ¿se puede probar antes?'),
    (24, 'nuria', '¿Sigue disponible?'),
    (25, 'ferran', 'Qué buen precio. ¿Haces envío?'),
    (31, 'laia', 'Me gustaría probar, te escribo.'),
]

# (autor, título, descripción, días desde hoy (negativo = pasado), hora, municipio,
#  local organizador, lugar, estilos, precio)
EVENTOS = [
    ('sala_mostra', 'Noche de rock alternativo', 'Dos bandas locales y DJ al final. Puertas a las 20:30.', 6, 21, 'Barcelona', True, '', ['Rock alternativo', 'Indie'], '8 €'),
    ('sala_mostra', 'Festival de bandas emergentes', 'Cuatro grupos, tres horas de música. Entrada anticipada disponible.', 20, 20, 'Barcelona', True, '', ['Rock', 'Pop', 'Indie'], '10 €'),
    ('sala_mostra', 'Sesión de maquetas', 'Escucha de maquetas en directo con comentarios de los técnicos de sala.', -9, 19, 'Barcelona', True, '', ['Indie'], 'Gratis'),
    ('la_cantonada', 'Sábado de cantautores', 'Tres cantautores, formato acústico. Aforo limitado.', 4, 21, 'Girona', True, '', ['Cantautor', 'Folk'], 'Gratis'),
    ('la_cantonada', 'Jam de blues', 'Jam abierta de blues. Ven con tu instrumento, hay backline.', 11, 21, 'Girona', True, '', ['Blues'], 'Gratis'),
    ('auditori_demo', 'Cuarteto de jazz en el auditorio', 'Concierto de jazz de cámara con piano de cola.', 14, 20, 'Tarragona', True, '', ['Jazz', 'Bossa nova'], '12 €'),
    ('auditori_demo', 'Ciclo de música de cámara', 'Primer concierto del ciclo de invierno.', 33, 19, 'Tarragona', True, '', ['Clásica'], '15 €'),
    ('sala_riu', 'Noche de ska y reggae', 'Dos bandas y selecta final.', 8, 22, 'Manresa', True, '', ['Ska', 'Reggae'], '6 €'),
    ('sala_riu', 'Rumba en directo', 'Rumba catalana y buen ambiente en la sala.', 27, 21, 'Manresa', True, '', ['Rumba catalana', 'Latina'], '5 €'),
    ('la_nau', 'Portes obertes de les sales d\'assaig', 'Visita las salas y prueba el equipo. Hay música en directo.', 10, 18, 'Terrassa', True, '', ['Rock', 'Metal'], 'Gratis'),
    ('estudi_soroll', 'Jornada de grabación abierta', 'Mira cómo se graba una maqueta y haz tus preguntas.', 17, 17, 'Sabadell', True, '', ['Rock alternativo'], 'Gratis'),
    ('trencats', 'Trencats presenta su EP', 'Presentación del EP con invitados. Entrada anticipada.', 7, 21, 'Barcelona', False, 'Sala Mostra', ['Rock alternativo', 'Indie'], '8 €'),
    ('trencats', 'Concierto en directo en Barcelona', 'Repertorio completo de canciones propias.', -14, 21, 'Barcelona', False, 'Sala Mostra', ['Rock alternativo'], '7 €'),
    ('marea_baixa', 'Marea Baixa en acústico', 'Sesión en formato acústico, duración 60 minutos.', 12, 20, 'Girona', False, 'Bar La Cantonada', ['Pop', 'Indie'], 'Gratis'),
    ('blues_bus', 'Blues Bus en concierto', 'Una noche de blues y soul con repertorio propio.', 16, 22, 'Sabadell', False, 'Plaça Major (Sabadell)', ['Blues', 'Soul'], 'Gratis'),
    ('rumbeta', 'Fiesta mayor con La Rumbeta', 'Concierto de rumba catalana en la fiesta mayor.', 24, 23, 'Granollers', False, 'Plaça de la Vila', ['Rumba catalana'], 'Gratis'),
    ('ferro_vell', 'Noche de metal en Mataró', 'Dos bandas de metal y hard rock.', 31, 21, 'Mataró', False, 'Sala de la ciudad', ['Metal', 'Hard rock'], '6 €'),
    ('oriol', 'Jam de jazz y funk', 'Jam abierta. Trae tu instrumento.', 5, 21, 'Granollers', False, 'Bar del centro', ['Jazz', 'Funk'], 'Gratis'),
    ('clara', 'Recital de piano', 'Obras de jazz y bossa nova para piano solo.', 19, 19, 'Tarragona', False, 'Auditori Demo', ['Jazz', 'Bossa nova'], '10 €'),
    ('mireia', 'Directo de electrónica y ambient', 'Sesión de sintes modulares y proyecciones.', -5, 22, 'Vic', False, 'Espacio cultural', ['Electrónica', 'Ambient'], '5 €'),
]

# (nick A, nick B, [(quién habla 0|1, texto)], días atrás, queda el último sin leer)
CHATS = [
    ('trencats', 'nuria', [(0, 'Hola Nuria, hemos visto tu perfil. ¿Sigues buscando banda?'), (1, '¡Hola! Sí, me interesa. ¿Qué día ensayáis?'), (0, 'Martes y jueves a las 20h, en Barcelona.')], 1, True),
    ('sala_mostra', 'trencats', [(0, 'Hola, nos gustaría programaros en el ciclo de otoño.'), (1, '¡Genial! ¿Qué fechas tenéis libres?'), (0, 'Viernes 12 o sábado 20.')], 2, False),
    ('laia', 'jordi', [(0, 'Hola Jordi, ¿te animas a tocar guitarra en mis canciones?'), (1, 'Claro, mándame las maquetas y las escucho.')], 3, False),
    ('marc', 'blues_bus', [(0, 'Hola, soy bajista y me interesa vuestro proyecto.'), (1, '¿Tienes algún vídeo tocando?')], 4, True),
    ('pau', 'sala_riu', [(0, 'Buenas, ¿tenéis fechas de ska en invierno?'), (1, 'Sí, quedan dos. ¿Qué banda sois?'), (0, 'Estamos montando una, os mandamos música pronto.')], 6, False),
    ('irene', 'oriol', [(0, 'Oriol, ¿te vendría bien un ensayo el sábado?'), (1, 'Sábado por la mañana mejor. Te confirmo mañana.')], 7, False),
    ('estudi_soroll', 'ferran', [(0, 'Hola, tienes reservada la sala para el jueves a las 19h.'), (1, 'Perfecto, gracias.')], 8, False),
    ('mireia', 'laia', [(0, '¿Te interesa grabar la voz para mi EP?'), (1, 'Me encantaría. ¿Tienes las bases?')], 9, True),
    ('rumbeta', 'biel', [(0, 'Biel, nos falta percusión para el verano. ¿Quieres venir a un ensayo?'), (1, 'Sí, ¿cuándo y dónde?')], 11, False),
    ('auditori_demo', 'clara', [(0, 'Hola Clara, ¿podrías tocar en el ciclo de jazz?'), (1, 'Claro, ¿en qué fecha?'), (0, 'Primera quincena de febrero.')], 13, True),
]


class Command(BaseCommand):
    help = 'Crea datos de ejemplo (usuarios demo_…) o los quita con --borrar. Solo en desarrollo.'

    def add_arguments(self, parser):
        parser.add_argument('--borrar', action='store_true', help='Elimina solo los datos demo_…')

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('seed_demo solo se puede ejecutar con DEBUG=True (nunca en producción).')
        if options['borrar']:
            self.borrar()
        else:
            self.crear()

    # ---------------------------------------------------------------- borrar
    @transaction.atomic
    def borrar(self):
        usuarios = Usuario.objects.filter(nickname__startswith=PREFIJO)
        perfiles = Perfil.objects.filter(usuario__in=usuarios)
        chats = list(PerfilChat.objects.filter(perfil__in=perfiles).values_list('chat_id', flat=True).distinct())
        n_usuarios = usuarios.count()
        usuarios.delete()  # perfiles, locales, anuncios, eventos, comentarios y mensajes caen en cascada
        # Solo se borran los chats que se quedan sin ningún participante
        Chat.objects.filter(pk__in=chats).exclude(
            pk__in=PerfilChat.objects.values('chat_id'),
        ).delete()
        self.stdout.write(self.style.SUCCESS(f'Datos demo eliminados ({n_usuarios} usuarios).'))

    # ----------------------------------------------------------------- crear
    @transaction.atomic
    def crear(self):
        ciudades = self.ciudades_necesarias()
        generos = self.por_nombre(GeneroMusical, 'genero_musical_id')
        instrumentos = self.catalogo(Instrumento, INSTRUMENTOS)
        tipos = self.catalogo(TipoAnuncio, TIPOS_ANUNCIO)
        faltan = {g for fila in MUSICOS for g in fila[5]} | {g for fila in GRUPOS for g in fila[3]} \
            | {g for fila in LOCALES for g in fila[6]}
        faltan = sorted(g for g in faltan if g.lower() not in generos)
        if faltan:
            raise CommandError(f'Faltan estilos en el catálogo: {", ".join(faltan)}. Ejecuta `migrate` primero.')

        perfiles = {}
        for nick, nombre, apellido, muni, instr, estilos, edad, desc in MUSICOS:
            p = self.perfil(nick, nombre, apellido, Perfil.TipoPerfil.USUARIO, desc, ciudades[muni], edad)
            self.pivotes(p, estilos, instr, generos, instrumentos)
            perfiles[nick] = p
        for nick, nombre, muni, estilos, desc in GRUPOS:
            p = self.perfil(nick, nombre, '', Perfil.TipoPerfil.GRUPO, desc, ciudades[muni])
            self.pivotes(p, estilos, [], generos, instrumentos)
            perfiles[nick] = p
        for nick, nombre, muni, tipos_local, aforo, direccion, estilos, desc in LOCALES:
            p = self.perfil(nick, nombre, '', Perfil.TipoPerfil.LOCAL, desc, ciudades[muni])
            Local.objects.update_or_create(
                perfil=p,
                defaults={'ciudad': ciudades[muni], 'direccion': direccion, 'aforo': aforo, 'tipos': tipos_local},
            )
            self.pivotes(p, estilos, [], generos, instrumentos)
            perfiles[nick] = p

        for nick, texto in TESTIMONIOS.items():
            Perfil.objects.filter(pk=perfiles[nick].pk).update(testimonio=texto)

        anuncios = self.anuncios(perfiles, tipos, generos, instrumentos)
        self.comentarios(anuncios, perfiles)
        self.eventos(perfiles, ciudades, generos)
        self.chats(perfiles)

        self.stdout.write(self.style.SUCCESS(
            f'Datos demo listos: {len(perfiles)} perfiles, {len(anuncios)} anuncios, '
            f'{len(EVENTOS)} eventos, {len(CHATS)} conversaciones.'
        ))
        self.stdout.write(f'Entra con cualquier cuenta {PREFIJO}… (p. ej. {PREFIJO}nuria) y contraseña {DEMO_PASSWORD}')
        self.stdout.write(f'Para quitarlos: python manage.py seed_demo --borrar')

    # ------------------------------------------------------------- utilidades
    @staticmethod
    def por_nombre(modelo, pk):
        return {n.lower(): i for i, n in modelo.objects.values_list(pk, 'nombre')}

    def catalogo(self, modelo, nombres):
        """Devuelve {nombre en minúsculas: objeto}; crea solo los que falten."""
        existentes = {o.nombre.lower(): o for o in modelo.objects.all()}
        for nombre in nombres:
            if nombre.lower() not in existentes:
                existentes[nombre.lower()] = modelo.objects.create(nombre=nombre)
        return existentes

    def ciudades_necesarias(self):
        nombres = {f[3] for f in MUSICOS} | {f[2] for f in GRUPOS} | {f[2] for f in LOCALES} | {f[5] for f in EVENTOS}
        ciudades = {c.nombre: c for c in Ciudad.objects.filter(nombre__in=nombres).select_related('comarca')}
        faltan = sorted(nombres - set(ciudades))
        if faltan:
            raise CommandError(f'Faltan municipios en el catálogo: {", ".join(faltan)}. Ejecuta `migrate` primero.')
        return ciudades

    def perfil(self, nick, nombre, apellido, tipo, descripcion, ciudad, edad=None):
        nickname = f'{PREFIJO}{nick}'
        usuario = Usuario.objects.filter(nickname=nickname).first()
        if not usuario:
            usuario = Usuario.objects.create_user(nickname=nickname, password=DEMO_PASSWORD)
        perfil, _ = Perfil.objects.get_or_create(
            usuario=usuario, tipo=tipo,
            defaults={
                'nombre': nombre, 'apellido': apellido, 'correo': f'{nickname}{DOMINIO}',
                'descripcion': descripcion, 'comarca': ciudad.comarca, 'edad': edad,
            },
        )
        return perfil

    @staticmethod
    def pivotes(perfil, estilos, instr, generos, instrumentos):
        for e in estilos:
            PerfilGeneroMusical.objects.get_or_create(perfil=perfil, genero_id=generos[e.lower()])
        for i in instr:
            PerfilInstrumento.objects.get_or_create(perfil=perfil, instrumento=instrumentos[i.lower()])

    def anuncios(self, perfiles, tipos, generos, instrumentos):
        ahora = timezone.now()
        creados = []
        for nick, tipo, titulo, contenido, busca, dias in ANUNCIOS:
            autor = perfiles[nick]
            anuncio, nuevo = Anuncio.objects.get_or_create(
                perfil=autor, titulo=titulo,
                defaults={'contenido': contenido, 'tipo_anuncio': tipos[tipo.lower()]},
            )
            if nuevo:
                Anuncio.objects.filter(pk=anuncio.pk).update(
                    fecha_publicacion=ahora - timedelta(days=dias, hours=dias % 5),
                )
            if busca:
                tipo_perfil, instrumento, estilos = busca
                BusquedaAnuncio.objects.update_or_create(
                    anuncio=anuncio,
                    defaults={
                        'tipo_perfil': tipo_perfil,
                        'instrumento': instrumentos[instrumento.lower()] if instrumento else None,
                        'generos': [generos[e.lower()] for e in estilos],
                    },
                )
            creados.append(anuncio)
        return creados

    @staticmethod
    def comentarios(anuncios, perfiles):
        ahora = timezone.now()
        for indice, nick, texto in COMENTARIOS:
            comentario, nuevo = Comentario.objects.get_or_create(
                anuncio=anuncios[indice], perfil=perfiles[nick], contenido=texto,
            )
            if nuevo:
                Comentario.objects.filter(pk=comentario.pk).update(
                    fecha_publicacion=ahora - timedelta(hours=3 + indice),
                )

    @staticmethod
    def eventos(perfiles, ciudades, generos):
        ahora = timezone.now().replace(minute=0, second=0, microsecond=0)
        for nick, titulo, desc, dias, hora, muni, en_su_local, lugar, estilos, precio in EVENTOS:
            autor = perfiles[nick]
            fecha = (ahora + timedelta(days=dias)).replace(hour=hora)
            Evento.objects.get_or_create(
                perfil=autor, titulo=titulo,
                defaults={
                    'descripcion': desc, 'fecha_inicio': fecha, 'ciudad': ciudades[muni],
                    'local': autor if en_su_local else None, 'lugar': lugar,
                    'generos': [generos[e.lower()] for e in estilos], 'precio': precio,
                },
            )

    @staticmethod
    def chats(perfiles):
        # Si algún perfil demo ya tiene chats, no se vuelven a crear
        if PerfilChat.objects.filter(perfil__in=perfiles.values()).exists():
            return
        ahora = timezone.now()
        for nick_a, nick_b, mensajes, dias, sin_leer in CHATS:
            pareja = (perfiles[nick_a], perfiles[nick_b])
            chat = Chat.objects.create()
            for p in pareja:
                PerfilChat.objects.create(perfil=p, chat=chat)
            for orden, (quien, texto) in enumerate(mensajes):
                emisor, receptor = pareja[quien], pareja[1 - quien]
                mensaje = Mensaje.objects.create(chat=chat, perfil=emisor, contenido=texto)
                Mensaje.objects.filter(pk=mensaje.pk).update(
                    fecha_envio=ahora - timedelta(days=dias, minutes=-5 * orden),
                )
                es_ultimo = orden == len(mensajes) - 1
                if not (sin_leer and es_ultimo):
                    MensajeLeido.objects.create(mensaje=mensaje, perfil=receptor)
