import asyncio, edge_tts, json, subprocess, soundfile as sf, sys, os
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
VOICE=sys.argv[1] if len(sys.argv)>1 else 'pt-BR-AntonioNeural'
SEG=[(0.25,2.75,"O crédito da sua empresa chega curto, caro e pequeno?"),
(3.1,3.75,"Talvez o problema não seja a empresa. É como ela está sendo apresentada."),
(7.45,1.7,"Esta é a Ative."),
(10.05,2.6,"Sua empresa vale mais do que consegue provar."),
(12.85,2.75,"Nós organizamos, desenhamos e apresentamos."),
(15.75,2.75,"Existe muito mais capital do que o banco oferece."),
(18.5,4.6,"Mercado de capitais, crédito bancário, fomento. A escolha parte da empresa."),
(23.3,2.8,"Nós lemos a sua empresa do jeito que quem financia lê."),
(26.2,4.25,"E levamos essa leitura a uma rede de parceria que opera com trinta instituições."),
(30.55,2.55,"Do diagnóstico ao capital no caixa da empresa."),
(33.4,3.9,"Energia solar. Indústria. Incorporação imobiliária."),
(37.55,3.7,"Mais de cento e dezoito milhões de reais, só em 2026."),
(41.5,3.4,"E ficamos do seu lado até o dinheiro chegar."),
(46.4,3.8,"Porque capital é consequência de uma empresa bem preparada."),
(50.5,5.6,"Mais de setenta empresas em relacionamento. Em dezoito estados."),
(56.7,2.55,"Antes de qualquer negócio, existe confiança."),
(59.3,0.7,"Ative.")]
async def gen(i,text,rate):
    f=f'seg_{i:02d}.mp3'
    await edge_tts.Communicate(text,VOICE,rate=f'{rate:+d}%',pitch='-4Hz',proxy=os.environ.get('HTTPS_PROXY')).save(f)
    subprocess.run([FF,'-v','error','-y','-i',f,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse','-ar','44100','-ac','1',f'seg_{i:02d}.wav'],check=True)
    d=sf.info(f'seg_{i:02d}.wav').duration;return d
async def main():
    out=[]
    for i,(st,mx,tx) in enumerate(SEG):
        rate=-6;d=await gen(i,tx,rate)
        while d>mx and rate<14:
            rate=min(14,rate+max(3,int((d/mx-1)*100)+2));d=await gen(i,tx,rate)
        out.append({'i':i,'start':st,'max':mx,'dur':round(d,2),'rate':rate,'text':tx});print(out[-1])
    json.dump(out,open('segs.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
