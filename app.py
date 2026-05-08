import uuid
from collections import deque
from typing import Any, Dict, List, Optional, Set

from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room


app = Flask(__name__, template_folder="tictactoe/templates", static_folder="tictactoe/static")
app.config["SECRET_KEY"] = "tiktaktoe-secret"
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")


class Player:
    """Represents a connected player."""

    def __init__(self, player_id: str, name: str, sid: str) -> None:
        self.id = player_id
        self.name = name
        self.sid = sid
        self.match_id: Optional[str] = None


class Match:
    """Stores state for a single tic tac toe match."""

    def __init__(self, match_id: str, player_one: Player, player_two: Player) -> None:
        self.id = match_id
        self.player_ids = [player_one.id, player_two.id]
        self.player_map = {
            player_one.id: {
                "name": player_one.name,
                "symbol": "〇",
            },
            player_two.id: {
                "name": player_two.name,
                "symbol": "✕",
            },
        }
        self.board: List[Optional[str]] = [None] * 9
        self.moves: deque = deque()
        self.turn: str = player_one.id
        self.winner: Optional[str] = None


waiting_players: List[Player] = []
players_by_sid: Dict[str, Player] = {}
players_by_id: Dict[str, Player] = {}
matches: Dict[str, Match] = {}
completed_matches: List[Dict[str, str]] = []
admin_clients: Set[str] = set()


@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("img/logo.svg")

@app.route("/")
def home() -> str:
    """Serve the player lobby page."""
    return render_template("player.html")


@app.route("/admin")
def admin() -> str:
    """Serve the admin dashboard."""
    return render_template("admin.html")


def broadcast_lobby_status() -> None:
    """Notify all clients about the current lobby population."""
    socketio.emit("lobby_status", {"count": len(players_by_id)})


def broadcast_admin_state() -> None:
    """Send updated admin data to connected admins."""
    active_matches = []
    for match in matches.values():
        if match.winner:
            continue
        p1, p2 = match.player_ids
        active_matches.append(
            {
                "match_id": match.id,
                "display": f"{match.player_map[p1]['name']} vs. {match.player_map[p2]['name']}",
            }
        )

    payload = {
        "waiting": [player.name for player in waiting_players],
        "active_matches": active_matches,
        "completed": completed_matches,
        "show_qr": not matches,
    }

    for sid in list(admin_clients):
        socketio.emit("admin_state", payload, room=sid)


def build_board_payload(match: Match) -> Dict[str, Any]:
    """Construct the payload for a board update."""
    move_order = [0] * 9
    for index, move in enumerate(match.moves):
        move_order[move["position"]] = index + 1

    return {
        "match_id": match.id,
        "board": [cell or "" for cell in match.board],
        "turn": match.player_map[match.turn]["name"],
        "turn_id": match.turn,
        "players": [match.player_map[pid]["name"] for pid in match.player_ids],
        "move_order": move_order,
    }


def cleanup_player(player: Player) -> None:
    """Remove a player from waiting lists and matches."""
    if player in waiting_players:
        waiting_players.remove(player)
    if player.match_id:
        match = matches.get(player.match_id)
        if match and not match.winner:
            # Award the win to the opponent.
            opponent_id = next(pid for pid in match.player_ids if pid != player.id)
            match.winner = opponent_id
            winner_name = match.player_map[opponent_id]["name"]
            completed_matches.append(
                {
                    "match_id": match.id,
                    "pair": f"{match.player_map[match.player_ids[0]]['name']} vs. {match.player_map[match.player_ids[1]]['name']}",
                    "winner": winner_name,
                }
            )
            opponent = players_by_id.get(opponent_id)
            if opponent:
                socketio.emit(
                    "match_result",
                    {"outcome": "win", "opponent": player.name, "by_disconnect": True},
                    room=opponent.sid,
                )
                opponent.match_id = None
            socketio.emit("match_result", {"outcome": "lose"}, room=player.sid)
            socketio.emit(
                "match_finished",
                {
                    "pair": f"{match.player_map[match.player_ids[0]]['name']} vs. {match.player_map[match.player_ids[1]]['name']}",
                    "winner": winner_name,
                },
                room=match.id,
            )
            matches.pop(match.id, None)
    players_by_id.pop(player.id, None)


@socketio.on("connect")
def on_connect() -> None:
    """Initial socket connection handler."""
    socketio.emit("connected", {"message": "connected"}, room=request.sid)


@socketio.on("disconnect")
def on_disconnect() -> None:
    """Clean up after socket disconnect."""
    sid = request.sid
    admin_clients.discard(sid)
    player = players_by_sid.pop(sid, None)
    if player:
        cleanup_player(player)
    broadcast_lobby_status()
    broadcast_admin_state()


@socketio.on("player_join")
def player_join(data: Dict[str, str]) -> None:
    """Handle a player joining the lobby."""
    sid = request.sid
    name = data.get("name", "").strip()
    if not name:
        socketio.emit("join_error", {"message": "名前を入れてね。"}, room=sid)
        return

    # Reuse existing player object if they already connected.
    player = players_by_sid.get(sid)
    if player:
        player.name = name
        player.match_id = None
        if player in waiting_players:
            waiting_players.remove(player)
    else:
        player_id = str(uuid.uuid4())
        player = Player(player_id, name, sid)
        players_by_sid[sid] = player
        players_by_id[player_id] = player

    waiting_players.append(player)
    socketio.emit("lobby_joined", {"player_id": player.id, "name": name}, room=sid)
    broadcast_lobby_status()
    broadcast_admin_state()


@socketio.on("admin_join")
def admin_join(_: Dict) -> None:
    """Register an admin client for updates."""
    admin_clients.add(request.sid)
    broadcast_admin_state()


