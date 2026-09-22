#!/usr/bin/env python3
"""Build same-origin derivatives for the portfolio.

Masters in assets/ and public/certificates/ are left untouched.
Outputs:
  public/images/projects/<id>.webp   max width 1600, quality 82
  public/images/certificates/<id>.webp  max width 640, quality 80
  public/images/logos/<name>.png     fit inside 160px, transparency kept
  public/videos/posters/<name>.jpg   a non-black frame, JPEG quality 80

Prints source and output sizes. When quality 82 does not shrink a file that
already fits the width cap, an existing WebP is copied as-is and other
formats are retried at quality 75.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

PROJECTS: list[tuple[str, str]] = [
    ("nectar-sdk", "assets/bb-photo.jpg"),
    (
        "quantum-assistant",
        "https://media.githubusercontent.com/media/samuellimabraz/quantum-assistant/main/assets/images/synthetic-pipeline.png",
    ),
    (
        "signature-detection",
        "https://cdn-uploads.huggingface.co/production/uploads/666b9ef5e6c60b6fc4156675/6AnC1ut7EOLa6EjibXZXY.webp",
    ),
    ("vision-to-mavros", "assets/realsense-photo.jpg"),
    ("chunkr-layout", "public/assets/chunkr-layout-detect.jpg"),
    ("pid-controller", "assets/pid.png"),
    ("roboarm", "public/assets/roboarm.png"),
    ("tinyml", "public/assets/tinyml-preview-01.png"),
    ("cv-hangout", "assets/hf-hangout.png"),
    (
        "peft-methods",
        "https://cdn-uploads.huggingface.co/production/uploads/666b9ef5e6c60b6fc4156675/K26QSN3Y5dE-rY2bGKymc.jpeg",
    ),
    ("cafedl", "assets/cafe-dl.png"),
    ("opencv-gui", "assets/opencv-gui-2.png"),
    (
        "board-bringup",
        "https://raw.githubusercontent.com/samuellimabraz/BoardBring-Up-PIC18F4550/main/docs/DiagramaDeEstados.png",
    ),
    ("ev3-color-sensor", "public/assets/ev3-color-sensor.jpg"),
    (
        "emoji-compiler",
        "https://opengraph.githubassets.com/1/samuellimabraz/EmojiCompiler",
    ),
    ("kruskal-mst", "https://img.youtube.com/vi/o_dGmxP0Gcg/maxresdefault.jpg"),
    ("face-api", "assets/face-api.png"),
    ("hand-mouse", "assets/hand-controller.png"),
    ("educai", "assets/educai-home.png"),
]

CERTIFICATES: list[tuple[str, str]] = [
    ("dl-specialization", "public/certificates/dl-specialization.jpg"),
    ("ml-specialization", "public/certificates/ml-specialization.jpg"),
    ("generative-ai-llm", "public/certificates/generativeai-llm-.jpg"),
    ("finetuning-transformers", "public/certificates/finetune-codeacademy.jpg"),
    ("opencv-bootcamp", "public/certificates/opencv-bootcamp.jpg"),
]

LOGOS: list[tuple[str, str]] = [
    ("unifei", "assets/unifei-logo.png"),
    ("asimo", "assets/asimo.png"),
    ("ifmg", "assets/IF.png"),
]

VIDEOS = [
    "drone_line_following_video.mp4",
    "cafedl-game.mp4",
    "cbr-test.mp4",
    "escola-bebop-1.mp4",
    "indoor-test-23-t265.mp4",
    "isaac-ros.mp4",
    "black-bee-ui.mp4",
    "signature.mp4",
]

# Seconds to sample when the earlier frame is nearly black.
POSTER_TIMES = (0.4, 1.0, 2.0, 4.0, 8.0)

PROJECT_MAX_WIDTH = 1600
PROJECT_QUALITY = 82
CERTIFICATE_MAX_WIDTH = 640
CERTIFICATE_QUALITY = 80
LOGO_BOX = 160
POSTER_QUALITY = 80


def kb(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def resolve(spec: str, cache: Path) -> Path:
    if spec.startswith("https://"):
        dest = cache / spec.split("/")[-1].split("?")[0]
        if not dest.exists() or dest.stat().st_size == 0:
            print(f"  download {spec}")
            urllib.request.urlretrieve(spec, dest)
        return dest
    path = ROOT / spec
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def open_image(path: Path) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    return im


def fit_width(im: Image.Image, max_width: int) -> Image.Image:
    if im.width <= max_width:
        return im
    height = max(1, round(im.height * max_width / im.width))
    return im.resize((max_width, height), Image.Resampling.LANCZOS)


def save_webp(im: Image.Image, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=quality, method=6)


def project_covers(cache: Path) -> None:
    out_dir = PUBLIC / "images" / "projects"
    print("\nProject covers")
    for project_id, spec in PROJECTS:
        src = resolve(spec, cache)
        src_bytes = src.stat().st_size
        im = open_image(src)
        resized = fit_width(im, PROJECT_MAX_WIDTH)
        dest = out_dir / f"{project_id}.webp"
        save_webp(resized, dest, PROJECT_QUALITY)
        out_bytes = dest.stat().st_size
        note = ""
        # Quality 82 can expand an already-compressed file that did not need a resize.
        if out_bytes >= src_bytes and im.width <= PROJECT_MAX_WIDTH:
            if src.suffix.lower() == ".webp":
                dest.write_bytes(src.read_bytes())
                note = "  kept original webp bytes"
            else:
                save_webp(resized, dest, 75)
                note = "  re-encoded at quality 75"
        out_bytes = dest.stat().st_size
        print(
            f"  {project_id}: {im.width}x{im.height} {kb(src_bytes)}"
            f" -> {resized.width}x{resized.height} {kb(out_bytes)}{note}"
        )


def certificate_previews(cache: Path) -> None:
    out_dir = PUBLIC / "images" / "certificates"
    print("\nCertificate previews")
    for cert_id, spec in CERTIFICATES:
        src = resolve(spec, cache)
        im = fit_width(open_image(src), CERTIFICATE_MAX_WIDTH)
        dest = out_dir / f"{cert_id}.webp"
        save_webp(im, dest, CERTIFICATE_QUALITY)
        print(
            f"  {cert_id}: {kb(src.stat().st_size)} -> {im.width}x{im.height} {kb(dest.stat().st_size)}"
        )


def logos(cache: Path) -> None:
    out_dir = PUBLIC / "images" / "logos"
    print("\nLogos")
    for name, spec in LOGOS:
        src = resolve(spec, cache)
        im = open_image(src)
        im.thumbnail((LOGO_BOX, LOGO_BOX), Image.Resampling.LANCZOS)
        dest = out_dir / f"{name}.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "PNG", optimize=True)
        print(
            f"  {name}: {kb(src.stat().st_size)} -> {im.width}x{im.height} {kb(dest.stat().st_size)}"
        )


def mean_luma(im: Image.Image) -> float:
    gray = im.convert("L")
    return ImageStat.Stat(gray).mean[0]


def poster_for(video: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    best_luma = -1.0
    best_path: Path | None = None
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        for index, seconds in enumerate(POSTER_TIMES):
            frame = tmp_dir / f"frame-{index}.jpg"
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-ss",
                    str(seconds),
                    "-i",
                    str(video),
                    "-frames:v",
                    "1",
                    "-q:v",
                    "3",
                    str(frame),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            if not frame.exists() or frame.stat().st_size == 0:
                continue
            im = open_image(frame)
            luma = mean_luma(im)
            if luma > best_luma:
                best_luma = luma
                best_path = frame
                # A clearly visible frame is enough; later samples are a fallback.
                if luma >= 24:
                    break
        if best_path is None:
            raise RuntimeError(f"no frame extracted from {video.name}")
        im = open_image(best_path)
        im.save(dest, "JPEG", quality=POSTER_QUALITY, optimize=True)
    print(f"  {video.name}: luma {best_luma:.0f} -> {kb(dest.stat().st_size)}")


def posters() -> None:
    print("\nVideo posters")
    out_dir = PUBLIC / "videos" / "posters"
    for name in VIDEOS:
        poster_for(PUBLIC / "videos" / name, out_dir / f"{Path(name).stem}.jpg")


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="portfolio-media-") as tmp:
        cache = Path(tmp)
        project_covers(cache)
        certificate_previews(cache)
        logos(cache)
    posters()
    return 0


if __name__ == "__main__":
    sys.exit(main())
