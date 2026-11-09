"""One process owns the native window, local API and bundled static frontend."""

import ctypes
import json
import logging
from logging.handlers import RotatingFileHandler
import multiprocessing
import os
from pathlib import Path
import socket
import sys
import threading
import time
from urllib.request import Request, urlopen

import uvicorn
from fastapi.staticfiles import StaticFiles

from backend.main import app


def resource_directory():
    root = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[1]))
    return root / "frontend_dist" if getattr(sys, "frozen", False) else root / "frontend" / "desktop-dist"


class DesktopServer:
    def __init__(self):
        assets = resource_directory()
        if not (assets / "index.html").is_file():
            raise RuntimeError("Desktop frontend is missing. Run npm run build:desktop first.")
        app.mount("/", StaticFiles(directory=str(assets), html=True), name="desktop")
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind(("127.0.0.1", 0))
        self.socket.listen(128)
        self.url = f"http://127.0.0.1:{self.socket.getsockname()[1]}"
        self.server = uvicorn.Server(uvicorn.Config(
            app, host="127.0.0.1", log_config=None, access_log=False,
            loop="asyncio", http="h11", ws="none", timeout_graceful_shutdown=3,
        ))
        self.thread = threading.Thread(target=self._run, daemon=True, name="local-api")
        self.error = None

    def _run(self):
        try:
            self.server.run(sockets=[self.socket])
        except BaseException as error:
            self.error = error
            logging.exception("Local server failed")

    def start(self):
        self.thread.start()
        deadline = time.monotonic() + 20
        while not self.server.started:
            if not self.thread.is_alive() or time.monotonic() > deadline:
                self.stop()
                raise RuntimeError(f"Could not start the local server: {self.error or 'timeout'}")
            time.sleep(0.05)

    def stop(self, *_):
        self.server.should_exit = True
        if self.thread.is_alive() and threading.current_thread() is not self.thread:
            self.thread.join(timeout=5)
        self.socket.close()


def smoke_test(server):
    with urlopen(server.url, timeout=10) as response:
        assert b'<div id="root">' in response.read()
    for method in ("standard", "horner"):
        for number, source, target, expected in (
            ("-A.F", 16, 2, "-1010.1111"),
            ("-z.V", 62, 10, "-61.5"),
            ("61.5", 10, 62, "z.V"),
            ("a", 37, 10, "36"),
            ("A", 62, 10, "10"),
        ):
            request = Request(server.url + "/api/convert", data=json.dumps({
                "number": number, "sourceBase": source, "targetBase": target, "method": method,
            }).encode(), headers={"Content-Type": "application/json"})
            with urlopen(request, timeout=10) as response:
                result = json.load(response)
            assert result["result"] == expected
            assert result["steps"][-1]["title"] == "نتیجهٔ نهایی"


def ui_smoke_test(window, outcome):
    """Exercise the bundled React UI inside the real Windows WebView2 engine."""
    def until(script):
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if window.evaluate_js(script):
                return
            time.sleep(0.1)
        raise AssertionError(f"UI check timed out: {script}")

    try:
        until("Boolean(document.getElementById('number'))")
        window.evaluate_js("""
          const input = document.getElementById('number');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '45');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        """)
        time.sleep(0.2)
        window.evaluate_js("document.querySelector('form button[type=submit]').click()")
        until("document.querySelector('output')?.textContent === '101101'")
        window.evaluate_js("document.querySelector('[aria-controls=solution-content]').click()")
        until("document.getElementById('solution-content').innerText.includes('تقسیم صحیح متوالی')")
        window.evaluate_js("document.querySelectorAll('[role=radio]')[1].click()")
        until("document.querySelector('output') === null")
        window.evaluate_js("document.querySelector('form button[type=submit]').click()")
        until("document.querySelector('output')?.textContent === '101101'")
        until("document.getElementById('solution-content').innerText.includes('ضرب و جمع هورنر')")
        outcome["passed"] = True
        logging.info("Packaged UI smoke test passed: both methods and solution steps")
    except Exception as error:
        outcome["error"] = str(error)
        logging.exception("Packaged UI smoke test failed")
    finally:
        window.destroy()


def main():
    data_dir = Path(os.getenv("LOCALAPPDATA", str(Path.home()))) / "BaseConverter"
    data_dir.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(handlers=[RotatingFileHandler(
        data_dir / "app.log", maxBytes=1_000_000, backupCount=1, encoding="utf-8",
    )], level=logging.INFO)
    server = None
    testing = "--smoke-test" in sys.argv or "--ui-smoke-test" in sys.argv
    try:
        server = DesktopServer()
        server.start()
        if "--smoke-test" in sys.argv:
            smoke_test(server)
            logging.info("Packaged API smoke test passed")
            return

        import webview
        window = webview.create_window(
            "Base Converter | تبدیل مبنا", server.url,
            width=850, height=900, min_size=(440, 600), background_color="#ffffff",
            hidden="--ui-smoke-test" in sys.argv,
        )
        window.events.closed += server.stop
        outcome = {}
        callback = (lambda: ui_smoke_test(window, outcome)) if testing else None
        webview.start(callback, gui="edgechromium", storage_path=str(data_dir / "webview"), private_mode=False)
        if testing and not outcome.get("passed"):
            raise RuntimeError(outcome.get("error", "Window closed before UI checks completed"))
    except Exception as error:
        logging.exception("Application failed")
        if not testing:
            ctypes.windll.user32.MessageBoxW(None,
                f"Could not start Base Converter.\n\n{error}\n\nLog: {data_dir / 'app.log'}\n\nMicrosoft Edge WebView2 Runtime is required.",
                "Base Converter", 0x10)
        return 1
    finally:
        if server is not None:
            server.stop()


if __name__ == "__main__":
    multiprocessing.freeze_support()
    sys.exit(main())
