<?php
declare(strict_types=1);

namespace App\Router;

class Router
{
    private array $routes = [];
    private array $middlewareGroups = [];
    private string $prefix = '';

    public function group(string $prefix, callable $callback, array $middleware = []): void
    {
        $previousPrefix = $this->prefix;
        $this->prefix .= $prefix;
        $this->middlewareGroups[] = $middleware;
        $callback($this);
        array_pop($this->middlewareGroups);
        $this->prefix = $previousPrefix;
    }

    public function get(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, array $handler, array $middleware): void
    {
        $fullPath = $this->prefix . $path;
        $groupMiddleware = [];
        foreach ($this->middlewareGroups as $group) {
            $groupMiddleware = array_merge($groupMiddleware, $group);
        }
        $allMiddleware = array_merge($groupMiddleware, $middleware);

        $this->routes[] = [
            'method' => $method,
            'path' => $fullPath,
            'handler' => $handler,
            'middleware' => $allMiddleware,
            'pattern' => $this->buildPattern($fullPath),
            'paramNames' => $this->extractParamNames($fullPath),
        ];
    }

    private function buildPattern(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function extractParamNames(string $path): array
    {
        preg_match_all('/\{([a-zA-Z_]+)\}/', $path, $matches);
        return $matches[1] ?? [];
    }

    public function dispatch(string $method, string $uri): void
    {
    $uri = '/' . trim(parse_url($uri, PHP_URL_PATH), '/');
    if ($uri !== '/' && $uri !== '') {
    $uri = rtrim($uri, '/');
    }

    try {
    foreach ($this->routes as $route) {
    if ($route['method'] !== $method) {
    continue;
    }

    if (!preg_match($route['pattern'], $uri, $matches)) {
    continue;
    }

    $params = [];
    foreach ($route['paramNames'] as $name) {
    $params[$name] = $matches[$name] ?? null;
    }

    foreach ($route['middleware'] as $mw) {
    if (is_string($mw) && str_starts_with($mw, 'permiso:')) {
    $permisoCodigo = substr($mw, 8);
    \App\Middleware\PermissionMiddleware::check($permisoCodigo);
    } elseif (is_string($mw) && class_exists($mw)) {
    if (method_exists($mw, 'handle')) {
    $mw::handle();
    }
    }
    }

    [$controllerClass, $action] = $route['handler'];
    $controller = new $controllerClass();

    if (!empty($params)) {
    $args = $this->castParamsToActionSignature($controller, $action, array_values($params));
    $controller->$action(...$args);
    } else {
    $controller->$action();
    }

    return;
    }

    \App\Helper\ResponseHelper::error('Ruta no encontrada: ' . $method . ' ' . $uri . '. Verifique que el endpoint exista y el método HTTP sea correcto.', 404);
    } catch (\App\Helper\HttpException $e) {
    \App\Helper\ResponseHelper::error($e->getMessage(), $e->getCode());
    } catch (\Throwable $e) {
    error_log('[EDL ERROR] ' . get_class($e) . ': ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
    $debug = getenv('APP_DEBUG') === 'true';
    \App\Helper\ResponseHelper::error(
    $debug ? $e->getMessage() . ' en ' . basename($e->getFile()) . ':' . $e->getLine() : 'Error interno del servidor',
    500
    );
    }
    }

    /**
    * Convierte los parametros string (provenientes del regex del router) al
    * tipo declarado en la firma del metodo del controller, evitando que
    * strict_types=1 rompa la llamada con TypeError.
    *
    * Reglas:
    *  - int/float: si el param es numerico, castear; si no, null.
    *  - bool: true si es '1'/'true', false si es '0'/'false', null en otro caso.
    *  - string: dejar como esta (los strings del regex son validos).
    *  - array/null/union: dejar como esta.
    */
    private function castParamsToActionSignature(object $controller, string $action, array $args): array
    {
    try {
    $ref = new \ReflectionMethod($controller, $action);
    } catch (\ReflectionException $e) {
    return $args;
    }

    $params = $ref->getParameters();
    $casted = [];
    foreach ($args as $i => $value) {
    if (!isset($params[$i])) {
    $casted[] = $value;
    continue;
    }
    $type = $params[$i]->getType();
    if ($type === null) {
    $casted[] = $value;
    continue;
    }
    if ($type instanceof \ReflectionNamedType) {
    $typeName = $type->getName();
    $allowsNull = $type->allowsNull();
    if ($typeName === 'int') {
    $casted[] = (is_numeric($value)) ? (int) $value : ($allowsNull ? null : 0);
    } elseif ($typeName === 'float') {
    $casted[] = (is_numeric($value)) ? (float) $value : ($allowsNull ? null : 0.0);
    } elseif ($typeName === 'bool') {
    if ($value === '1' || $value === 'true') $casted[] = true;
    elseif ($value === '0' || $value === 'false') $casted[] = false;
    else $casted[] = $allowsNull ? null : false;
    } else {
    $casted[] = $value;
    }
    } else {
    // Union types, intersection types, etc. — dejar como esta.
    $casted[] = $value;
    }
    }
    return $casted;
    }
}
