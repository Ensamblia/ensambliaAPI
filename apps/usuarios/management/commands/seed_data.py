"""
Comando de seed para la demo de Ensamblia.

Genera una comunidad "viva" con decenas de usuarios, perfiles (músicos,
grupos y locales), anuncios, eventos, chats, mensajes, comentarios y
solicitudes de grupo, para que la app se vea como en producción.

Uso:
    python manage.py seed_data              # limpia y recrea (solo en DEBUG)
    python manage.py seed_data --force      # permite ejecutarlo fuera de DEBUG
    python manage.py seed_data --no-clean   # añade sin borrar lo existente
"""

import random
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.usuarios.models import Usuario
from apps.perfiles.models import (
    Perfil, PerfilChat, PerfilGeneroMusical, PerfilGrupo,
    PerfilInstrumento, SolicitudGrupo,
)
from apps.chats.models import Chat, Mensaje, MensajeLeido
from apps.anuncios.models import Anuncio, Comentario, TipoAnuncio
from apps.catalogo.models import (
    Comarca, Ciudad, Instrumento, GeneroMusical, Grupo, GrupoGenero,
    TipoArchivo,
)
from apps.locales.models import Local
from apps.eventos.models import Evento
from apps.matching.models import BusquedaAnuncio


# ======================================================================
# DATOS BASE
# ======================================================================

COMARCAS = [
    'Barcelonès', 'Vallès Occidental', 'Vallès Oriental', 'Maresme',
    'Baix Llobregat', 'Bages', 'Osona', 'Gironès', 'Tarragonès',
    'Segrià', 'Baix Empordà', 'Alt Empordà', 'Garraf', 'Anoia',
    'Selva', 'Berguedà', 'Moianès', 'Pla de l\'Estany', 'Urgell',
    'Segarra', 'Conca de Barberà', 'Priorat', 'Ribera d\'Ebre',
    'Baix Ebre', 'Montsià', 'Terra Alta', 'Pallars Jussà',
    'Pallars Sobirà', 'Alta Ribagorça', 'Val d\'Aran', 'Cerdanya',
    'Alt Urgell', 'Solsonès', 'Garrigues', 'Noguera', 'Pla d\'Urgell',
    'Baix Penedès', 'Alt Penedès', 'Garrotxa', 'Ripollès',
    'Alt Camp', 'Baix Camp', 'Lluçanès',
]

CIUDADES_POR_COMARCA = {
    'Barcelonès': ['Barcelona', 'Badalona', 'L\'Hospitalet de Llobregat', 'Santa Coloma de Gramenet', 'Sant Adrià de Besòs'],
    'Vallès Occidental': ['Sabadell', 'Terrassa', 'Rubí', 'Sant Cugat del Vallès', 'Cerdanyola del Vallès'],
    'Vallès Oriental': ['Granollers', 'Mollet del Vallès', 'Caldes de Montbui', 'Cardedeu'],
    'Maresme': ['Mataró', 'Vilassar de Mar', 'El Masnou', 'Premià de Mar', 'Arenys de Mar'],
    'Baix Llobregat': ['Cornellà de Llobregat', 'Sant Boi de Llobregat', 'Viladecans', 'Castelldefels'],
    'Bages': ['Manresa', 'Cardona', 'Sant Fruitós de Bages'],
    'Osona': ['Vic', 'Manlleu', 'Torelló'],
    'Gironès': ['Girona', 'Salt', 'Cassà de la Selva'],
    'Tarragonès': ['Tarragona', 'Salou', 'Torredembarra'],
    'Segrià': ['Lleida', 'Alcarràs', 'Mollerussa'],
    'Baix Empordà': ['Palafrugell', 'Sant Feliu de Guíxols', 'Palamós'],
    'Alt Empordà': ['Figueres', 'Roses', 'Cadaqués'],
    'Garraf': ['Vilanova i la Geltrú', 'Sitges', 'Sant Pere de Ribes'],
    'Anoia': ['Igualada', 'Vilanova del Camí'],
    'Selva': ['Blanes', 'Lloret de Mar', 'Santa Coloma de Farners'],
    'Berguedà': ['Berga', 'Gironella'],
    'Moianès': ['Moià', 'Castellterçol'],
    'Pla de l\'Estany': ['Banyoles', 'Porqueres'],
    'Urgell': ['Tàrrega', 'Agramunt'],
    'Segarra': ['Cervera', 'Guissona'],
    'Conca de Barberà': ['Montblanc', 'Santa Coloma de Queralt'],
    'Priorat': ['Falset', 'Cornudella de Montsant'],
    'Ribera d\'Ebre': ['Móra d\'Ebre', 'Flix'],
    'Baix Ebre': ['Tortosa', 'Amposta', 'Roquetes'],
    'Montsià': ['Amposta', 'Sant Carles de la Ràpita'],
    'Terra Alta': ['Gandesa', 'Batea'],
    'Pallars Jussà': ['Tremp', 'La Pobla de Segur'],
    'Pallars Sobirà': ['Sort', 'Esterri d\'Àneu'],
    'Alta Ribagorça': ['El Pont de Suert', 'Vielha e Mijaran'],
    'Val d\'Aran': ['Vielha e Mijaran', 'Bossòst'],
    'Cerdanya': ['Puigcerdà', 'Bellver de Cerdanya'],
    'Alt Urgell': ['La Seu d\'Urgell', 'Oliana'],
    'Solsonès': ['Solsona', 'Sant Llorenç de Morunys'],
    'Garrigues': ['Les Borges Blanques', 'Juneda'],
    'Noguera': ['Balaguer', 'Ponts'],
    'Pla d\'Urgell': ['Mollerussa', 'Bellpuig'],
    'Baix Penedès': ['El Vendrell', 'Calafell'],
    'Alt Penedès': ['Vilafranca del Penedès', 'Sant Sadurní d\'Anoia'],
    'Garrotxa': ['Olot', 'Besalú'],
    'Ripollès': ['Ripoll', 'Camprodon'],
    'Alt Camp': ['Valls', 'Alcover'],
    'Baix Camp': ['Reus', 'Cambrils'],
    'Lluçanès': ['Prats de Lluçanès', 'Olost'],
}

INSTRUMENTOS = [
    'Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería',
    'Piano', 'Teclados', 'Saxofón', 'Trompeta', 'Trombón',
    'Violín', 'Violonchelo', 'Flauta', 'Armónica', 'Voz',
    'Percusión', 'DJ / Electrónica',
]

GENEROS = [
    'Rock', 'Hard rock', 'Rock alternativo', 'Punk', 'Metal', 'Grunge',
    'Pop', 'Indie', 'Electrónica', 'Techno', 'House', 'Ambient',
    'Hip hop', 'Rap', 'R&B', 'Soul', 'Funk', 'Gospel',
    'Jazz', 'Blues', 'Swing', 'Bossa nova',
    'Reggae', 'Ska', 'Latina', 'Salsa', 'Cumbia', 'Reguetón',
    'Flamenco', 'Rumba catalana', 'Folk', 'Música tradicional',
    'Cantautor', 'Country', 'Clásica', 'Ópera', 'Bandas sonoras',
    'Experimental', 'Versiones',
]

