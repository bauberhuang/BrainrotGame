import unittest

from tests.test_utils import load_app

app_module = load_app()
Player = app_module.Player
Match = app_module.Match
apply_move = app_module.apply_move
evaluate_winner = app_module.evaluate_winner


class GameLogicTests(unittest.TestCase):
    """Verify the endless tic tac toe mechanics."""

    def setUp(self):
        self.player_one = Player("p1", "たろう", "sid1")
        self.player_two = Player("p2", "はなこ", "sid2")
        self.match = Match("m1", self.player_one, self.player_two)

    def test_apply_move_fills_and_switches_turn(self):
        """The board should record moves and alternate turns."""
        self.assertTrue(apply_move(self.match, "p1", 0))
        self.assertEqual(self.match.board[0], "〇")
        self.assertEqual(self.match.turn, "p2")
        self.assertFalse(apply_move(self.match, "p1", 1))
        self.assertTrue(apply_move(self.match, "p2", 1))

    def test_fourth_move_recycles_oldest_mark(self):
        """A player cannot keep more than three marks on the board."""
        sequence = [
            ("p1", 0),
            ("p2", 3),
            ("p1", 1),
            ("p2", 4),
            ("p1", 2),
            ("p2", 5),
        ]
        for player_id, position in sequence:
            self.assertTrue(apply_move(self.match, player_id, position))

        self.assertTrue(apply_move(self.match, "p1", 6))

        self.assertIsNone(self.match.board[0])
        self.assertEqual(self.match.board[6], "〇")

        positions_for_p1 = [
            move["position"] for move in self.match.moves if move["player"] == "p1"
        ]
        self.assertEqual(sorted(positions_for_p1), [1, 2, 6])

    def test_player_cannot_take_occupied_square(self):
        """Removing an old mark doesn't allow taking an opponent's square."""
        opening = [
            ("p1", 0),
            ("p2", 3),
            ("p1", 1),
            ("p2", 4),
            ("p1", 2),
        ]
        for player_id, position in opening:
            self.assertTrue(apply_move(self.match, player_id, position))

        self.assertTrue(apply_move(self.match, "p2", 5))

        self.assertFalse(apply_move(self.match, "p1", 3))
        self.assertEqual(self.match.board[3], "✕")

        positions_for_p1 = [
            move["position"] for move in self.match.moves if move["player"] == "p1"
        ]
        self.assertEqual(sorted(positions_for_p1), [0, 1, 2])

    def test_player_can_reuse_removed_square(self):
        """A player may place the new mark on the space that just vanished."""
        sequence = [
            ("p1", 0),
            ("p2", 3),
            ("p1", 1),
            ("p2", 4),
            ("p1", 2),
            ("p2", 5),
        ]
        for player_id, position in sequence:
            self.assertTrue(apply_move(self.match, player_id, position))

        self.assertTrue(apply_move(self.match, "p1", 0))

        self.assertEqual(self.match.board[0], "〇")
        positions_for_p1 = [
            move["position"] for move in self.match.moves if move["player"] == "p1"
        ]
        self.assertEqual(sorted(positions_for_p1), [0, 1, 2])

    def test_evaluate_winner_detects_line(self):
        """Detect a winner when three marks align."""
        apply_move(self.match, "p1", 0)
        apply_move(self.match, "p2", 3)
        apply_move(self.match, "p1", 1)
        apply_move(self.match, "p2", 4)
        apply_move(self.match, "p1", 2)
        symbol = evaluate_winner(self.match)
        self.assertEqual(symbol, "〇")


if __name__ == "__main__":
    unittest.main()
