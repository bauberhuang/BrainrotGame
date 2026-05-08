"""Test helpers for loading the app module with lightweight stubs."""
import importlib
import sys
import types


def load_app():
    """Import the app module with Flask and SocketIO stubs for unit tests."""
    if "app" in sys.modules:
        return sys.modules["app"]

    flask_stub = types.ModuleType("flask")

    class _DummyFlask:
        def __init__(self, import_name):
            self.import_name = import_name
            self.config = {}

        def route(self, *_args, **_kwargs):
            def decorator(func):
                return func

            return decorator

    def _render_template(*_args, **_kwargs):
        return ""

    class _DummyRequest:
        sid = "test-sid"

    flask_stub.Flask = _DummyFlask
    flask_stub.render_template = _render_template
    flask_stub.request = _DummyRequest()

    socketio_stub = types.ModuleType("flask_socketio")

    class _DummySocketIO:
        def __init__(self, app, **_kwargs):
            self.app = app

        def emit(self, *_args, **_kwargs):
            return None

        def on(self, *_args, **_kwargs):
            def decorator(func):
                return func

            return decorator

        def run(self, *_args, **_kwargs):
            return None

    def _join_room(*_args, **_kwargs):
        return None

    socketio_stub.SocketIO = _DummySocketIO
    socketio_stub.join_room = _join_room

    sys.modules["flask"] = flask_stub
    sys.modules["flask_socketio"] = socketio_stub

    return importlib.import_module("app")


__all__ = ["load_app"]