TIPOS_ANUNCIO = [
    'Busco músico', 'Busco grupo', 'Busco local de ensayo',
    'Busco local para tocar', 'Vendo instrumento', 'Compro instrumento',
    'Clases', 'Jam / evento',
]

TIPOS_ARCHIVO = [
    ('imagen', '.jpg', 'image/jpeg'),
    ('imagen', '.png', 'image/png'),
    ('audio', '.mp3', 'audio/mpeg'),
    ('vídeo', '.mp4', 'video/mp4'),
    ('documento', '.pdf', 'application/pdf'),
]


# ======================================================================
# DATOS DE PERSONAS (músicos, grupos, locales)
# ======================================================================

MUSICOS = [
    # (nickname, nombre, apellido, comarca, ciudad, descripcion, instrumentos, generos, testimonio)
    ('ana_rock', 'Ana', 'García', 'Barcelonès', 'Barcelona',
     'Cantante y compositora. Me muevo entre el rock alternativo y el indie.',
     ['Voz', 'Guitarra acústica'], ['Rock alternativo', 'Indie'],
     'Encontré mi banda en Ensamblia en dos semanas. No me lo creía.'),
    ('luis_guitar', 'Luis', 'Flotu', 'Vallès Occidental', 'Sabadell',
     'Guitarrista de rock y blues. Busco proyecto estable para tocar en directo.',
     ['Guitarra eléctrica'], ['Rock', 'Blues'], None),
    ('marta_bateria', 'Marta', 'Ruiz', 'Barcelonès', 'Badalona',
     'Baterista con 10 años de experiencia. Me apunto a todo lo que tenga energía.',
     ['Batería', 'Percusión'], ['Rock', 'Punk'], 'Conocí a mi grupo actual en la primera semana.'),
    ('pau_jazz', 'Pau', 'Garcia', 'Tarragonès', 'Tarragona',
     'Saxofonista de jazz y funk. Toco en jam sessions cada jueves.',
     ['Saxofón'], ['Jazz', 'Funk'], None),
    ('laura_indie', 'Laura', 'Mas', 'Bages', 'Manresa',
     'Bajista y voz. Me gusta el indie y el pop de guitarras.',
     ['Bajo', 'Voz'], ['Indie', 'Pop'], None),
    ('carles_punk', 'Carles', 'Rovira', 'Maresme', 'Mataró',
     'Guitarra y coros. Punk, hardcore y todo lo que huela a garaje.',
     ['Guitarra eléctrica', 'Voz'], ['Punk', 'Hard rock'], None),
    ('nuria_soul', 'Núria', 'Pérez', 'Vallès Oriental', 'Granollers',
     'Cantante de soul y R&B. Busco banda con metales.',
     ['Voz'], ['Soul', 'R&B'], 'La comunidad me ayudó a encontrar metales para mi proyecto.'),
    ('jordi_flamenc', 'Jordi', 'Fernández', 'Baix Llobregat', 'Cornellà de Llobregat',
     'Guitarrista flamenco. Mezclo rumba catalana con fusión.',
     ['Guitarra acústica'], ['Flamenco', 'Rumba catalana'], None),
    ('aina_pop', 'Aina', 'Serra', 'Gironès', 'Girona',
     'Teclista y productora. Pop electrónico con toques orgánicos.',
     ['Teclados', 'Piano'], ['Pop', 'Electrónica'], None),
    ('pol_metal', 'Pol', 'Gutiérrez', 'Vallès Occidental', 'Terrassa',
     'Batería y voces guturales. Metal melódico.',
     ['Batería', 'Voz'], ['Metal'], None),
    ('clara_folk', 'Clara', 'Vidal', 'Osona', 'Vic',
     'Violinista y cantautora folk. Me encanta mezclar tradición y modernidad.',
     ['Violín', 'Voz'], ['Folk', 'Cantautor'], None),
    ('marc_funk', 'Marc', 'Torres', 'Barcelonès', 'L\'Hospitalet de Llobregat',
     'Bajista de funk y soul. Groove por encima de todo.',
     ['Bajo'], ['Funk', 'Soul'], None),
    ('laia_jazz', 'Laia', 'Soler', 'Maresme', 'Vilassar de Mar',
     'Pianista de jazz. Trío, cuarteto, lo que surja.',
     ['Piano'], ['Jazz', 'Swing'], None),
    ('oriol_rock', 'Oriol', 'Martí', 'Bages', 'Cardona',
     'Guitarrista de rock clásico. Los solos son mi religión.',
     ['Guitarra eléctrica'], ['Rock', 'Hard rock'], None),
    ('meritxell_indie', 'Meritxell', 'Roca', 'Gironès', 'Salt',
     'Voz y teclados. Indie pop de dormitorio.',
     ['Voz', 'Teclados'], ['Indie', 'Pop'], None),
    ('adria_punk', 'Adrià', 'López', 'Baix Llobregat', 'Viladecans',
     'Batería punk. Rápido y fuerte.',
     ['Batería'], ['Punk'], None),
    ('gemma_soul', 'Gemma', 'Navarro', 'Tarragonès', 'Reus',
     'Cantante de soul y gospel. Coros, bodas, lo que haga falta.',
     ['Voz'], ['Soul', 'Gospel'], None),
    ('dani_hiphop', 'Dani', 'Moreno', 'Barcelonès', 'Santa Coloma de Gramenet',
     'MC y productor de hip hop. Busco gente para directo.',
     ['DJ / Electrónica', 'Voz'], ['Hip hop', 'Rap'], None),
    ('helena_clasica', 'Helena', 'Font', 'Vallès Oriental', 'Caldes de Montbui',
     'Violonchelista clásica. Abierta a proyectos crossover.',
     ['Violonchelo'], ['Clásica', 'Bandas sonoras'], None),
    ('ramon_blues', 'Ramon', 'Costa', 'Segrià', 'Lleida',
     'Armónica y voz. Blues de carretera.',
     ['Armónica', 'Voz'], ['Blues'], None),
    ('irene_reggae', 'Irene', 'Díaz', 'Selva', 'Blanes',
     'Guitarra y voz. Reggae y ska para el verano.',
     ['Guitarra acústica', 'Voz'], ['Reggae', 'Ska'], None),
    ('toni_latina', 'Toni', 'Herrera', 'Baix Camp', 'Reus',
     'Percusión latina. Salsa, cumbia y lo que se mueva.',
     ['Percusión'], ['Salsa', 'Cumbia', 'Latina'], None),
    ('silvia_ambient', 'Sílvia', 'Puig', 'Garraf', 'Sitges',
     'Productora de ambient y experimental. Busco colaboraciones.',
     ['DJ / Electrónica'], ['Ambient', 'Experimental'], None),
    ('quim_versions', 'Quim', 'Sala', 'Vallès Occidental', 'Rubí',
     'Guitarra y voz en banda de versiones. Bodas y fiestas.',
     ['Guitarra eléctrica', 'Voz'], ['Versiones', 'Pop', 'Rock'], None),
    ('nerea_metal', 'Nerea', 'Iglesias', 'Baix Llobregat', 'Sant Boi de Llobregat',
     'Guitarra rítmica y coros. Metal moderno.',
     ['Guitarra eléctrica', 'Voz'], ['Metal'], None),
    ('bernat_country', 'Bernat', 'Riera', 'Osona', 'Manlleu',
     'Cantautor country y folk. Historias con guitarra.',
     ['Guitarra acústica', 'Voz'], ['Country', 'Folk'], None),
    ('julia_bossa', 'Júlia', 'Campos', 'Barcelonès', 'Barcelona',
     'Voz y guitarra. Bossa nova y jazz suave.',
     ['Voz', 'Guitarra acústica'], ['Bossa nova', 'Jazz'], None),
    ('aleix_grunge', 'Aleix', 'Vila', 'Anoia', 'Igualada',
     'Guitarra y distorsión. Grunge de los 90.',
     ['Guitarra eléctrica'], ['Grunge', 'Rock alternativo'], None),
    ('roser_swing', 'Roser', 'Bages', 'Berguedà', 'Berga',
     'Contrabajo y voz. Swing y jazz manouche.',
     ['Bajo', 'Voz'], ['Swing', 'Jazz'], None),
    ('miquel_techno', 'Miquel', 'Sanz', 'Barcelonès', 'Barcelona',
     'DJ y productor techno. Sesiones de 4 horas.',
     ['DJ / Electrónica'], ['Techno', 'House'], None),
]