@socketio.on("start_matching")
def start_matching(_: Dict) -> None:
    """Pair players into matches upon admin request."""
    if not waiting_players:
        return

    queue_copy = list(waiting_players)
    waiting_players.clear()

    pairs: List[Match] = []
    while len(queue_copy) >= 2:
        player_one = queue_copy.pop(0)
        player_two = queue_copy.pop(0)
        match_id = str(uuid.uuid4())
        match = Match(match_id, player_one, player_two)
        matches[match_id] = match
        player_one.match_id = match_id
        player_two.match_id = match_id
        pairs.append(match)

    if queue_copy:
        bye_player = queue_copy.pop(0)
        socketio.emit(
            "match_result",
            {"outcome": "win", "opponent": "", "bye": True},
            room=bye_player.sid,
        )
        completed_matches.append(
            {
                "match_id": str(uuid.uuid4()),
                "pair": f"{bye_player.name} (ひとり)",
                "winner": bye_player.name,
            }
        )
        bye_player.match_id = None

    for match in pairs:
        p1, p2 = match.player_ids
        player_one = players_by_id.get(p1)
        player_two = players_by_id.get(p2)
        if not player_one or not player_two:
            continue
        join_room(match.id, sid=player_one.sid)
        join_room(match.id, sid=player_two.sid)
        socketio.emit(
            "match_start",
            {
                "match_id": match.id,
                "opponent": match.player_map[p2]["name"],
                "symbol": match.player_map[p1]["symbol"],
                "your_turn": match.turn == p1,
            },
            room=player_one.sid,
        )
        socketio.emit(
            "match_start",
            {
                "match_id": match.id,
                "opponent": match.player_map[p1]["name"],
                "symbol": match.player_map[p2]["symbol"],
                "your_turn": match.turn == p2,
            },
            room=player_two.sid,
        )
        socketio.emit(
            "board_update", build_board_payload(match), room=match.id
        )

    broadcast_admin_state()


def apply_move(match: Match, player_id: str, position: int) -> bool:
    """Apply a move to a match if valid."""
    if match.winner or position < 0 or position >= 9:
        return False
    if match.turn != player_id:
        return False

    symbol = match.player_map[player_id]["symbol"]
    player_moves = [move for move in match.moves if move["player"] == player_id]
    oldest_move = player_moves[0] if len(player_moves) >= 3 else None

    # A move is only valid if the destination is empty or will be cleared by
    # recycling the player's oldest mark.
    if match.board[position] is not None and not (
        oldest_move and oldest_move["position"] == position
    ):
        return False

    if oldest_move:
        match.board[oldest_move["position"]] = None
        match.moves.remove(oldest_move)

    match.board[position] = symbol
    match.moves.append({"player": player_id, "position": position})

    # Switch turn.
    other_player = next(pid for pid in match.player_ids if pid != player_id)
    match.turn = other_player
    return True


def evaluate_winner(match: Match) -> Optional[str]:
    """Determine if a match has a winner."""
    winning_lines = [
        (0, 1, 2),
        (3, 4, 5),
        (6, 7, 8),
        (0, 3, 6),
        (1, 4, 7),
        (2, 5, 8),
        (0, 4, 8),
        (2, 4, 6),
    ]
    for a, b, c in winning_lines:
        line = match.board[a], match.board[b], match.board[c]
        if line[0] and line[0] == line[1] == line[2]:
            return line[0]
    return None


@socketio.on("make_move")
def make_move(data: Dict[str, str]) -> None:
    """Handle move requests from players."""
    sid = request.sid
    player = players_by_sid.get(sid)
    if not player or not player.match_id:
        return
    match = matches.get(player.match_id)
    if not match:
        return

    try:
        position = int(data.get("position", -1))
    except (TypeError, ValueError):
        socketio.emit("move_rejected", {}, room=sid)
        return

    changed = apply_move(match, player.id, position)
    if not changed:
        socketio.emit("move_rejected", {}, room=sid)
        return

    socketio.emit("board_update", build_board_payload(match), room=match.id)

    winner_symbol = evaluate_winner(match)
    if winner_symbol:
        match.winner = next(
            pid for pid, info in match.player_map.items() if info["symbol"] == winner_symbol
        )
        winner = players_by_id.get(match.winner)
        loser_id = next(pid for pid in match.player_ids if pid != match.winner)
        loser = players_by_id.get(loser_id)
        winner_name = match.player_map[match.winner]["name"]
        loser_name = match.player_map[loser_id]["name"]
        completed_matches.append(
            {
                "match_id": match.id,
                "pair": f"{winner_name} vs. {loser_name}",
                "winner": winner_name,
            }
        )
        if winner:
            socketio.emit(
                "match_result",
                {"outcome": "win", "opponent": loser_name},
                room=winner.sid,
            )
            winner.match_id = None
        if loser:
            socketio.emit(
                "match_result",
                {"outcome": "lose", "opponent": winner_name},
                room=loser.sid,
            )
            loser.match_id = None
        socketio.emit(
            "match_finished",
            {
                "pair": f"{match.player_map[match.player_ids[0]]['name']} vs. {match.player_map[match.player_ids[1]]['name']}",
                "winner": winner_name,
            },
            room=match.id,
        )
        matches.pop(match.id, None)
        broadcast_admin_state()


@socketio.on("watch_match")
def watch_match(data: Dict[str, str]) -> None:
    """Allow an admin to watch a specific match in real time."""
    match_id = data.get("match_id")
    match = matches.get(match_id or "")
    if not match:
        socketio.emit("watch_error", {"message": "試合が見つかりません。"}, room=request.sid)
        return
    sid = request.sid
    join_room(match_id, sid=sid)
    socketio.emit(
        "board_update",
        build_board_payload(match),
        room=sid,
    )


if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=8000
    )

