<?php
declare(strict_types=1);

/**
 * Tests unitarios para BaseRepository usando SQLite en memoria.
 * Ejecutar: php tests/unit_base_repository_test.php
 */

require_once __DIR__ . '/../backend/vendor/autoload.php';

use App\Repository\BaseRepository;

class TestRepo extends BaseRepository
{
    protected string $table = 'test_items';
    protected array $allowedFilterFields = ['nombre', 'estado', 'categoria_id'];
    protected array $allowedSortFields = ['id', 'nombre', 'creado_en'];

    public function eliminar(int $id): bool
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET eliminado_en = datetime('now') WHERE {$this->primaryKey} = ?");
        return $stmt->execute([$id]);
    }
}

// Setup
$pdo = new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec("CREATE TABLE test_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    estado TEXT DEFAULT 'activo',
    categoria_id INTEGER DEFAULT 1,
    eliminado_en TEXT,
    creado_en TEXT,
    actualizado_en TEXT
)");

$repo = new TestRepo($pdo);

$pass = 0;
$fail = 0;
$idx = 0;

function check(string $name, mixed $expected, mixed $actual): void
{
    global $pass, $fail, $idx;
    $idx++;
    if ($expected === $actual) {
        $pass++;
        echo "  OK   [{$idx}] {$name}\n";
    } else {
        $fail++;
        $e = is_string($expected) ? $expected : var_export($expected, true);
        $a = is_string($actual) ? $actual : var_export($actual, true);
        echo "  FAIL [{$idx}] {$name}\n    expected={$e}\n    actual  ={$a}\n";
    }
}

echo "=== Unit Tests: BaseRepository ===\n\n";

echo "--- crear() ---\n";
$id1 = $repo->crear(['nombre' => 'Alpha', 'estado' => 'activo']);
check('crear retorna ID > 0', true, $id1 > 0);

$id2 = $repo->crear(['nombre' => 'Beta', 'estado' => 'inactivo']);
$id3 = $repo->crear(['nombre' => 'Gamma', 'estado' => 'activo']);
check('crear 3 items', true, $id3 > $id1);

echo "\n--- buscarPorId() ---\n";
$item = $repo->buscarPorId($id1);
check('buscarPorId existe', 'Alpha', $item['nombre']);
check('buscarPorId inexistente', null, $repo->buscarPorId(9999));

echo "\n--- listar() basico ---\n";
$r = $repo->listar();
check('listar total=3', 3, $r['total']);
check('listar data count=3', 3, count($r['data']));
check('listar pagina=1', 1, $r['pagina']);

echo "\n--- listar() paginacion ---\n";
$r2 = $repo->listar([], 1, 2);
check('page1 por_pagina=2 count=2', 2, count($r2['data']));
$r3 = $repo->listar([], 2, 2);
check('page2 count=1', 1, count($r3['data']));

echo "\n--- listar() filtros ---\n";
$r = $repo->listar(['nombre' => 'Alpha']);
check('filtro nombre LIKE Alpha total=1', 1, $r['total']);
check('filtro nombre Alpha encontrado', 'Alpha', $r['data'][0]['nombre']);

$r = $repo->listar(['estado' => ['activo']]);
check('filtro IN solo activo total=2', 2, $r['total']);

$r = $repo->listar(['estado' => ['activo', 'inactivo']]);
check('filtro IN todos total=3', 3, $r['total']);

// Campo no en allowedFilterFields -> ignorado
$r = $repo->listar(['campo_basura' => 'x']);
check('campo no permitido ignorado total=3', 3, $r['total']);

echo "\n--- listar() ordenamiento ---\n";
$r = $repo->listar([], 1, 20, 'nombre', 'ASC');
check('order nombre ASC primer=Alpha', 'Alpha', $r['data'][0]['nombre']);
$r = $repo->listar([], 1, 20, 'nombre', 'DESC');
check('order nombre DESC primer=Gamma', 'Gamma', $r['data'][0]['nombre']);

echo "\n--- actualizar() ---\n";
$ok = $repo->actualizar($id1, ['nombre' => 'Alpha Updated']);
check('actualizar retorna true', true, $ok);
$item = $repo->buscarPorId($id1);
check('actualizar cambio visible', 'Alpha Updated', $item['nombre']);

// Guarded fields ignorados
$repo->actualizar($id1, ['nombre' => 'X', 'id' => 999, 'eliminado_en' => '2026-01-01']);
$item = $repo->buscarPorId($id1);
check('guarded id no cambiado', 'X', $item['nombre']);
check('guarded eliminado_en no cambiado', null, $item['eliminado_en']);

echo "\n--- eliminar() soft delete ---\n";
$ok = $repo->eliminar($id2);
check('eliminar retorna true', true, $ok);
check('eliminar ya no visible', null, $repo->buscarPorId($id2));
$r = $repo->listar();
check('eliminar reduce total a 2', 2, $r['total']);

echo "\n--- buscarPorCampo() ---\n";
$item = $repo->buscarPorCampo('nombre', 'Gamma');
check('buscarPorCampo existe', 'Gamma', $item['nombre']);
check('buscarPorCampo inexistente', null, $repo->buscarPorCampo('nombre', 'Nope'));
check('campo injection rechazado', null, $repo->buscarPorCampo('id=1 OR 1=1', 'x'));

echo "\n--- existe() ---\n";
check('existe X=true', true, $repo->existe('nombre', 'X'));
check('existe NoExiste=false', false, $repo->existe('nombre', 'NoExiste'));
check('existe con excluirId', false, $repo->existe('nombre', 'X', $id1));
check('existe campo injection', false, $repo->existe('id=1 OR 1=1', 'x'));

echo "\n--- filtrarCampos() protegidos ---\n";
$idNew = $repo->crear(['nombre' => 'Test', 'estado' => 'activo', 'id' => 999, 'eliminado_en' => '2020-01-01']);
$item = $repo->buscarPorId($idNew);
check('crear ignora id protegido', true, $item['id'] !== 999);
check('crear ignora eliminado_en', null, $item['eliminado_en']);

echo "\n--- getPdo() ---\n";
check('getPdo retorna PDO', true, $repo->getPdo() instanceof PDO);

echo "\n=== RESUMEN: {$pass} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