GRUPOS = [
    # (nickname_creador, nombre_grupo, comarca, ciudad, descripcion, generos, busca)
    ('luis_guitar', 'Los Flotus', 'Vallès Occidental', 'Sabadell',
     'Trío de rock alternativo con temas propios. Buscamos batería.',
     ['Rock alternativo', 'Indie'], ['Batería']),
    ('marta_bateria', 'Ruido Blanco', 'Barcelonès', 'Badalona',
     'Banda de punk rápido y directo. Dos guitarras, bajo y batería.',
     ['Punk', 'Hard rock'], []),
    ('pau_jazz', 'Tarragona Jazz Trio', 'Tarragonès', 'Tarragona',
     'Trío de jazz clásico. Piano, contrabajo y saxo.',
     ['Jazz', 'Swing'], ['Bajo']),
    ('laura_indie', 'Marea Baja', 'Bages', 'Manresa',
     'Indie pop en catalán. Cuatro miembros y muchas ganas.',
     ['Indie', 'Pop'], []),
    ('carles_punk', 'Garage Mataró', 'Maresme', 'Mataró',
     'Punk garajero de los que no dejan indiferente.',
     ['Punk', 'Grunge'], ['Batería']),
    ('nuria_soul', 'Soul Sisters', 'Vallès Oriental', 'Granollers',
     'Banda de soul con metales. Buscamos trompeta.',
     ['Soul', 'R&B'], ['Trompeta']),
    ('jordi_flamenc', 'Rumba del Besòs', 'Baix Llobregat', 'Cornellà de Llobregat',
     'Rumba catalana y fusión. Guitarra, percusión y voz.',
     ['Rumba catalana', 'Flamenco'], []),
    ('aina_pop', 'Neón Sur', 'Gironès', 'Girona',
     'Dúo de synth-pop. Buscamos voz y bajo para completar.',
     ['Pop', 'Electrónica'], ['Voz', 'Bajo']),
]


LOCALES = [
    # (nickname, nombre, comarca, ciudad, direccion, aforo, tipos, generos, descripcion)
    ('sala_rock_bcn', 'Sala Rock BCN', 'Barcelonès', 'Barcelona',
     'C/ de la Música, 12', 250, ['sala', 'bar'], ['Rock', 'Hard rock', 'Punk'],
     'Sala mítica del rock barcelonés. Conciertos cada fin de semana.'),
    ('sala_jazz_tgn', 'Jazz Club Tarragona', 'Tarragonès', 'Tarragona',
     'Rambla Nova, 45', 120, ['sala', 'bar'], ['Jazz', 'Blues', 'Swing'],
     'Club de jazz con programación semanal y jam sessions los jueves.'),
    ('teatre_vic', 'Teatre de Vic', 'Osona', 'Vic',
     'Plaça Major, 1', 400, ['teatro'], ['Clásica', 'Folk', 'Bandas sonoras'],
     'Teatro municipal con acústica excepcional.'),
    ('bar_manresa', 'Bar El Celler', 'Bages', 'Manresa',
     'C/ del Born, 8', 80, ['bar'], ['Rock', 'Indie', 'Pop'],
     'Bar con escenario pequeño para conciertos íntimos.'),
    ('ensayo_girona', 'Locals d\'Assaig Girona', 'Gironès', 'Girona',
     'Polígon Mas Xirgu, nau 4', 30, ['ensayo'], ['Rock', 'Metal', 'Punk'],
     'Locales de ensayo equipados por horas.'),
    ('sala_granollers', 'Sala La Fàbrica', 'Vallès Oriental', 'Granollers',
     'C/ de la Indústria, 22', 180, ['sala', 'bar'], ['Rock', 'Indie', 'Electrónica'],
     'Sala con programación ecléctica y bar propio.'),
    ('teatro_reus', 'Teatre Fortuny', 'Baix Camp', 'Reus',
     'Plaça del Mercadal, 1', 600, ['teatro'], ['Clásica', 'Ópera', 'Bandas sonoras'],
     'Teatro histórico con programación de ópera y conciertos.'),
    ('sala_lleida', 'Cafè del Teatre', 'Segrià', 'Lleida',
     'C/ Major, 30', 100, ['bar', 'sala'], ['Jazz', 'Folk', 'Cantautor'],
     'Café-teatro con conciertos acústicos y noches de cantautores.'),
]


