"""
Adaptador: mapea datos del sistema legacy (gestion) al schema de edl-carepa.

Provee:
- Mapeo de IDs de dependencias legacy -> edl-carepa
- TransformaciÃ³n de funcionarios/cargos a formato usuarios
- GeneraciÃ³n de sentencias SQL INSERT/UPDATE
- Llamadas a la API REST de edl-carepa
"""

import json
import time
import urllib.request
import urllib.error

# Mapeo de IDs legacy -> IDs edl-carepa (API)
# Obtenido por comparaciÃ³n de nombres normalizados
LEGACY_TO_API_DEPENDENCIA = {
    1: 6,    # SecretarÃ­a de Agricultura y Medio Ambiente
    2: 7,    # SecretarÃ­a de EducaciÃ³n
    3: 8,    # SecretarÃ­a de General y Servicios Administrativos
    4: 9,    # Secretaria de Gobierno Y ParticipaciÃ³n Ciudadana
    5: 10,   # Secretaria de PlaneaciÃ³n, OOPPMM, Vivienda y Ordenamiento Territorial
    6: 11,   # SecretarÃ­a de Salud y ProtecciÃ³n Social
    7: 12,   # SecretarÃ­a de Transito y Transporte
    8: 13,   # Secretaria, de Hacienda
    9: 14,   # InspecciÃ³n
    10: 15,  # Comisaria
    11: 16,  # SisbÃ©n
    12: 17,  # Despacho del Alcalde
    13: 18,  # Oficina de Juridica
    17: 19,  # Comunicaciones
    18: 20,  # Control Interno
    19: 21,  # TesorerÃ­a
    20: 22,  # SecretarÃ­a de PlaneaciÃ³n, Vivienda y Ordenamiento Territorial
    21: 23,  # SecretarÃ­a de Infraestructura FÃ­sica
}

API_TO_LEGACY_DEPENDENCIA = {v: k for k, v in LEGACY_TO_API_DEPENDENCIA.items()}


class APIClient:
    """Cliente HTTP para la API REST de edl-carepa."""

    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url.rstrip("/")
        self.token = None

    def login(self, documento: str = "12345678", password: str = "Admin2026!"):
        resp = self._request("POST", "/auth/login", json={
            "documento": documento,
            "password": password,
        })
        self.token = resp["data"]["token"]

    def _request(self, method: str, path: str, **kwargs):
        url = f"{self.base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        data = kwargs.get("json")
        if data is not None:
            data = json.dumps(data).encode()
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req) as resp:
                    return json.loads(resp.read())
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    wait = 2 ** attempt
                    time.sleep(wait)
                    continue
                raise
            except Exception:
                raise

    def get(self, path: str, params: dict | None = None):
        qs = ""
        if params:
            qs = "?" + "&".join(f"{k}={v}" for k, v in params.items())
        return self._request("GET", f"{path}{qs}")

    def put(self, path: str, data: dict):
        return self._request("PUT", path, json=data)

    def get_usuarios(self) -> list[dict]:
        all_users = []
        page = 1
        while True:
            resp = self.get("/usuarios", {"pagina": page, "por_pagina": 200})
            data = resp.get("data", {}).get("data", [])
            if not data:
                break
            all_users.extend(data)
            page += 1
        return all_users

    def get_dependencias(self) -> list[dict]:
        resp = self.get("/dependencias")
        data = resp.get("data", [])
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data if isinstance(data, list) else []

    def update_usuario(self, uid: int, data: dict):
        return self.put(f"/usuarios/{uid}", data)


def cargo_str(legacy: "LegacyDB", cedula: str | int) -> str | None:
    """Genera el string de denominacion_empleo para un usuario."""
    return legacy.resolve_cargo(cedula)


def dependencia_api_id(legacy: "LegacyDB", cedula: str | int) -> int | None:
    """Obtiene el ID de dependencia en edl-carepa para un usuario."""
    legacy_dep_id = legacy.resolve_dependencia_id(cedula)
    if legacy_dep_id is None:
        return None
    return LEGACY_TO_API_DEPENDENCIA.get(legacy_dep_id)


def generar_sql_update_usuario(uid: int, campos: dict) -> str:
    """Genera sentencia SQL UPDATE para edl-carepa."""
    sets = []
    for col, val in campos.items():
        if val is None:
            sets.append(f"`{col}` = NULL")
        elif isinstance(val, int):
            sets.append(f"`{col}` = {val}")
        else:
            escaped = str(val).replace("'", "\\'")
            sets.append(f"`{col}` = '{escaped}'")
    return f"UPDATE `usuarios` SET {', '.join(sets)} WHERE `id` = {uid};"


def generar_sql_insert_dependencia(legacy_dep: dict, api_id: int) -> str:
    """Genera INSERT para la tabla dependencias de edl-carepa."""
    nombre = legacy_dep["descripcion"].replace("'", "\\'")
    codigo = f"DEP-{api_id:02d}"
    return (
        f"INSERT INTO `dependencias` (`id`, `entidad_id`, `codigo`, `nombre`, `estado`) "
        f"VALUES ({api_id}, 1, '{codigo}', '{nombre}', 'activa');"
    )
