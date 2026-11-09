# Build from the repository root using: python -m PyInstaller desktop/BaseConverter.spec
from pathlib import Path

root = Path(SPECPATH).parent
a = Analysis(
    [str(root / "desktop" / "app.py")],
    pathex=[str(root)],
    binaries=[],
    datas=[(str(root / "frontend" / "desktop-dist"), "frontend_dist"),
           (str(root / "digit_map.json"), ".")],
    hiddenimports=["webview.platforms.edgechromium", "webview.platforms.winforms"],
    hookspath=[],
    runtime_hooks=[],
    excludes=["pytest", "tkinter", "PyQt5", "PyQt6", "PySide2", "PySide6"],
    noarchive=False,
)
pyz = PYZ(a.pure)
exe = EXE(
    pyz, a.scripts, a.binaries, a.datas, [],
    name="BaseConverter",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    icon=str(root / "frontend" / "public" / "favicon.ico"),
)