ANUNCIOS = [
    # (nickname_autor, titulo, contenido, tipo_anuncio, busca)
    # busca: dict con {tipo_perfil, instrumento, generos} o None
    ('luis_guitar', 'Busco batería para grupo de rock alternativo',
     'Trío de rock alternativo en Sabadell busca batería con experiencia para tocar en directo. Tenemos temas propios y local de ensayo.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Batería', 'generos': ['Rock alternativo', 'Indie']}),
    ('marta_bateria', 'Batería disponible para proyectos',
     'Baterista con 10 años de experiencia busca banda de rock o punk. Tengo equipo propio y transporte.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Rock', 'Punk']}),
    ('pau_jazz', 'Busco bajista para trío de jazz',
     'Trío de jazz en Tarragona busca bajista con experiencia en walking bass y improvisación.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Bajo', 'generos': ['Jazz', 'Swing']}),
    ('laura_indie', 'Bajista y voz busca banda de indie',
     'Me muevo entre el indie y el pop de guitarras. Busco grupo estable para tocar en directo.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Indie', 'Pop']}),
    ('carles_punk', 'Guitarra punk busca banda',
     'Guitarrista de punk y hardcore busca banda con ganas de tocar rápido y fuerte.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Punk', 'Hard rock']}),
    ('nuria_soul', 'Buscamos trompetista para banda de soul',
     'Banda de soul en Granollers busca trompetista para completar sección de metales.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Trompeta', 'generos': ['Soul', 'R&B']}),
    ('jordi_flamenc', 'Guitarrista flamenco busca proyecto',
     'Guitarrista flamenco y rumbero busca proyecto para tocar en directo.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Flamenco', 'Rumba catalana']}),
    ('aina_pop', 'Teclista y productora busca voz para synth-pop',
     'Dúo de synth-pop en Girona busca voz y bajo para completar formación.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Voz', 'generos': ['Pop', 'Electrónica']}),
    ('pol_metal', 'Batería metal busca banda',
     'Batería de metal melódico busca banda para tocar en directo. Tengo doble bombo.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Metal']}),
    ('clara_folk', 'Violinista folk busca proyecto',
     'Violinista y cantautora folk busca proyecto para tocar en directo.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Folk', 'Cantautor']}),
    ('marc_funk', 'Bajista funk busca banda',
     'Bajista de funk y soul busca banda con groove. Tengo equipo propio.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Funk', 'Soul']}),
    ('laia_jazz', 'Pianista jazz busca trío',
     'Pianista de jazz busca trío para tocar standards y temas propios.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Jazz', 'Swing']}),
    ('sala_rock_bcn', 'Programación abierta para bandas de rock',
     'Sala Rock BCN busca bandas de rock para programación de otoño. Enviad maqueta.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Rock', 'Hard rock', 'Punk']}),
    ('sala_jazz_tgn', 'Jam sessions los jueves',
     'Jazz Club Tarragona organiza jam sessions todos los jueves. Abierto a todos los niveles.',
     'Jam / evento', None),
    ('teatre_vic', 'Conciertos de clásica en otoño',
     'Teatre de Vic programa ciclos de música clásica. Buscamos intérpretes.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': None, 'generos': ['Clásica']}),
    ('ensayo_girona', 'Locales de ensayo disponibles',
     'Locals d\'Assaig Girona tiene plazas libres para bandas. Equipados y con horario flexible.',
     'Busco local de ensayo', None),
    ('oriol_rock', 'Vendo guitarra eléctrica Fender Stratocaster',
     'Fender Stratocaster en perfecto estado. Color sunburst. Incluye funda rígida.',
     'Vendo instrumento', None),
    ('oriol_rock', 'Vendo amplificador de válvulas',
     'Amplificador de válvulas de 30W. Sonido cálido y potente. Ideal para rock y blues.',
     'Vendo instrumento', None),
    ('oriol_rock', 'Compro pedal de distorsión',
     'Busco pedal de distorsión tipo Tube Screamer. Buen estado y precio razonable.',
     'Compro instrumento', None),
    ('meritxell_indie', 'Clases de piano y teclados',
     'Clases de piano y teclados para todos los niveles. Presencial en Salt o online.',
     'Clases', None),
    ('adria_punk', 'Batería acústica en venta',
     'Batería acústica de 5 piezas con platos. Buen estado. Recogida en Viladecans.',
     'Vendo instrumento', None),
    ('gemma_soul', 'Cantante para bodas y eventos',
     'Cantante de soul y gospel disponible para bodas, eventos y celebraciones.',
     'Busco grupo', None),
    ('dani_hiphop', 'Productor busca MC para directo',
     'Productor de hip hop busca MC para proyecto de directo. Tengo beats y contactos.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Voz', 'generos': ['Hip hop', 'Rap']}),
    ('helena_clasica', 'Violonchelista busca proyectos crossover',
     'Violonchelista clásica busca proyectos que mezclen clásica con otros estilos.',
     'Busco grupo', None),
    ('ramon_blues', 'Armónica y voz busca banda de blues',
     'Armónica y voz busca banda de blues para tocar en bares y festivales.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Blues']}),
    ('irene_reggae', 'Guitarra y voz busca banda de reggae',
     'Guitarra y voz busca banda de reggae o ska para el verano.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Reggae', 'Ska']}),
    ('toni_latina', 'Percusión latina busca grupo',
     'Percusionista latino busca grupo de salsa, cumbia o similar.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Salsa', 'Cumbia', 'Latina']}),
    ('silvia_ambient', 'Productora ambient busca colaboraciones',
     'Productora de ambient y experimental busca colaboraciones para proyecto audiovisual.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': None, 'generos': ['Ambient', 'Experimental']}),
    ('quim_versions', 'Banda de versiones busca cantante',
     'Banda de versiones busca cantante para bodas y fiestas. Repertorio pop-rock.',
     'Busco músico', {'tipo_perfil': 'usuario', 'instrumento': 'Voz', 'generos': ['Versiones', 'Pop', 'Rock']}),
    ('nerea_metal', 'Guitarra rítmica busca banda de metal',
     'Guitarrista rítmica busca banda de metal moderno. Tengo equipo propio.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Metal']}),
    ('bernat_country', 'Cantautor country busca banda',
     'Cantautor country y folk busca banda para tocar en directo.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Country', 'Folk']}),
    ('julia_bossa', 'Voz y guitarra busca trío de bossa',
     'Voz y guitarra busca trío de bossa nova y jazz suave.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Bossa nova', 'Jazz']}),
    ('aleix_grunge', 'Guitarra grunge busca banda',
     'Guitarrista de grunge busca banda con actitud. Los 90 están de vuelta.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Grunge', 'Rock alternativo']}),
    ('roser_swing', 'Contrabajo y voz busca banda de swing',
     'Contrabajo y voz busca banda de swing y jazz manouche.',
     'Busco grupo', {'tipo_perfil': 'grupo', 'instrumento': None, 'generos': ['Swing', 'Jazz']}),
    ('miquel_techno', 'DJ techno busca sala para sesiones',
     'DJ y productor techno busca sala para sesiones mensuales.',
     'Busco local para tocar', {'tipo_perfil': 'local', 'instrumento': None, 'generos': ['Techno', 'House']}),
     # Más anuncios de compra/venta para el Mercado
('luis_guitar', 'Vendo amplificador de válvulas 30W',
 'Amplificador de válvulas 30W, sonido cálido. Ideal rock/blues. Precio: 420 €.',
 'Vendo instrumento', None),
('marta_bateria', 'Vendo batería acústica 5 piezas',
 'Batería acústica de 5 piezas con platos. Buen estado. Precio: 390 €.',
 'Vendo instrumento', None),
