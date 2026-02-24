#!/usr/bin/env python3
"""
🚀 IDEA Project Agency — Servidor de Desarrollo Local
======================================================
Imita el comportamiento de Apache + .htaccess en local:
  ✅ URLs limpias sin .html  (ej: /paginas/servicios → sirve servicios.html)
  ✅ Página de error 404 personalizada
  ✅ Sirve index.html en directorios

Uso:
    python dev-server.py [puerto]

Ejemplo:
    python dev-server.py        → http://localhost:8005
    python dev-server.py 3000   → http://localhost:3000
"""

import http.server
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8005
ROOT = os.path.dirname(os.path.abspath(__file__))


class IDEAHandler(http.server.SimpleHTTPRequestHandler):

    def log_message(self, format, *args):
        status = args[1] if len(args) > 1 else '?'
        color = '\033[92m' if str(status).startswith('2') else (
                '\033[93m' if str(status).startswith('3') else '\033[91m')
        reset = '\033[0m'
        print(f"  {color}{status}{reset}  {args[0]}")

    def translate_path(self, path):
        # Decodificar la URL
        path = urllib.parse.unquote(path.split('?')[0].split('#')[0])

        # Construir ruta en disco
        fspath = os.path.join(ROOT, path.lstrip('/').replace('/', os.sep))

        return fspath

    def resolve_path(self, path):
        """
        Resuelve la ruta siguiendo las mismas reglas que el .htaccess:
        1. Si existe el archivo exacto → sírvelo
        2. Si existe como directorio  → busca index.html dentro
        3. Si existe agreando .html   → sírvelo (URL limpia)
        4. No existe                  → 404
        Devuelve (filepath, found: bool)
        """
        fspath = self.translate_path(path)

        # 1. Archivo exacto
        if os.path.isfile(fspath):
            return fspath, True

        # 2. Directorio → index.html
        if os.path.isdir(fspath):
            index = os.path.join(fspath, 'index.html')
            if os.path.isfile(index):
                return index, True

        # 3. URL limpia: agregar .html
        with_html = fspath.rstrip(os.sep) + '.html'
        if os.path.isfile(with_html):
            return with_html, True

        return fspath, False

    def do_GET(self):
        path = urllib.parse.unquote(self.path.split('?')[0])
        filepath, found = self.resolve_path(path)

        if found:
            self.serve_file(filepath)
        else:
            self.serve_404()

    def serve_file(self, filepath):
        ext = os.path.splitext(filepath)[1].lower()
        content_types = {
            '.html': 'text/html; charset=utf-8',
            '.css':  'text/css; charset=utf-8',
            '.js':   'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.svg':  'image/svg+xml',
            '.png':  'image/png',
            '.jpg':  'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.ico':  'image/x-icon',
            '.woff': 'font/woff',
            '.woff2':'font/woff2',
            '.pdf':  'application/pdf',
            '.php':  'text/plain; charset=utf-8',  # PHP no ejecuta en local
        }
        ctype = content_types.get(ext, 'application/octet-stream')

        try:
            with open(filepath, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            print(f"  ⚠️  Error leyendo {filepath}: {e}")
            self.serve_404()

    def serve_404(self):
        page_404 = os.path.join(ROOT, '404.html')
        try:
            with open(page_404, 'rb') as f:
                data = f.read()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            # Fallback si no existe 404.html
            msg = b'<h1>404 - Not Found</h1>'
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(msg)


if __name__ == '__main__':
    os.chdir(ROOT)
    print(f"\n  IDEA Dev Server")
    print(f"  -----------------------------------")
    print(f"  URL:   http://localhost:{PORT}")
    print(f"  Root:  {ROOT}")
    print(f"  -----------------------------------")
    print(f"  [OK] URLs limpias sin .html habilitadas")
    print(f"  [OK] Pagina 404 personalizada activa")
    print(f"  [!!] PHP no ejecuta en local (necesita SiteGround)")
    print(f"  -----------------------------------")
    print(f"  Presiona Ctrl+C para detener\n")

    with http.server.ThreadingHTTPServer(('', PORT), IDEAHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Servidor detenido.\n")
