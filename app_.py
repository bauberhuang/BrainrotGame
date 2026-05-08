import json
import hashlib
import socket
import sqlite3
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Tuple

PROJECT_ROOT = Path(__file__).parent
DB_PATH = PROJECT_ROOT / "accounts.db"
GAME_DATA_PATH = PROJECT_ROOT / "game_data.json"

# Load game data once at startup
with open(GAME_DATA_PATH, "r", encoding="utf-8") as f:
    _gd = json.load(f)

CHARACTERS = _gd["characters"]
LUCKY_BLOCK_CHARACTERS = _gd["luckyBlockCharacters"]
ADMIN_ONLY_CHARACTERS = _gd["adminOnlyCharacters"]
SAILING_BOATS = _gd["sailingBoats"]
SAILING_ISLANDS = _gd["sailingIslands"]
MUTATIONS = _gd["mutations"]
EVENT_MUTATION_WEIGHTS = _gd["eventMutationWeights"]
PLAYTIME_MILESTONES = _gd["playtimeMilestones"]
CONSTANTS = _gd["constants"]
CHARACTER_BY_ID = _gd["characterById"]
LUCKY_BLOCK_BY_ID = _gd["luckyBlockById"]
SAILING_ISLAND_BY_ID = _gd["sailingIslandById"]
SAILING_BOAT_BY_ID = _gd["sailingBoatById"]
TOTAL_CHARACTER_VALUE = _gd["totalCharacterValue"]
DEFAULT_LUCKY_BLOCK_IDS = _gd["defaultLuckyBlockIds"]
SAILING_REWARD_CHARACTERS = _gd["sailingRewardCharacters"]
SAILING_REWARD_BY_ID = _gd["sailingRewardById"]


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            save_data TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username)
        )
    """)
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    salt = "brainrot-casino-salt-v1"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# HTTP Request Handler
# ---------------------------------------------------------------------------

class GameRequestHandler(SimpleHTTPRequestHandler):
    """Serve static files + JSON API endpoints for account management."""

    def log_message(self, format: str, *args) -> None:
        return  # suppress log noise

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self) -> None:
        if self.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:
        path = self.path
        body_raw = self._read_body()
        try:
            data = json.loads(body_raw) if body_raw else {}
        except json.JSONDecodeError:
            self._json_reply(400, {"ok": False, "error": "Invalid JSON"})
            return

        routes = {
            "/api/signup": self._handle_signup,
            "/api/signin": self._handle_signin,
            "/api/settings/username": self._handle_change_username,
            "/api/settings/password": self._handle_change_password,
            "/api/save": self._handle_save,
            "/api/load": self._handle_load,
            "/api/game-data": self._handle_game_data,
        }

        handler = routes.get(path)
        if handler:
            handler(data)
        else:
            self._json_reply(404, {"ok": False, "error": "Not Found"})

    def _handle_game_data(self, _data: dict) -> None:
        """Serve all game data as a single JSON blob."""
        self._json_reply(200, {
            "characters": CHARACTERS,
            "luckyBlockCharacters": LUCKY_BLOCK_CHARACTERS,
            "adminOnlyCharacters": ADMIN_ONLY_CHARACTERS,
            "sailingBoats": SAILING_BOATS,
            "sailingIslands": SAILING_ISLANDS,
            "mutations": MUTATIONS,
            "eventMutationWeights": EVENT_MUTATION_WEIGHTS,
            "playtimeMilestones": PLAYTIME_MILESTONES,
            "constants": CONSTANTS,
            "characterById": CHARACTER_BY_ID,
            "luckyBlockById": LUCKY_BLOCK_BY_ID,
            "sailingIslandById": SAILING_ISLAND_BY_ID,
            "sailingBoatById": SAILING_BOAT_BY_ID,
            "totalCharacterValue": TOTAL_CHARACTER_VALUE,
            "defaultLuckyBlockIds": DEFAULT_LUCKY_BLOCK_IDS,
            "sailingRewardCharacters": SAILING_REWARD_CHARACTERS,
            "sailingRewardById": SAILING_REWARD_BY_ID,
        })

    # ---- helpers ----

    def _read_body(self) -> str:
        length = int(self.headers.get("Content-Length", 0))
        if length > 0:
            return self.rfile.read(length).decode("utf-8")
        return ""

    def _json_reply(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ---- API handlers ----

    def _handle_signup(self, data: dict) -> None:
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()

        if not username or not password:
            self._json_reply(400, {"ok": False, "error": "Username and password are required."})
            return
        if len(username) < 2 or len(username) > 24:
            self._json_reply(400, {"ok": False, "error": "Username must be 2-24 characters."})
            return
        if len(password) < 3 or len(password) > 64:
            self._json_reply(400, {"ok": False, "error": "Password must be 3-64 characters."})
            return

        try:
            conn = get_db()
            conn.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, hash_password(password)),
            )
            conn.commit()
            conn.close()
            self._json_reply(200, {"ok": True})
        except sqlite3.IntegrityError:
            self._json_reply(409, {"ok": False, "error": "Username already taken."})

    def _handle_signin(self, data: dict) -> None:
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()

        if not username or not password:
            self._json_reply(400, {"ok": False, "error": "Username and password are required."})
            return

        conn = get_db()
        row = conn.execute(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            (username, hash_password(password)),
        ).fetchone()

        if not row:
            conn.close()
            self._json_reply(401, {"ok": False, "error": "Invalid username or password."})
            return

        # Load saved game state if any
        save_row = conn.execute(
            "SELECT save_data FROM saves WHERE username = ?", (username,)
        ).fetchone()
        conn.close()

        save_data = None
        if save_row:
            try:
                save_data = json.loads(save_row["save_data"])
            except (json.JSONDecodeError, TypeError):
                save_data = None

        self._json_reply(200, {"ok": True, "saveData": save_data})

    def _handle_change_username(self, data: dict) -> None:
        username = (data.get("username") or "").strip()
        new_username = (data.get("newUsername") or "").strip()

        if not username or not new_username:
            self._json_reply(400, {"ok": False, "error": "Username and new username are required."})
            return
        if len(new_username) < 2 or len(new_username) > 24:
            self._json_reply(400, {"ok": False, "error": "New username must be 2-24 characters."})
            return

        try:
            conn = get_db()
            conn.execute("UPDATE users SET username = ? WHERE username = ?", (new_username, username))
            # Also update saves foreign key
            conn.execute("UPDATE saves SET username = ? WHERE username = ?", (new_username, username))
            conn.commit()
            conn.close()
            self._json_reply(200, {"ok": True, "newUsername": new_username})
        except sqlite3.IntegrityError:
            self._json_reply(409, {"ok": False, "error": "That username is already taken."})

    def _handle_change_password(self, data: dict) -> None:
        username = (data.get("username") or "").strip()
        old_password = (data.get("oldPassword") or "").strip()
        new_password = (data.get("newPassword") or "").strip()

        if not username or not old_password or not new_password:
            self._json_reply(400, {"ok": False, "error": "All fields are required."})
            return
        if len(new_password) < 3 or len(new_password) > 64:
            self._json_reply(400, {"ok": False, "error": "New password must be 3-64 characters."})
            return

        conn = get_db()
        row = conn.execute(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            (username, hash_password(old_password)),
        ).fetchone()

        if not row:
            conn.close()
            self._json_reply(401, {"ok": False, "error": "Old password is incorrect."})
            return

        if old_password == new_password:
            conn.close()
            self._json_reply(200, {"ok": True, "message": "Already the password you wished."})
            return

        conn.execute(
            "UPDATE users SET password = ? WHERE username = ?",
            (hash_password(new_password), username),
        )
        conn.commit()
        conn.close()
        self._json_reply(200, {"ok": True})

    def _handle_save(self, data: dict) -> None:
        username = (data.get("username") or "").strip()
        save_data = data.get("saveData")

        if not username or save_data is None:
            self._json_reply(400, {"ok": False, "error": "Username and saveData are required."})
            return

        conn = get_db()
        conn.execute(
            """INSERT INTO saves (username, save_data, updated_at)
               VALUES (?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(username) DO UPDATE SET
               save_data = excluded.save_data,
               updated_at = CURRENT_TIMESTAMP""",
            (username, json.dumps(save_data)),
        )
        conn.commit()
        conn.close()
        self._json_reply(200, {"ok": True})

    def _handle_load(self, data: dict) -> None:
        username = (data.get("username") or "").strip()

        if not username:
            self._json_reply(400, {"ok": False, "error": "Username is required."})
            return

        conn = get_db()
        row = conn.execute(
            "SELECT save_data FROM saves WHERE username = ?", (username,)
        ).fetchone()
        conn.close()

        if not row:
            self._json_reply(200, {"ok": True, "saveData": None})
            return

        try:
            save_data = json.loads(row["save_data"])
            self._json_reply(200, {"ok": True, "saveData": save_data})
        except (json.JSONDecodeError, TypeError):
            self._json_reply(200, {"ok": True, "saveData": None})


# ---------------------------------------------------------------------------
# Server helpers
# ---------------------------------------------------------------------------

def create_server(host: str, start_port: int, attempts: int = 20) -> Tuple[ThreadingHTTPServer, int]:
    handler = partial(GameRequestHandler, directory=str(PROJECT_ROOT))
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
    init_db()
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