('laura_indie', 'Vendo bajo de 4 cuerdas',
 'Bajo de 4 cuerdas con electrónica activa. Perfecto para empezar. Precio: 240 €.',
 'Vendo instrumento', None),
('pau_jazz', 'Vendo saxofón alto lacado',
 'Saxo alto lacado con estuche. Buen estado. Precio: 620 €.',
 'Vendo instrumento', None),
('nuria_soul', 'Compro pedal de delay',
 'Busco pedal de delay analógico. Buen estado y precio razonable.',
 'Compro instrumento', None),
('aina_pop', 'Vendo teclado 61 teclas',
 'Teclado de 61 teclas sensibles. Ideal para directos. Precio: 150 €.',
 'Vendo instrumento', None),
]


COMENTARIOS = [
    '¡Qué buena pinta! Me interesa.',
    'Yo también estoy buscando algo parecido. ¿Hablamos?',
    'Tengo un amigo que podría encajar. Te paso su contacto.',
    '¡Mucha suerte con la búsqueda!',
    'Suena genial. ¿Tenéis algún tema grabado?',
    'Me apunto a la jam del jueves.',
    '¿Todavía está disponible el instrumento?',
    'Buena iniciativa. La comunidad necesita más cosas así.',
    'Estaría genial poder escuchar algo primero.',
    'Cuenta conmigo para lo que necesites.',
]


EVENTOS = [
    # (nickname_autor, titulo, descripcion, dias_desde_hoy, hora, ciudad, local_nickname, lugar, generos, precio)
    ('sala_rock_bcn', 'Noche de Rock BCN', 'Tres bandas de rock en directo. Entrada libre hasta completar aforo.',
     7, 21, 'Barcelona', 'sala_rock_bcn', '', ['Rock', 'Hard rock'], '10 €'),
    ('sala_jazz_tgn', 'Jam Session de Jazz', 'Jam session abierta a todos los niveles. Trae tu instrumento.',
     3, 20, 'Tarragona', 'sala_jazz_tgn', '', ['Jazz', 'Swing'], 'Gratis'),
    ('teatre_vic', 'Concierto de Clásica', 'Ciclo de música clásica con intérpretes locales.',
     14, 19, 'Vic', 'teatre_vic', '', ['Clásica'], '15 €'),
    ('bar_manresa', 'Noche de Indie', 'Bandas de indie y pop en formato acústico.',
     5, 21, 'Manresa', 'bar_manresa', '', ['Indie', 'Pop'], '5 €'),
    ('ensayo_girona', 'Jornada de Puertas Abiertas', 'Ven a conocer nuestros locales de ensayo.',
     2, 18, 'Girona', 'ensayo_girona', '', ['Rock', 'Metal'], 'Gratis'),
    ('sala_granollers', 'Electrónica en La Fàbrica', 'Sesión de DJ y directos de electrónica.',
     10, 22, 'Granollers', 'sala_granollers', '', ['Electrónica', 'Techno'], '12 €'),
    ('teatro_reus', 'Ópera en Reus', 'Ópera clásica con orquesta local.',
     21, 20, 'Reus', 'teatro_reus', '', ['Ópera', 'Clásica'], '20 €'),
    ('sala_lleida', 'Noche de Cantautores', 'Cantautores locales en formato íntimo.',
     9, 20, 'Lleida', 'sala_lleida', '', ['Cantautor', 'Folk'], '8 €'),
    ('luis_guitar', 'Concierto de Los Flotus', 'Presentación de nuestro primer EP.',
     15, 21, 'Sabadell', None, 'Parque de Cataluña', ['Rock alternativo', 'Indie'], 'Gratis'),
    ('pau_jazz', 'Concierto de Tarragona Jazz Trio', 'Standards de jazz y temas propios.',
     12, 20, 'Tarragona', 'sala_jazz_tgn', '', ['Jazz', 'Swing'], '10 €'),
    ('marta_bateria', 'Jam de Punk', 'Jam abierta para bandas de punk.',
     6, 21, 'Badalona', None, 'Local de ensayo', ['Punk', 'Hard rock'], 'Gratis'),
    ('laura_indie', 'Concierto de Marea Baja', 'Presentación de nuestro nuevo single.',
     18, 21, 'Manresa', 'bar_manresa', '', ['Indie', 'Pop'], '5 €'),
    ('carles_punk', 'Concierto de Garage Mataró', 'Punk garajero sin concesiones.',
     11, 22, 'Mataró', None, 'Sala alternativa', ['Punk', 'Grunge'], '8 €'),
    ('nuria_soul', 'Noche de Soul', 'Banda de soul con metales en directo.',
     13, 21, 'Granollers', 'sala_granollers', '', ['Soul', 'R&B'], '10 €'),
    ('jordi_flamenc', 'Rumba en el Besòs', 'Rumba catalana y fusión.',
     8, 20, 'Cornellà de Llobregat', None, 'Plaza del mercado', ['Rumba catalana', 'Flamenco'], 'Gratis'),
    ('aina_pop', 'Synth-pop en Girona', 'Dúo de synth-pop con proyecciones.',
     16, 21, 'Girona', None, 'Sala alternativa', ['Pop', 'Electrónica'], '7 €'),
    ('pol_metal', 'Noche de Metal', 'Bandas de metal melódico.',
     19, 21, 'Terrassa', None, 'Sala de conciertos', ['Metal'], '12 €'),
    ('clara_folk', 'Folk en Vic', 'Violín y voz en formato acústico.',
     4, 19, 'Vic', 'teatre_vic', '', ['Folk', 'Cantautor'], '5 €'),
    ('marc_funk', 'Funk en L\'Hospitalet', 'Banda de funk con groove.',
     17, 21, 'L\'Hospitalet de Llobregat', None, 'Bar de copas', ['Funk', 'Soul'], 'Gratis'),
    ('laia_jazz', 'Piano solo', 'Recital de piano jazz.',
     22, 20, 'Vilassar de Mar', None, 'Café cultural', ['Jazz', 'Swing'], '6 €'),
    ('sala_rock_bcn', 'Concurso de Bandas', 'Concurso de bandas emergentes. Inscripción abierta.',
     25, 20, 'Barcelona', 'sala_rock_bcn', '', ['Rock', 'Indie', 'Punk'], '5 €'),
    ('sala_jazz_tgn', 'Blues Night', 'Noche de blues con músicos locales.',
     14, 21, 'Tarragona', 'sala_jazz_tgn', '', ['Blues'], '8 €'),
    ('bar_manresa', 'Acústico de Cantautores', 'Cantautores locales en formato acústico.',
     6, 20, 'Manresa', 'bar_manresa', '', ['Cantautor', 'Folk'], 'Gratis'),
    ('ensayo_girona', 'Taller de Improvisación', 'Taller de improvisación para todos los niveles.',
     3, 18, 'Girona', 'ensayo_girona', '', ['Jazz', 'Experimental'], '10 €'),
    ('sala_granollers', 'Noche de Versiones', 'Banda de versiones pop-rock.',
     20, 22, 'Granollers', 'sala_granollers', '', ['Versiones', 'Pop', 'Rock'], '10 €'),
    ('teatro_reus', 'Concierto de Bandas Sonoras', 'Orquesta interpretando bandas sonoras.',
     28, 19, 'Reus', 'teatro_reus', '', ['Bandas sonoras', 'Clásica'], '15 €'),
    ('sala_lleida', 'Noche de Bossa Nova', 'Bossa nova y jazz suave.',
     24, 20, 'Lleida', 'sala_lleida', '', ['Bossa nova', 'Jazz'], '7 €'),
    ('luis_guitar', 'Ensayo Abierto de Los Flotus', 'Ven a vernos ensayar y conoce al grupo.',
     1, 19, 'Sabadell', None, 'Local de ensayo', ['Rock alternativo'], 'Gratis'),
    ('marta_bateria', 'Clases de Batería', 'Clases de batería para principiantes.',
     30, 18, 'Badalona', None, 'Estudio de ensayo', ['Rock', 'Punk'], '15 €'),
    ('sala_rock_bcn', 'Rock para Todos', 'Concierto benéfico de bandas de rock.',
     35, 20, 'Barcelona', 'sala_rock_bcn', '', ['Rock', 'Hard rock'], '10 €'),
]


