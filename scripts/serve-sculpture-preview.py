#!/usr/bin/env python3
"""Local sculpture review, with caching disabled while meshes are regenerated."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class PreviewHandler(SimpleHTTPRequestHandler):
    def _is_allowed_host(self):
        host = (self.headers.get('Host') or '').split(':', 1)[0].lower()
        return host in ('localhost', '127.0.0.1', '[::1]', '::1', '')

    def _is_safe_path(self):
        parsed = urlsplit(self.path).path
        parts = [p for p in parsed.split('/') if p]
        if any(p.startswith('.') or p in ('node_modules', 'scripts') for p in parts):
            return False
        resolved = Path(self.translate_path(self.path)).resolve()
        root = Path(self.directory).resolve()
        return resolved == root or root in resolved.parents

    def _prepare(self):
        if not self._is_allowed_host():
            self.send_error(403, 'Forbidden host')
            return False
        if urlsplit(self.path).path == '/':
            self.path = '/sculpture-preview.html'
        if not self._is_safe_path():
            self.send_error(403, 'Forbidden path')
            return False
        return True

    def list_directory(self, path):
        self.send_error(403, 'Directory listing disabled')
        return None

    def do_GET(self):
        if self._prepare():
            super().do_GET()

    def do_HEAD(self):
        if self._prepare():
            super().do_HEAD()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4187)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    handler = partial(PreviewHandler, directory=str(root))
    print(f'Sculpture review: http://localhost:{args.port}/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
