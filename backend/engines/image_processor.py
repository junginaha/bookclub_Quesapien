"""
이미지 처리 엔진:
- 해상도 검증 (출판 최소 300 DPI)
- 이미지 크기 최적화
- 폭 타입별 처리 (body / full / thumb / large)
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

try:
    from PIL import Image, ImageOps
    HAS_PILLOW = True
except ImportError:
    HAS_PILLOW = False


MIN_DPI = 150  # 최소 허용 DPI (전자책 기준)
PRINT_MIN_DPI = 300  # 인쇄용 최소 DPI

# Body width ratio relative to page body width
WIDTH_RATIOS = {
    "body": 1.0,
    "full": 1.0,   # same as body in context; full-bleed requires special handling
    "thumb": 0.35,
    "large": 0.85,
}


@dataclass
class ImageInfo:
    path: str
    width_px: int
    height_px: int
    dpi: tuple[int, int]
    format: str
    file_size_bytes: int
    is_print_ready: bool
    warning: Optional[str]


def analyze_image(path: str | Path) -> ImageInfo:
    path = Path(path)
    if not HAS_PILLOW:
        raise RuntimeError("Pillow가 설치되어 있지 않습니다")

    with Image.open(path) as img:
        w, h = img.size
        dpi_info = img.info.get("dpi", (72, 72))
        if isinstance(dpi_info, (int, float)):
            dpi_info = (int(dpi_info), int(dpi_info))
        dpi_x, dpi_y = int(dpi_info[0]), int(dpi_info[1])
        fmt = img.format or path.suffix.lstrip(".").upper()

    file_size = path.stat().st_size
    is_print_ready = min(dpi_x, dpi_y) >= PRINT_MIN_DPI

    warning = None
    if min(dpi_x, dpi_y) < MIN_DPI:
        warning = f"해상도가 너무 낮습니다 ({dpi_x}×{dpi_y} DPI). 최소 {MIN_DPI} DPI 권장"
    elif not is_print_ready:
        warning = f"인쇄용으로는 해상도가 부족합니다 ({dpi_x}×{dpi_y} DPI). 인쇄 시 {PRINT_MIN_DPI} DPI 필요"

    return ImageInfo(
        path=str(path),
        width_px=w,
        height_px=h,
        dpi=(dpi_x, dpi_y),
        format=fmt,
        file_size_bytes=file_size,
        is_print_ready=is_print_ready,
        warning=warning,
    )


def optimize_image_for_pdf(
    src: str | Path,
    dest: str | Path,
    body_width_mm: float,
    width_type: str = "body",
    max_dpi: int = 300,
) -> dict:
    """
    PDF용 이미지 최적화
    - 폭 타입에 따른 크기 계산
    - DPI 초과 시 다운샘플링
    - 출력: 최종 이미지 폭(mm), 높이(mm)
    """
    if not HAS_PILLOW:
        raise RuntimeError("Pillow가 설치되어 있지 않습니다")

    src, dest = Path(src), Path(dest)
    ratio = WIDTH_RATIOS.get(width_type, 1.0)
    target_width_mm = body_width_mm * ratio
    target_width_px = int(target_width_mm * max_dpi / 25.4)

    with Image.open(src) as img:
        orig_w, orig_h = img.size
        if orig_w > target_width_px:
            scale = target_width_px / orig_w
            new_w = target_width_px
            new_h = int(orig_h * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)
        else:
            new_w, new_h = orig_w, orig_h

        # Convert RGBA/P to RGB for JPEG compatibility
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                background.paste(img, mask=img.split()[-1])
            img = background

        save_kwargs: dict = {"dpi": (max_dpi, max_dpi)}
        suffix = dest.suffix.lower()
        if suffix in (".jpg", ".jpeg"):
            save_kwargs["quality"] = 90
            save_kwargs["optimize"] = True
        elif suffix == ".png":
            save_kwargs["optimize"] = True

        img.save(dest, **save_kwargs)

    # Calculate display dimensions in mm
    display_w_mm = new_w * 25.4 / max_dpi
    display_h_mm = new_h * 25.4 / max_dpi

    return {
        "src": str(dest),
        "width_mm": round(display_w_mm, 2),
        "height_mm": round(display_h_mm, 2),
        "width_px": new_w,
        "height_px": new_h,
    }


def convert_to_epub_image(
    src: str | Path,
    dest: str | Path,
    max_width_px: int = 1200,
) -> dict:
    """ePub용 이미지 변환 (JPEG, 최대 1200px 폭)"""
    if not HAS_PILLOW:
        raise RuntimeError("Pillow가 설치되어 있지 않습니다")

    src, dest = Path(src), Path(dest)
    with Image.open(src) as img:
        if img.width > max_width_px:
            scale = max_width_px / img.width
            img = img.resize((max_width_px, int(img.height * scale)), Image.LANCZOS)

        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                background.paste(img, mask=img.split()[-1])
            img = background

        img.save(dest, "JPEG", quality=85, optimize=True)
        return {"src": str(dest), "width_px": img.width, "height_px": img.height}