TESTIMONIOS = [
    'Encontré mi banda en Ensamblia en dos semanas. No me lo creía. Ahora tocamos cada fin de semana en salas de Barcelona.',
    'Vine a Madrid a trabajar y no conocía a nadie. Ahora tengo un grupo de jazz con el que toco cada semana.',
    'Compré un bajo de jazz increíble en el marketplace. Todo el proceso fue sencillo y muy humano.',
    'La comunidad me ayudó a encontrar metales para mi proyecto de soul. Ahora somos siete en la banda.',
    'Después de años buscando grupo, aquí encontré gente con la que realmente conecté. La química existe.',
    'Gracias a Ensamblia he tocado en salas que ni sabía que existían. La red de locales es increíble.',
]


# ======================================================================
# HELPERS
# ======================================================================

def _crear_usuario(nickname, password='demo1234'):
    """Crea un usuario si no existe. Devuelve el usuario."""
    user, _ = Usuario.objects.get_or_create(nickname=nickname)
    user.set_password(password)
    user.save()
    return user


def _crear_perfil(usuario, tipo, nombre, apellido, correo, descripcion,
                  comarca, disponibilidad=True, testimonio=None, foto=None):
    """Crea un perfil. Si ya existe (mismo usuario+tipo), lo actualiza."""
    perfil, creado = Perfil.objects.get_or_create(
        usuario=usuario,
        tipo=tipo,
        defaults={
            'nombre': nombre,
            'apellido': apellido,
            'correo': correo,
            'descripcion': descripcion,
            'comarca': comarca,
            'disponibilidad': disponibilidad,
            'testimonio': testimonio,
            'foto': foto,
        },
    )
    if not creado:
        perfil.nombre = nombre
        perfil.apellido = apellido
        perfil.correo = correo
        perfil.descripcion = descripcion
        perfil.comarca = comarca
        perfil.disponibilidad = disponibilidad
        perfil.testimonio = testimonio
        perfil.foto = foto
        perfil.save()
    return perfil


def _asignar_generos(perfil, nombres_generos, generos_map):
    """Asigna géneros al perfil (idempotente)."""
    for nombre in nombres_generos:
        genero = generos_map.get(nombre)
        if genero:
            PerfilGeneroMusical.objects.get_or_create(perfil=perfil, genero=genero)


def _asignar_instrumentos(perfil, nombres_instrumentos, instrumentos_map):
    """Asigna instrumentos al perfil (idempotente)."""
    for nombre in nombres_instrumentos:
        instr = instrumentos_map.get(nombre)
        if instr:
            PerfilInstrumento.objects.get_or_create(perfil=perfil, instrumento=instr)


def _crear_local(perfil, ciudad, direccion, aforo, tipos):
    """Crea (o actualiza) el Local 1:1 de un perfil tipo local."""
    local, _ = Local.objects.update_or_create(
        perfil=perfil,
        defaults={
            'ciudad': ciudad,
            'direccion': direccion,
            'aforo': aforo,
            'tipos': tipos,
        },
    )
    return local


def _crear_evento(perfil_autor, titulo, descripcion, dias, hora, ciudad,
                  perfil_local, lugar, generos_ids, precio):
    """Crea un evento futuro."""
    fecha_inicio = timezone.now() + timedelta(days=dias)
    fecha_inicio = fecha_inicio.replace(hour=hora, minute=0, second=0, microsecond=0)
    return Evento.objects.create(
        perfil=perfil_autor,
        titulo=titulo,
        descripcion=descripcion,
        fecha_inicio=fecha_inicio,
        ciudad=ciudad,
        local=perfil_local,
        lugar=lugar or '',
        generos=generos_ids,
        precio=precio or '',
    )


# ======================================================================
# COMMAND
# ======================================================================

