"""
Utilidades de validación de archivos compartidas entre chat y multimedia.
"""

# Tamaño máximo por MIME (en bytes)
LIMITES_POR_MIME = {
    'image/': 10 * 1024 * 1024,            # 10 MB
    'audio/': 50 * 1024 * 1024,            # 50 MB
    'video/': 50 * 1024 * 1024,            # 50 MB
    'application/pdf': 10 * 1024 * 1024,   # 10 MB
    'text/plain': 10 * 1024 * 1024,        # 10 MB
    'application/msword': 10 * 1024 * 1024,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024,
    'application/vnd.oasis.opendocument.text': 10 * 1024 * 1024,
}

# Lista blanca de MIME types permitidos
MIMES_PERMITIDOS = set(LIMITES_POR_MIME.keys()) | {
    # Completamos los prefijos image/audio/video con MIMEs concretos:
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
    'video/mp4', 'video/webm', 'video/quicktime',
}

# Extensiones → MIME aceptado (para cuando el navegador no envía content_type)
EXTENSION_A_MIME = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'weba': 'audio/webm',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'odt': 'application/vnd.oasis.opendocument.text',
}


def _limite_para_mime(mime):
    """Devuelve el límite de bytes para un MIME dado, o None si no aplica."""
    if mime in LIMITES_POR_MIME:
        return LIMITES_POR_MIME[mime]
    # Prefijos image/, audio/, video/
    for prefijo, limite in LIMITES_POR_MIME.items():
        if prefijo.endswith('/') and mime.startswith(prefijo):
            return limite
    return None


def validar_archivo(nombre, content_type, tamano_bytes):
    """
    Valida un archivo según su MIME y tamaño.

    Devuelve:
    - (True, content_type_final) si es válido.
    - (False, mensaje_error) si no lo es.
    """
    if not nombre:
        return False, 'nombre es obligatorio'

    # Normalizar content_type
    ct = (content_type or '').strip().lower()

    # Si no viene content_type o es genérico, intentamos deducir por extensión
    if not ct or ct == 'application/octet-stream':
        ext = nombre.rsplit('.', 1)[-1].lower() if '.' in nombre else ''
        ct = EXTENSION_A_MIME.get(ext, ct)

    if ct not in MIMES_PERMITIDOS:
        return False, (
            'Tipo de archivo no permitido. '
            'Solo se aceptan imágenes, audio, vídeo, PDF y documentos de texto.'
        )

    if tamano_bytes is None:
        return True, ct

    try:
        tamano_int = int(tamano_bytes)
    except (ValueError, TypeError):
        return False, 'tamano_bytes debe ser un entero'

    limite = _limite_para_mime(ct)
    if limite is not None and tamano_int > limite:
        mb = limite // (1024 * 1024)
        return False, f'El archivo supera el límite de {mb} MB para su tipo'

    return True, ct