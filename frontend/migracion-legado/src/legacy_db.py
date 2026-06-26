import re

class LegacyDB:
    """
    Parsea los archivos SQL del sistema legacy (gestion) y
    provee una interfaz de consulta en memoria.
    """

    def __init__(self, data_dir: str = "/storage/emulated/0/edl"):
        self.data_dir = data_dir
        self.funcionarios: dict[int, dict] = {}
        self.dependencias: dict[int, dict] = {}
        self.responsables: dict[int, list[dict]] = {}
        self.cargos: dict[int, dict] = {}
        self.detalles_cargo: dict[int, dict] = {}
        self.encargos: list[dict] = []
        self._loaded = False

    def load(self):
        self._parse_funcionarios()
        self._parse_dependencias()
        self._parse_cargos()
        self._parse_detalles_cargo()
        self._parse_responsables()
        self._parse_encargos()
        self._loaded = True

    def _read_file(self, filename: str) -> str:
        import os
        path = os.path.join(self.data_dir, filename)
        with open(path, encoding="utf-8") as f:
            return f.read()

    def _find_insert(self, content: str):
        m = re.search(
            r"INSERT INTO\s+`?\w+`?\s*(?:\([^)]+\))?\s*VALUES\s*(.*?);\s*(?:--|ALTER|INSERT|COMMIT|\Z)",
            content, re.DOTALL | re.IGNORECASE
        )
        if m:
            return m.group(1).strip().rstrip(";")
        return ""

    def _parse_row(self, row_text: str) -> list:
        """Parse a single SQL row like (1, 39425357, 'ALBA NELLY', ...)
        Handling commas inside quoted strings."""
        row_text = row_text.strip()
        if row_text.startswith("("):
            row_text = row_text[1:]
        if row_text.endswith(")"):
            row_text = row_text[:-1]
            if row_text.endswith(","):
                row_text = row_text[:-1]

        values = []
        current = ""
        in_quote = False
        quote_char = None
        i = 0
        while i < len(row_text):
            ch = row_text[i]
            if in_quote:
                if ch == "\\":
                    current += ch
                    if i + 1 < len(row_text):
                        current += row_text[i + 1]
                        i += 1
                elif ch == quote_char:
                    in_quote = False
                else:
                    current += ch
            elif ch in ("'", '"'):
                in_quote = True
                quote_char = ch
            elif ch == ",":
                values.append(self._cast(current.strip()))
                current = ""
            else:
                current += ch
            i += 1
        if current.strip():
            values.append(self._cast(current.strip()))
        return values

    def _cast(self, val: str):
        if val == "NULL":
            return None
        if val.startswith("'") and val.endswith("'"):
            return val[1:-1]
        if val.startswith('"') and val.endswith('"'):
            return val[1:-1]
        try:
            return int(val)
        except ValueError:
            try:
                return float(val)
            except ValueError:
                return val

    def _parse_funcionarios(self):
        content = self._read_file("funcionarios (2).sql")
        insert_block = self._find_insert(content)
        last_end = 0
        rows_text = []
        depth = 0
        start = 0
        for i, ch in enumerate(insert_block):
            if ch == "(":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth == 0:
                    rows_text.append(insert_block[start:i+1])
        for rt in rows_text:
            vals = self._parse_row(rt)
            if len(vals) >= 9:
                fid = vals[0]
                self.funcionarios[fid] = {
                    "id": fid,
                    "cedula": vals[1] if vals[1] else "0",
                    "nombre": vals[2] or "",
                    "fecha_nacimiento": vals[3],
                    "telefono": vals[4],
                    "direccion": vals[5] or "",
                    "correo": vals[6] or "",
                    "is_active": vals[7] if vals[7] is not None else 1,
                    "id_super_usuario": vals[8] if vals[8] is not None else 0,
                }

    def _parse_dependencias(self):
        content = self._read_file("dependencias.sql")
        insert_block = self._find_insert(content)
        for m in re.finditer(r"\((\d+),\s*'([^']*)',\s*(\d+)\)", insert_block):
            did, desc, parent = int(m.group(1)), m.group(2), int(m.group(3))
            self.dependencias[did] = {
                "id": did,
                "descripcion": desc,
                "id_dependencia": parent,
            }

    def _parse_cargos(self):
        content = self._read_file("tbl_cargo.sql")
        insert_block = self._find_insert(content)
        for m in re.finditer(
            r"\((\d+),\s*(\d+),\s*(\d+),\s*'([^']*)'\)", insert_block
        ):
            cid, nivel, natura, desc = (
                int(m.group(1)),
                int(m.group(2)),
                int(m.group(3)),
                m.group(4),
            )
            self.cargos[cid] = {
                "id": cid,
                "id_nivel": nivel,
                "id_naturaleza": natura,
                "descripcion": desc.replace("\\n", " ").strip(),
            }

    def _parse_detalles_cargo(self):
        content = self._read_file("tbl_detalle_cargo (1).sql")
        insert_block = self._find_insert(content)
        for m in re.finditer(
            r"\((\d+),\s*(\d+),\s*(\d+),\s*'([^']*)'\)", insert_block
        ):
            did, id_dep, id_cargo, desc = (
                int(m.group(1)),
                int(m.group(2)),
                int(m.group(3)),
                m.group(4),
            )
            self.detalles_cargo[did] = {
                "id": did,
                "id_dependencia": id_dep,
                "id_tbl_cargo": id_cargo,
                "descripcion": desc,
            }

    def _parse_responsables(self):
        content = self._read_file("responsables (1).sql")
        insert_block = self._find_insert(content)
        depth = 0
        start = 0
        rows_text = []
        for i, ch in enumerate(insert_block):
            if ch == "(":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth == 0:
                    rows_text.append(insert_block[start : i + 1])
        for rt in rows_text:
            vals = self._parse_row(rt)
            if len(vals) >= 7:
                rid = vals[0]
                id_func = vals[1]
                id_dep = vals[2] if vals[2] is not None else 0
                is_active = vals[4] if vals[4] is not None else 1
                id_cargo = vals[5] if vals[5] is not None else 0
                id_detalle = vals[6] if vals[6] is not None else 0
                entry = {
                    "id": rid,
                    "id_funcionarios": id_func,
                    "id_dependencia": id_dep,
                    "id_tbl_cargo": id_cargo,
                    "id_tbl_detalle_cargo": id_detalle,
                    "is_active": is_active,
                }
                if id_func not in self.responsables:
                    self.responsables[id_func] = []
                self.responsables[id_func].append(entry)

    def _parse_encargos(self):
        content = self._read_file("encargos.sql")
        insert_block = self._find_insert(content)
        depth = 0
        start = 0
        rows_text = []
        for i, ch in enumerate(insert_block):
            if ch == "(":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth == 0:
                    rows_text.append(insert_block[start : i + 1])
        for rt in rows_text:
            vals = self._parse_row(rt)
            if len(vals) >= 9:
                self.encargos.append({
                    "id": vals[0],
                    "dependencia_a": vals[1],
                    "responsable_a": vals[2],
                    "responsable_e": vals[3],
                    "fecha_inicio": vals[4],
                    "fecha_salida": vals[5],
                    "id_decreto": vals[6],
                    "fecha_creacion": vals[7],
                    "hora": vals[8],
                    "id_usuario": vals[9] if len(vals) > 9 else 0,
                })

    # --- Query methods ---

    def get_funcionario_by_cedula(self, cedula: str | int) -> dict | None:
        for f in self.funcionarios.values():
            if str(f["cedula"]) == str(cedula):
                return f
        return None

    def get_funcionario(self, fid: int) -> dict | None:
        return self.funcionarios.get(fid)

    def get_responsables(self, fid: int) -> list[dict]:
        return self.responsables.get(fid, [])

    def get_responsable_activo(self, fid: int) -> dict | None:
        for r in self.responsables.get(fid, []):
            if r.get("is_active") == 1:
                return r
        return self.responsables.get(fid, [None])[0]

    def get_cargo(self, cid: int) -> dict | None:
        return self.cargos.get(cid)

    def get_detalle_cargo(self, did: int) -> dict | None:
        return self.detalles_cargo.get(did)

    def get_dependencia(self, did: int) -> dict | None:
        return self.dependencias.get(did)

    def get_all_funcionarios(self) -> list[dict]:
        return list(self.funcionarios.values())

    def get_all_dependencias(self) -> list[dict]:
        return list(self.dependencias.values())

    def get_all_cargos(self) -> list[dict]:
        return list(self.cargos.values())

    def resolve_cargo(self, cedula: str | int) -> str | None:
        """Get the cargo name for a person by cedula."""
        func = self.get_funcionario_by_cedula(cedula)
        if not func:
            return None
        resp = self.get_responsable_activo(func["id"])
        if not resp:
            return None
        cid = resp["id_tbl_cargo"]
        did = resp["id_tbl_detalle_cargo"]
        if cid == 0 and did:
            det = self.get_detalle_cargo(did)
            if det:
                cid = det["id_tbl_cargo"]
        cname = self.get_cargo(cid)["descripcion"] if self.get_cargo(cid) else ""
        dname = self.get_detalle_cargo(did)["descripcion"] if did and self.get_detalle_cargo(did) else ""
        if cname and dname:
            parts = dname.split(" - ")
            area = parts[-1].strip() if len(parts) > 1 else ""
            if area.upper() == cname.upper() or not area:
                return cname
            return f"{cname} - {area}"
        return cname or dname or None

    def resolve_dependencia_id(self, cedula: str | int) -> int | None:
        """Get the legacy dependencia ID for a person by cedula."""
        func = self.get_funcionario_by_cedula(cedula)
        if not func:
            return None
        resp = self.get_responsable_activo(func["id"])
        if not resp:
            return None
        return resp["id_dependencia"]
