<?php
/**
 * 📧 IDEA Project Agency — Mailer
 * Compatible con SiteGround/CPanel (PHP 7.4+)
 * Seguridad: honeypot, rate-limit por IP, sanitización, validación
 */
declare(strict_types=1);

// ── Configuración ──────────────────────────────────────────
define('MAIL_TO', 'Idea.websites.app+formularioweb@gmail.com');
define('MAIL_FROM', 'no-reply@' . $_SERVER['HTTP_HOST']);
define('MAIL_SUBJECT', '[IDEA Project] Nueva consulta desde el sitio web');
define('RATE_LIMIT', 3);   // Máx. envíos por IP
define('RATE_WINDOW', 300); // En segundos (5 minutos)
// ───────────────────────────────────────────────────────────

// Solo aceptamos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Método no permitido.']));
}

header('Content-Type: application/json; charset=utf-8');

// ── Honeypot anti-bot ──────────────────────────────────────
$honeypot = isset($_POST['website']) ? trim($_POST['website']) : '';
if ($honeypot !== '') {
    // Es un bot, responder "ok" para no delatar el trampa
    echo json_encode(['success' => true]);
    exit;
}

// ── Rate Limiting por IP (con archivos en /tmp) ────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip_hash = md5($ip); // No guardamos la IP real
$rate_file = sys_get_temp_dir() . '/rl_idea_' . $ip_hash . '.json';

$rate_data = ['count' => 0, 'first' => time()];
if (file_exists($rate_file)) {
    $raw = @file_get_contents($rate_file);
    if ($raw) {
        $rate_data = json_decode($raw, true) ?: $rate_data;
    }
}

// Resetear ventana si expiró
if ((time() - $rate_data['first']) > RATE_WINDOW) {
    $rate_data = ['count' => 0, 'first' => time()];
}

if ($rate_data['count'] >= RATE_LIMIT) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
    ]);
    exit;
}

// Incrementar contador
$rate_data['count']++;
file_put_contents($rate_file, json_encode($rate_data), LOCK_EX);

// ── Sanitización y Validación ──────────────────────────────
function sanitize(string $value): string
{
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

$nombre = sanitize($_POST['nombre'] ?? '');
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telefono = sanitize($_POST['telefono'] ?? '');
$servicio = sanitize($_POST['servicio'] ?? '');
$mensaje = sanitize($_POST['mensaje'] ?? '');

// Campos requeridos
$errors = [];
if (empty($nombre))
    $errors[] = 'El nombre es requerido.';
if (empty($email))
    $errors[] = 'El correo es requerido.';
if (empty($servicio))
    $errors[] = 'Selecciona un servicio.';
if (empty($mensaje))
    $errors[] = 'El mensaje es requerido.';

// Validar formato de email
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El correo electrónico no es válido.';
}

// Longitud máxima (prevenir abuso)
if (strlen($nombre) > 120)
    $errors[] = 'Nombre demasiado largo.';
if (strlen($mensaje) > 1000)
    $errors[] = 'Mensaje demasiado largo (máximo 1000 caracteres).';
if (strlen($telefono) > 30)
    $errors[] = 'Teléfono demasiado largo.';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── Construcción del Email ─────────────────────────────────
$fecha = date('d/m/Y H:i:s');

$body = "=========================================\n";
$body .= " NUEVA CONSULTA — IDEA Project Agency\n";
$body .= "=========================================\n\n";
$body .= "Fecha:    $fecha\n";
$body .= "Nombre:   $nombre\n";
$body .= "Email:    $email\n";
$body .= "Teléfono: " . ($telefono ?: 'No proporcionado') . "\n";
$body .= "Servicio: $servicio\n\n";
$body .= "Mensaje:\n---------\n$mensaje\n\n";
$body .= "=========================================\n";
$body .= "Este mensaje fue enviado desde el formulario\n";
$body .= "de contacto del sitio web ideaprojet.com\n";

$headers = "From: IDEA Project Agency <" . MAIL_FROM . ">\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

// ── Envío ──────────────────────────────────────────────────
$sent = @mail(MAIL_TO, MAIL_SUBJECT, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    // Log del error para el admin (no exponer al usuario)
    error_log("[IDEA Mailer] Fallo al enviar email desde $email en " . date('c'));
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo enviar el mensaje. Contáctanos directamente por email o WhatsApp.'
    ]);
}
