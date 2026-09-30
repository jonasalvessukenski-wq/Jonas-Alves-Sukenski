#!/usr/bin/env bash
# Extrai os trechos do vídeo "Quem somos" como sequências de quadros 1920x1080 a 30 fps.
# Uso: extrair_clipes.sh <pasta dos brutos> <pasta de saída>   (FFMPEG=... opcional)
set -e
SRC="$1"; OUT="$2"; FF="${FFMPEG:-ffmpeg}"
GRADE="colorbalance=rs=-.03:bs=.07:rm=-.01:bm=.03,huesaturation=colors=g:saturation=-0.85,eq=contrast=1.05:gamma=0.98"
# nome | arquivo | início(s) | duração(s) | velocidade | centro vertical (0–1) | extra | largura do recorte | x do recorte
while IFS='|' read -r n f ss len sp cy ex cw cx; do
  [ -z "$n" ] && continue
  cw=${cw:-2160}; cx=${cx:-0}; ch=$(( cw*9/16 ))
  y=$(awk "BEGIN{y=int($cy*3840-$ch/2); if(y<0)y=0; if(y>3840-$ch)y=3840-$ch; print y}")
  pre=""; [ "$ex" = "rot180" ] && pre="hflip,vflip,"
  mkdir -p "$OUT/$n"; rm -f "${OUT:?}/${n:?}"/*.jpg
  "$FF" -nostdin -v error -y -ss "$ss" -t "$len" -i "$SRC/$f" -an \
    -vf "setpts=PTS/$sp,fps=30,${pre}crop=$cw:$ch:$cx:$y,scale=1920:1080:flags=lanczos,$GRADE" \
    -q:v 3 -start_number 0 "$OUT/$n/%04d.jpg"
  echo "$n: $(ls "$OUT/$n" | wc -l) quadros"
done <<'LIST'
B|IMG_5451.MOV|4.3|1.55|0.28|0.68||1260|900
D|IMG_5452.MOV|12.45|1.45|0.25|0.6||1260|0
F|IMG_5451.MOV|19.9|1.5|0.25|0.22|rot180
G|IMG_5451.MOV|32.0|2.55|0.3|0.38|
LIST
