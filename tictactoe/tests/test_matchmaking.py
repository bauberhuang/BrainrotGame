"""Tests covering the admin-driven matchmaking workflow."""
import unittest

from tests.test_utils import load_app

app_module = load_app()


class MatchmakingTests(unittest.TestCase):
    """Ensure the admin matchmaking flow satisfies the requirements."""

    def setUp(self):
        self.emitted = []
        self.original_emit = app_module.socketio.emit

        def _fake_emit(event, payload=None, room=None):
            self.emitted.append((event, payload or {}, room))
            return None

        app_module.socketio.emit = _fake_emit

        app_module.waiting_players.clear()
        app_module.players_by_id.clear()
        app_module.players_by_sid.clear()
        app_module.matches.clear()
        app_module.completed_matches.clear()
        app_module.admin_clients.clear()

    def tearDown(self):
        app_module.socketio.emit = self.original_emit
        app_module.waiting_players.clear()
        app_module.players_by_id.clear()
        app_module.players_by_sid.clear()
        app_module.matches.clear()
        app_module.completed_matches.clear()
        app_module.admin_clients.clear()

    def _register_players(self, players):
        for player in players:
            app_module.players_by_id[player.id] = player
            app_module.players_by_sid[player.sid] = player
            app_module.waiting_players.append(player)

    def test_start_matching_pairs_players_and_notifies(self):
        """Two waiting players should be matched and receive start events."""
        player_one = app_module.Player("p1", "あき", "sid1")
        player_two = app_module.Player("p2", "けん", "sid2")
        self._register_players([player_one, player_two])

        app_module.start_matching({})

        self.assertFalse(app_module.waiting_players)
        self.assertEqual(len(app_module.matches), 1)
        match = next(iter(app_module.matches.values()))
        self.assertEqual(set(match.player_ids), {"p1", "p2"})
        self.assertEqual(player_one.match_id, match.id)
        self.assertEqual(player_two.match_id, match.id)

        match_start_events = [event for event in self.emitted if event[0] == "match_start"]
        self.assertEqual(len(match_start_events), 2)

        board_updates = [event for event in self.emitted if event[0] == "board_update"]
        self.assertTrue(any(event[2] == match.id for event in board_updates))

    def test_start_matching_grants_bye_for_unpaired_player(self):
        """An extra waiting player should get an automatic win and appear in results."""
        player_one = app_module.Player("p1", "みき", "sid1")
        player_two = app_module.Player("p2", "なお", "sid2")
        bye_player = app_module.Player("p3", "ゆう", "sid3")
        self._register_players([player_one, player_two, bye_player])

        app_module.start_matching({})

        self.assertEqual(len(app_module.matches), 1)
        self.assertEqual(len(app_module.completed_matches), 1)
        recorded = app_module.completed_matches[0]
        self.assertIn(bye_player.name, recorded["pair"])
        self.assertEqual(recorded["winner"], bye_player.name)
        self.assertIsNone(bye_player.match_id)

        bye_events = [
            event for event in self.emitted if event[0] == "match_result" and event[1].get("bye")
        ]
        self.assertEqual(len(bye_events), 1)
        self.assertEqual(bye_events[0][2], bye_player.sid)

    def test_admin_state_shows_qr_without_active_matches(self):
        """QR code visibility should depend only on active matches."""
        app_module.completed_matches.append(
            {"match_id": "m1", "pair": "A vs B", "winner": "A"}
        )
        app_module.admin_clients.add("admin-sid")

        app_module.broadcast_admin_state()

        admin_events = [event for event in self.emitted if event[0] == "admin_state"]
        self.assertTrue(admin_events, "Expected an admin_state payload to be emitted")
        latest_payload = admin_events[-1][1]
        self.assertTrue(latest_payload.get("show_qr"))


if __name__ == "__main__":
    unittest.main()