class Command(BaseCommand):
    help = (
        'Genera una comunidad de demo con decenas de usuarios, perfiles, '
        'anuncios, eventos, chats y mensajes para la presentación.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Permite ejecutar el seed fuera de DEBUG (¡borra datos!).',
        )
        parser.add_argument(
            '--no-clean',
            action='store_true',
            help='No borra los datos existentes antes de crear los nuevos.',
        )
        parser.add_argument(
            '--password',
            default='demo1234',
            help='Contraseña para todos los usuarios de demo (default: demo1234).',
        )

    def handle(self, *args, **options):
        # ── 0. Guardia de seguridad ──
        if not settings.DEBUG and not options['force']:
            raise CommandError(
                'Estás en producción (DEBUG=False). Usa --force si de verdad '
                'quieres borrar y recrear los datos de demo.'
            )

        password = options['password']
        no_clean = options['no_clean']

        # ── 1. Limpiar (orden correcto por FKs) ──
        if not no_clean:
            self.stdout.write(self.style.WARNING('🧹 Limpiando datos previos...'))
            MensajeLeido.objects.all().delete()
            Mensaje.objects.all().delete()
            PerfilChat.objects.all().delete()
            Chat.objects.all().delete()
            Comentario.objects.all().delete()
            BusquedaAnuncio.objects.all().delete()
            Anuncio.objects.all().delete()
            Evento.objects.all().delete()
            SolicitudGrupo.objects.all().delete()
            PerfilGrupo.objects.all().delete()
            GrupoGenero.objects.all().delete()
            Grupo.objects.all().delete()
            PerfilGeneroMusical.objects.all().delete()
            PerfilInstrumento.objects.all().delete()
            Local.objects.all().delete()
            Perfil.objects.all().delete()
            Usuario.objects.all().delete()
            TipoAnuncio.objects.all().delete()
            TipoArchivo.objects.all().delete()
            Ciudad.objects.all().delete()
            Comarca.objects.all().delete()
            Instrumento.objects.all().delete()
            GeneroMusical.objects.all().delete()

        with transaction.atomic():
            # ── 2. Catálogos base ──
            self.stdout.write('🌍 Creando comarcas y ciudades...')
            comarcas_map = {}
            for nombre in COMARCAS:
                comarca, _ = Comarca.objects.get_or_create(nombre=nombre)
                comarcas_map[nombre] = comarca

            ciudades_map = {}
            for comarca_nombre, ciudades in CIUDADES_POR_COMARCA.items():
                comarca = comarcas_map.get(comarca_nombre)
                for ciudad_nombre in ciudades:
                    ciudad, _ = Ciudad.objects.get_or_create(
                        nombre=ciudad_nombre,
                        defaults={'comarca': comarca},
                    )
                    if ciudad.comarca_id != (comarca.comarca_id if comarca else None):
                        ciudad.comarca = comarca
                        ciudad.save(update_fields=['comarca'])
                    ciudades_map[ciudad_nombre] = ciudad

            self.stdout.write('🎸 Creando instrumentos...')
            instrumentos_map = {}
            for nombre in INSTRUMENTOS:
                instr, _ = Instrumento.objects.get_or_create(nombre=nombre)
                instrumentos_map[nombre] = instr

            self.stdout.write('🎵 Creando géneros musicales...')
            generos_map = {}
            for nombre in GENEROS:
                genero, _ = GeneroMusical.objects.get_or_create(nombre=nombre)
                generos_map[nombre] = genero

            self.stdout.write('📢 Creando tipos de anuncio...')
            tipos_anuncio_map = {}
            for nombre in TIPOS_ANUNCIO:
                tipo, _ = TipoAnuncio.objects.get_or_create(nombre=nombre)
                tipos_anuncio_map[nombre] = tipo

            self.stdout.write('📁 Creando tipos de archivo...')
            for nombre, ext, mime in TIPOS_ARCHIVO:
                TipoArchivo.objects.get_or_create(
                    nombre=nombre, extension=ext,
                    defaults={'mime_type': mime},
                )

            # ── 3. Usuarios + perfiles (músicos) ──
            self.stdout.write('👤 Creando músicos...')
            perfiles_musico = {}
            for (nickname, nombre, apellido, comarca_nombre, ciudad_nombre,
                 descripcion, instrumentos, generos, testimonio) in MUSICOS:
                user = _crear_usuario(nickname, password)
                comarca = comarcas_map.get(comarca_nombre)
                correo = f'{nickname}@demo.ensamblia.com'
                perfil = _crear_perfil(
                    usuario=user, tipo='usuario',
                    nombre=nombre, apellido=apellido, correo=correo,
                    descripcion=descripcion, comarca=comarca,
                    disponibilidad=random.choice([True, True, True, False]),
                    testimonio=testimonio,
                )
                _asignar_instrumentos(perfil, instrumentos, instrumentos_map)
                _asignar_generos(perfil, generos, generos_map)
                perfiles_musico[nickname] = perfil

            # ── 4. Usuarios + perfiles (grupos) + Grupo de catálogo ──
            self.stdout.write('👥 Creando grupos...')
            perfiles_grupo = {}
            grupos_catalogo = {}
            for (nickname_creador, nombre_grupo, comarca_nombre, ciudad_nombre,
                descripcion, generos, busca) in GRUPOS:
                creador = Usuario.objects.filter(nickname=nickname_creador).first()
                if not creador:
                    continue
                slug = nombre_grupo.lower().replace(' ', '_').replace('\'', '')
                correo = f'{slug}@demo.ensamblia.com'
                comarca = comarcas_map.get(comarca_nombre)
                perfil = _crear_perfil(
                    usuario=creador, tipo='grupo',
                    nombre=nombre_grupo, apellido='', correo=correo,
                    descripcion=descripcion, comarca=comarca,
                    disponibilidad=True,
                )
                _asignar_generos(perfil, generos, generos_map)
                grupo_cat, _ = Grupo.objects.get_or_create(
                    nombre=nombre_grupo,
                    defaults={
                        'creador_perfil': perfiles_musico.get(nickname_creador),
                        'descripcion': descripcion,
                    },
                )
                perfil.grupo_catalogo = grupo_cat
                perfil.save(update_fields=['grupo_catalogo'])
                perfiles_grupo[nombre_grupo] = perfil

                # Crear también el Grupo de catálogo (para SolicitudGrupo / PerfilGrupo)
                grupo_cat, _ = Grupo.objects.get_or_create(
                    nombre=nombre_grupo,
                    defaults={'creador_perfil': perfiles_musico.get(nickname_creador, perfil),
                            'descripcion': descripcion},
                )
                grupos_catalogo[nombre_grupo] = grupo_cat
                # El creador es miembro del grupo (PerfilGrupo usa Grupo de catálogo)
                PerfilGrupo.objects.get_or_create(
                    perfil=perfiles_musico.get(nickname_creador, perfil),
                    grupo=grupo_cat,
                )
                
            # ── 5. Usuarios + perfiles (locales) + Local 1:1 ──
            self.stdout.write('🏢 Creando locales...')
            perfiles_local = {}
            for (nickname, nombre, comarca_nombre, ciudad_nombre, direccion,
                aforo, tipos, generos, descripcion) in LOCALES:
                user = _crear_usuario(nickname, password)
                comarca = comarcas_map.get(comarca_nombre)
                ciudad = ciudades_map.get(ciudad_nombre)
                correo = f'{nickname}@demo.ensamblia.com'
                perfil = _crear_perfil(
                    usuario=user, tipo='local',
                    nombre=nombre, apellido='', correo=correo,
                    descripcion=descripcion, comarca=comarca,
                    disponibilidad=True,
                )
                _asignar_generos(perfil, generos, generos_map)
                if ciudad:
                    _crear_local(perfil, ciudad, direccion, aforo, tipos)
                perfiles_local[nickname] = perfil

            # ── 6. Anuncios + "qué buscas" ──
            self.stdout.write('📝 Creando anuncios...')
            anuncios_creados = []
            for (nickname_autor, titulo, contenido, tipo_anuncio_nombre, busca) in ANUNCIOS:
                autor = perfiles_musico.get(nickname_autor) or perfiles_local.get(nickname_autor) or perfiles_grupo.get(nickname_autor)
                if not autor:
                    # Buscar por nickname de usuario
                    user = Usuario.objects.filter(nickname=nickname_autor).first()
                    if user:
                        autor = Perfil.objects.filter(usuario=user).first()
                if not autor:
                    continue
                tipo = tipos_anuncio_map.get(tipo_anuncio_nombre)
                anuncio = Anuncio.objects.create(
                    titulo=titulo,
                    contenido=contenido,
                    perfil=autor,
                    tipo_anuncio=tipo,
                )
                anuncios_creados.append(anuncio)
                if busca:
                    BusquedaAnuncio.objects.create(
                        anuncio=anuncio,
                        tipo_perfil=busca.get('tipo_perfil'),
                        instrumento=instrumentos_map.get(busca.get('instrumento')) if busca.get('instrumento') else None,
                        generos=[generos_map[g].genero_musical_id for g in busca.get('generos', []) if g in generos_map],
                    )

            # ── 7. Comentarios ──
            self.stdout.write('💬 Creando comentarios...')
            for anuncio in anuncios_creados:
                # 1-4 comentarios por anuncio, de músicos aleatorios
                n = random.randint(1, 4)
                candidatos = list(perfiles_musico.values())
                random.shuffle(candidatos)
                for perfil in candidatos[:n]:
                    Comentario.objects.create(
                        contenido=random.choice(COMENTARIOS),
                        anuncio=anuncio,
                        perfil=perfil,
                    )

            # ── 8. Chats + mensajes + leídos ──
            self.stdout.write('💌 Creando chats y mensajes...')
            musicos = list(perfiles_musico.values())
            random.shuffle(musicos)
            chats_creados = []
            for i in range(0, min(len(musicos) - 1, 15) * 2, 2):
                p1, p2 = musicos[i], musicos[i + 1]
                chat = Chat.objects.create()
                PerfilChat.objects.create(perfil=p1, chat=chat)
                PerfilChat.objects.create(perfil=p2, chat=chat)
                chats_creados.append((chat, p1, p2))

                # 3-8 mensajes alternos
                n_mensajes = random.randint(3, 8)
                mensajes = []
                for j in range(n_mensajes):
                    emisor = p1 if j % 2 == 0 else p2
                    receptor = p2 if j % 2 == 0 else p1
                    contenido = random.choice([
                        f'Hola {receptor.nombre}, ¿sigues buscando gente para tocar?',
                        'Sí, claro. ¿Qué estilo te mueve?',
                        'Me interesa mucho tu anuncio. ¿Hablamos?',
                        'Claro, ¿te va bien quedar esta semana?',
                        'Perfecto, el jueves por la tarde me va bien.',
                        'Genial, te paso mi número por privado.',
                        '¿Tocas algún instrumento más?',
                        'Sí, también me defiendo con la guitarra.',
                        'Buah, pues genial. ¿Tienes local de ensayo?',
                        'Sí, tenemos uno en el centro. ¿Te va bien?',
                    ])
                    m = Mensaje.objects.create(
                        chat=chat, perfil=emisor, contenido=contenido,
                    )
                    mensajes.append(m)
                    # Algunos leídos
                    if j < n_mensajes - 1:
                        MensajeLeido.objects.create(mensaje=m, perfil=receptor)

            # ── 9. Eventos ──
            self.stdout.write('📅 Creando eventos...')
            for (nickname_autor, titulo, descripcion, dias, hora, ciudad_nombre,
                local_nickname, lugar, generos_nombres, precio) in EVENTOS:
                autor = perfiles_musico.get(nickname_autor) or perfiles_local.get(nickname_autor) or perfiles_grupo.get(nickname_autor)
                if not autor:
                    continue
                ciudad = ciudades_map.get(ciudad_nombre)
                if not ciudad:
                    continue
                perfil_local = perfiles_local.get(local_nickname) if local_nickname else None
                generos_ids = [generos_map[g].genero_musical_id for g in generos_nombres if g in generos_map]
                _crear_evento(
                    perfil_autor=autor, titulo=titulo, descripcion=descripcion,
                    dias=dias, hora=hora, ciudad=ciudad,
                    perfil_local=perfil_local, lugar=lugar,
                    generos_ids=generos_ids, precio=precio,
                )

            # ── 10. Solicitudes de grupo ──
            self.stdout.write('📨 Creando solicitudes de grupo...')
            musicos_list = list(perfiles_musico.values())
            for perfil_grupo in perfiles_grupo.values():
                if not perfil_grupo.grupo_catalogo_id:
                    continue
                for _ in range(random.randint(2, 4)):
                    perfil_musico = random.choice(musicos_list)
                    estado = random.choice([
                        SolicitudGrupo.Estado.PENDIENTE,
                        SolicitudGrupo.Estado.ACEPTADA,
                        SolicitudGrupo.Estado.RECHAZADA,
                    ])
                    solicitud, _ = SolicitudGrupo.objects.get_or_create(
                        perfil=perfil_musico,
                        grupo=perfil_grupo.grupo_catalogo,
                        defaults={'estado': estado},
                    )
                    if estado == SolicitudGrupo.Estado.ACEPTADA:
                        PerfilGrupo.objects.get_or_create(
                            perfil=perfil_musico,
                            grupo=perfil_grupo.grupo_catalogo,
                        )

            # ── 11. Testimonios adicionales ──
            self.stdout.write('⭐ Añadiendo testimonios...')
            musicos_sin_testimonio = [
                p for p in perfiles_musico.values() if not p.testimonio
            ]
            random.shuffle(musicos_sin_testimonio)
            for perfil, testimonio in zip(musicos_sin_testimonio, TESTIMONIOS):
                perfil.testimonio = testimonio
                perfil.save(update_fields=['testimonio'])

            # ── 12. Resumen ──
            self.stdout.write(self.style.SUCCESS('\n✅ DATOS DE DEMO CREADOS:'))
            self.stdout.write(f'   - Usuarios: {Usuario.objects.count()}')
            self.stdout.write(f'   - Perfiles: {Perfil.objects.count()}')
            self.stdout.write(f'   - Músicos: {Perfil.objects.filter(tipo="usuario").count()}')
            self.stdout.write(f'   - Grupos: {Perfil.objects.filter(tipo="grupo").count()}')
            self.stdout.write(f'   - Locales: {Perfil.objects.filter(tipo="local").count()}')
            self.stdout.write(f'   - Anuncios: {Anuncio.objects.count()}')
            self.stdout.write(f'   - Comentarios: {Comentario.objects.count()}')
            self.stdout.write(f'   - Chats: {Chat.objects.count()}')
            self.stdout.write(f'   - Mensajes: {Mensaje.objects.count()}')
            self.stdout.write(f'   - Eventos: {Evento.objects.count()}')
            self.stdout.write(f'   - Solicitudes de grupo: {SolicitudGrupo.objects.count()}')
            self.stdout.write('')
            self.stdout.write('🔑 CREDENCIALES (todas con la misma contraseña):')
            self.stdout.write(f'   Contraseña: {password}')
            self.stdout.write('   - ana_rock / luis_guitar / marta_bateria / pau_jazz / ...')
            self.stdout.write('   - sala_rock_bcn / sala_jazz_tgn / teatre_vic / ...')
            self.stdout.write('')