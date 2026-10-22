"""Render deterministic contact sheets for the current mobile design catalog."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "boards" / "review-84"
BACKGROUND = "#080f20"
CARD = "#111e33"
TEXT = "#eff6ff"
MUTED = "#a4b4cd"
CYAN = "#55dcef"
FONT = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold else FONT
    return ImageFont.truetype(str(path), size)


def load_screen(screen: dict, platform: str) -> Image.Image:
    source = BASE / "images" / platform / f"{screen['id']}.png"
    with Image.open(source) as image:
        image.verify()
    with Image.open(source) as image:
        return image.convert("RGB")


def safe_name(value: str) -> str:
    return "".join(char.lower() if char.isalnum() else "-" for char in value).strip("-")


def render_group(group: str, screens: list[dict], platform: str) -> dict:
    columns = 3
    cell_width = 300
    image_width = 260
    image_height = 520
    header_height = 104
    caption_height = 78
    row_height = image_height + caption_height + 28
    rows = (len(screens) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * cell_width + 64, header_height + rows * row_height + 36), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.text((32, 24), f"SOLO LEVELING · {group}", font=font(30, True), fill=TEXT)
    draw.text((32, 67), f"{platform.upper()}  ·  {len(screens)} trạng thái  ·  Bản rà soát ảnh", font=font(18), fill=CYAN)

    for index, screen in enumerate(screens):
        row, column = divmod(index, columns)
        x = 32 + column * cell_width
        y = header_height + row * row_height
        image = ImageOps.contain(load_screen(screen, platform), (image_width, image_height), method=Image.Resampling.LANCZOS)
        draw.rounded_rectangle((x, y, x + cell_width - 16, y + row_height - 12), radius=16, fill=CARD, outline="#263a54", width=2)
        image_x = x + (cell_width - image.width) // 2 - 8
        canvas.paste(image, (image_x, y + 12))
        caption_y = y + image_height + 20
        title = screen["title"]
        draw.text((x + 12, caption_y), f"{screen['id']} · {title[:29]}", font=font(16, True), fill=TEXT)
        draw.text((x + 12, caption_y + 26), screen["type"] + " · " + screen["phase"], font=font(13), fill=MUTED)

    target = OUTPUT / f"{safe_name(group)}-{platform}.png"
    canvas.save(target, optimize=True)
    return {"group": group, "platform": platform, "file": target.relative_to(BASE).as_posix(), "screens": len(screens)}


def render_overview(catalog: list[dict], platform: str) -> dict:
    chosen = ["H01", "C01", "F02", "P01"]
    by_id = {screen["id"]: screen for screen in catalog}
    columns = 2
    cell_width = 500
    image_width = 420
    image_height = 840
    cell_height = image_height + 110
    canvas = Image.new("RGB", (columns * cell_width + 72, 170 + 2 * cell_height), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 28), "SOLO LEVELING · Bốn luồng chính", font=font(32, True), fill=TEXT)
    draw.text((36, 78), f"{platform.upper()} · Hôm nay / Lịch / Focus / Tiến bộ", font=font(19), fill=CYAN)
    for index, screen_id in enumerate(chosen):
        screen = by_id[screen_id]
        row, column = divmod(index, columns)
        x = 36 + column * cell_width
        y = 150 + row * cell_height
        image = ImageOps.contain(load_screen(screen, platform), (image_width, image_height), method=Image.Resampling.LANCZOS)
        draw.rounded_rectangle((x, y, x + cell_width - 24, y + cell_height - 12), radius=18, fill=CARD, outline="#263a54", width=2)
        image_x = x + (cell_width - image.width) // 2 - 12
        canvas.paste(image, (image_x, y + 14))
        draw.text((x + 16, y + image_height + 26), f"{screen_id} · {screen['title']}", font=font(19, True), fill=TEXT)
    target = OUTPUT / f"overview-{platform}.png"
    canvas.save(target, optimize=True)
    return {"group": "Bốn luồng chính", "platform": platform, "file": target.relative_to(BASE).as_posix(), "screens": len(chosen)}


def main() -> None:
    catalog = json.loads((BASE / "catalog.json").read_text(encoding="utf-8"))["screens"]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries = []
    groups = list(dict.fromkeys(screen["group"] for screen in catalog))
    for group in groups:
        screens = [screen for screen in catalog if screen["group"] == group]
        for platform in ("ios", "android"):
            entries.append(render_group(group, screens, platform))
    for platform in ("ios", "android"):
        entries.append(render_overview(catalog, platform))

    manifest = {
        "created": datetime.now().astimezone().isoformat(timespec="seconds"),
        "sourceScreenStates": len(catalog),
        "sourceImages": len(catalog) * 2,
        "boards": entries,
        "method": "Pillow contact sheets assembled from source PNGs; no browser rendering",
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"screenStates": len(catalog), "contactSheets": len(entries), "output": str(OUTPUT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
