<?php

namespace App\Helper;

class ValidatorHelper
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleList = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;

            foreach ($ruleList as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    private function applyRule(string $field, mixed $value, string $rule): void
    {
        $params = [];
        if (str_contains($rule, ':')) {
            [$rule, $paramStr] = explode(':', $rule, 2);
            $params = explode(',', $paramStr);
        }

        $label = ucfirst(str_replace('_', ' ', $field));

        match ($rule) {
            'required' => $this->checkRequired($field, $value, $label),
            'email' => $this->checkEmail($field, $value, $label),
            'min' => $this->checkMin($field, $value, $label, (int) ($params[0] ?? 0)),
            'max' => $this->checkMax($field, $value, $label, (int) ($params[0] ?? 0)),
            'integer' => $this->checkInteger($field, $value, $label),
            'numeric' => $this->checkNumeric($field, $value, $label),
            'alpha' => $this->checkAlpha($field, $value, $label),
            'alpha_num' => $this->checkAlphaNum($field, $value, $label),
            'in' => $this->checkIn($field, $value, $label, $params),
            'date' => $this->checkDate($field, $value, $label),
            'documento' => $this->checkDocumento($field, $value, $label),
            'telefono' => $this->checkTelefono($field, $value, $label),
            default => null,
        };
    }

    private function addError(string $field, string $message): void
    {
        $this->errors[$field] = $this->errors[$field] ?? $message;
    }

    private function checkRequired(string $field, mixed $value, string $label): void
    {
        if ($value === null || $value === '' || $value === []) {
            $this->addError($field, "{$label} es obligatorio");
        }
    }

    private function checkEmail(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "{$label} debe ser un email valido");
        }
    }

    private function checkMin(string $field, mixed $value, string $label, int $min): void
    {
        if ($value !== null && $value !== '' && mb_strlen((string) $value) < $min) {
            $this->addError($field, "{$label} debe tener al menos {$min} caracteres");
        }
    }

    private function checkMax(string $field, mixed $value, string $label, int $max): void
    {
        if ($value !== null && $value !== '' && mb_strlen((string) $value) > $max) {
            $this->addError($field, "{$label} no debe exceder {$max} caracteres");
        }
    }

    private function checkInteger(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_INT) && $value !== '0' && $value !== 0) {
            $this->addError($field, "{$label} debe ser un numero entero");
        }
    }

    private function checkNumeric(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !is_numeric($value)) {
            $this->addError($field, "{$label} debe ser numerico");
        }
    }

    private function checkAlpha(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', (string) $value)) {
            $this->addError($field, "{$label} debe contener solo letras");
        }
    }

    private function checkAlphaNum(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !preg_match('/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/', (string) $value)) {
            $this->addError($field, "{$label} contiene caracteres no permitidos");
        }
    }

    private function checkIn(string $field, mixed $value, string $label, array $params): void
    {
        if ($value !== null && $value !== '' && !in_array($value, $params, true)) {
            $allowed = implode(', ', $params);
            $this->addError($field, "{$label} debe ser uno de: {$allowed}");
        }
    }

    private function checkDate(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '') {
            $parsed = date_create($value);
            if (!$parsed || date_format($parsed, 'Y-m-d') !== substr($value, 0, 10)) {
                $this->addError($field, "{$label} debe ser una fecha valida");
            }
        }
    }

    private function checkDocumento(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !preg_match('/^[0-9]{6,20}$/', (string) $value)) {
            $this->addError($field, "{$label} debe contener entre 6 y 20 digitos");
        }
    }

    private function checkTelefono(string $field, mixed $value, string $label): void
    {
        if ($value !== null && $value !== '' && !preg_match('/^[0-9\+\-\s]{7,20}$/', (string) $value)) {
            $this->addError($field, "{$label} no es un telefono valido");
        }
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
