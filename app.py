import json
import socket
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Tuple


WEB_ROOT = Path(__file__).parent / "web"


class QuietGameRequestHandler(SimpleHTTPRequestHandler):
    # Suppress default request logging so detached/background runs do not break
    # when stdout/stderr are no longer attached to the original terminal.
    def log_message(self, format: str, *args) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self) -> None:
        if self.path != "/reset":
            self.send_error(404, "Not Found")
            return

        payload = {
            "money": 10,
            "currentRoll": None,
            "owned": {},
            "activeRainbowId": None,
        }
        response = json.dumps(payload).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)


def create_server(host: str, start_port: int, attempts: int = 20) -> Tuple[ThreadingHTTPServer, int]:
    handler = partial(QuietGameRequestHandler, directory=str(WEB_ROOT))

    for port in range(start_port, start_port + attempts):
        try:
            server = ThreadingHTTPServer((host, port), handler)
            return server, port
        except OSError:
            continue

    raise OSError(f"Could not bind a local port in range {start_port}-{start_port + attempts - 1}")


def get_lan_ip() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return None


def main() -> None:
    host = "0.0.0.0"
    server, port = create_server(host, 5002)
    lan_ip = get_lan_ip()

    print(f"Serving brainrot idle game at http://127.0.0.1:{port}")
    if lan_ip:
        print(f"Open on phones/iPads on the same Wi-Fi: http://{lan_ip}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
