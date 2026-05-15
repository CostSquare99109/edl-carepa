<?php

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
                $args = array_values($params);
                $controller->$action(...$args);
            } else {
                $controller->$action();
            }

            return;
        }

        \App\Helper\ResponseHelper::error('Ruta no encontrada', 404);
    }
}
