import time
import logging

from django_redis import get_redis_connection

logger = logging.getLogger(__name__)

PRESENCE_KEY = 'presence:users'
PRESENCE_TTL_SECONDS = 300  # 5 min


def _get_redis():
    """Devuelve la conexión Redis y la info de conexión (para diagnóstico)."""
    redis = get_redis_connection('default')
    try:
        info = redis.connection_pool.connection_kwargs
    except Exception:
        info = 'desconocido'
    print(f'[PRESENCE] Redis connection kwargs: {info}')
    return redis


def mark_online(perfil_id: int) -> None:
    print(f'[PRESENCE] mark_online({perfil_id})')
    if not perfil_id:
        print(f'[PRESENCE] mark_online: perfil_id vacío, return')
        return
    try:
        redis = _get_redis()
        now = int(time.time())
        pipe = redis.pipeline()
        pipe.zadd(PRESENCE_KEY, {str(perfil_id): now})
        pipe.zremrangebyscore(PRESENCE_KEY, '-inf', now - PRESENCE_TTL_SECONDS)
        results = pipe.execute()
        # Diagnóstico: ver qué hay realmente en Redis tras el zadd
        keys = redis.keys('*')
        members = redis.zrange(PRESENCE_KEY, 0, -1, withscores=True)
        print(f'[PRESENCE] mark_online({perfil_id}) OK, pipe results: {results}')
        print(f'[PRESENCE]   redis KEYS("*"): {keys}')
        print(f'[PRESENCE]   redis ZRANGE({PRESENCE_KEY}): {members}')
    except Exception as e:
        print(f'[PRESENCE] mark_online({perfil_id}) ERROR: {e!r}')
        raise


def mark_offline(perfil_id: int) -> None:
    print(f'[PRESENCE] mark_offline({perfil_id})')
    if not perfil_id:
        return
    try:
        redis = get_redis_connection('default')
        result = redis.zrem(PRESENCE_KEY, str(perfil_id))
        print(f'[PRESENCE] mark_offline({perfil_id}) OK, zrem result: {result}')
    except Exception as e:
        print(f'[PRESENCE] mark_offline({perfil_id}) ERROR: {e!r}')
        raise


def count_online() -> int:
    try:
        redis = get_redis_connection('default')
        now = int(time.time())
        # Sin pipeline: lectura directa
        raw_members = redis.zrange(PRESENCE_KEY, 0, -1, withscores=True)
        raw_count = redis.zcount(PRESENCE_KEY, now - PRESENCE_TTL_SECONDS, '+inf')
        print(f'[PRESENCE] count_online: now={now}, now-300={now - PRESENCE_TTL_SECONDS}')
        print(f'[PRESENCE] count_online: zrange={raw_members}')
        print(f'[PRESENCE] count_online: zcount={raw_count}')
        # Y con pipeline (lo que había)
        pipe = redis.pipeline()
        pipe.zremrangebyscore(PRESENCE_KEY, '-inf', now - PRESENCE_TTL_SECONDS)
        pipe.zcount(PRESENCE_KEY, now - PRESENCE_TTL_SECONDS, '+inf')
        results = pipe.execute()
        count = int(results[1] or 0)
        print(f'[PRESENCE] count_online: pipeline results={results}, count={count}')
        return count
    except Exception as e:
        print(f'[PRESENCE] count_online ERROR: {e!r}')
        return 0