#!/bin/bash
# 한국어 폰트 자동 다운로드
set -e

FONT_DIR="$(dirname "$0")/fonts"
mkdir -p "$FONT_DIR"

echo "한국어 폰트 다운로드 중..."

# Noto Sans KR
wget -q "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf" -O "$FONT_DIR/NotoSansKR-Regular.ttf"
wget -q "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyelxq8H4hfeE.ttf" -O "$FONT_DIR/NotoSansKR-Bold.ttf"

# Noto Serif KR
wget -q "https://fonts.gstatic.com/s/notoserifkr/v20/3JnmSDn90Gmq2mr3blnHaTZXTihc8O5NGs5HVCA.ttf" -O "$FONT_DIR/NotoSerifKR-Regular.ttf"
wget -q "https://fonts.gstatic.com/s/notoserifkr/v20/3JnmSDn90Gmq2mr3blnHaTZXTigU8e5NGs5HVCA.ttf" -O "$FONT_DIR/NotoSerifKR-Bold.ttf"

echo "폰트 설치 완료!"
ls -la "$FONT_DIR/"
