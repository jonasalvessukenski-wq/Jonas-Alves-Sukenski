"""Gera os vídeos-guia de narração: vídeo leve (854x480) com a fala grande no centro.

Entre as falas, a próxima aparece em cinza ("PRÓXIMA"); no tempo dela, fica branca ("FALE AGORA").
Uso: python gerar_guias.py <pasta de saída>   (FFMPEG=... opcional)
"""
import os, subprocess, sys, textwrap, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
V = os.path.dirname(AQUI)
FONTE = os.path.join(V, 'estruturacao-de-capital', 'fonte', 'assets', 'Manrope-Bold.ttf')
FF = os.environ.get('FFMPEG', 'ffmpeg')

VIDEOS = {
 '1_Estruturacao_de_Capital': (os.path.join(V, 'estruturacao-de-capital', 'ATIVE_Estruturacao_de_Capital_60s_so_musica.mp4'), [
  (0.25, 2.94, 'O crédito da sua empresa chega curto, caro e pequeno?'),
  (3.10, 7.07, 'Talvez o problema não seja a empresa. É como ela está sendo apresentada.'),
  (7.45, 8.43, 'Esta é a Ative.'),
  (10.05, 12.59, 'Sua empresa vale mais do que consegue provar.'),
  (12.85, 15.54, 'Nós organizamos, desenhamos e apresentamos.'),
  (15.75, 18.44, 'Existe muito mais capital do que o banco oferece.'),
  (18.55, 23.50, 'Mercado de capitais, crédito bancário, fomento. A escolha parte da empresa.'),
  (23.60, 26.34, 'Nós lemos a sua empresa do jeito que quem financia lê.'),
  (26.42, 30.58, 'E levamos essa leitura a uma rede de parceria que opera com trinta instituições.'),
  (30.66, 33.14, 'Do diagnóstico ao capital no caixa da empresa.'),
  (33.40, 36.53, 'Energia, indústria, mercado imobiliário.'),
  (37.55, 41.15, 'Mais de cento e dezoito milhões de reais, só em 2026.'),
  (41.50, 44.11, 'E ficamos do seu lado até o dinheiro chegar.'),
  (46.40, 49.60, 'Porque capital é consequência de uma empresa bem preparada.'),
  (50.50, 55.24, 'Mais de setenta empresas em relacionamento. Em dezoito estados.'),
  (56.70, 59.19, 'Antes de qualquer negócio, existe confiança.'),
  (59.30, 59.95, 'Ative.'),
 ]),
 '2_Apresentacao_da_Ative': (os.path.join(V, 'apresentacao-ative', 'ATIVE_Apresentacao_60s_musica.mp4'), [
  (0.6, 3.0, 'Esta é a Ative.'),
  (3.4, 6.2, 'Soluções financeiras e tributárias para a sua empresa.'),
  (6.4, 9.3, 'Diagnóstico, financeiro e tributário.'),
  (9.5, 12.9, 'Mais de catorze anos construindo autoridade na trajetória dos nossos sócios.'),
  (13.1, 15.4, 'Na área financeira, estruturamos crédito de alto valor para grandes empresas.'),
  (15.6, 20.2, 'Mercado de capitais, crédito bancário e linhas de fomento.'),
  (20.4, 24.2, 'Com uma rede de parceria que opera com trinta instituições financeiras.'),
  (24.4, 27.3, 'E, com uma consultoria de custos especializada, encontramos os gargalos dentro da indústria.'),
  (27.5, 30.3, 'Na área tributária, analisamos toda a matriz tributária da sua empresa.'),
  (30.5, 37.2, 'Recuperamos o que foi pago a mais, planejamos o futuro e preparamos a sua empresa para a reforma tributária.'),
  (37.4, 41.1, 'Economia de tributos, com planejamento e estratégia jurídica, dentro da lei.'),
  (41.3, 45.0, 'Mais de cento e trinta empresas em relacionamento, em dezenove estados.'),
  (45.3, 51.0, 'Tudo começa pelo diagnóstico.'),
  (51.3, 56.7, 'O que a sua empresa ainda não enxergou pode ser o seu maior resultado.'),
  (57.0, 59.9, 'Ative. Antes de qualquer negócio, existe confiança.'),
 ]),
 '3_Tributario': (os.path.join(V, 'tributario', 'ATIVE_Tributario_60s_musica.mp4'), [
  (0.3, 2.75, 'Sua empresa paga mais tributo do que deveria?'),
  (2.95, 6.6, 'Quase nenhuma empresa audita o que paga. E paga todos os meses.'),
  (7.2, 9.8, 'Esta é a Ative.'),
  (10.0, 12.75, 'A Ative tem uma auditoria especializada na área tributária.'),
  (12.95, 15.6, 'Auditar, recuperar e planejar.'),
  (15.75, 18.25, 'Um corpo técnico e jurídico tributário analisa toda a matriz da sua empresa.'),
  (18.4, 23.1, 'Contribuições, enquadramentos, créditos e planejamento. Cada detalhe importa.'),
  (23.25, 26.05, 'Encontramos o que foi pago a mais nos últimos cinco anos.'),
  (26.2, 30.3, 'Enquadramentos incorretos, estruturas tratadas como uma só, cálculos feitos sobre dados errados.'),
  (30.5, 33.1, 'Do diagnóstico à economia no caixa da empresa.'),
  (33.2, 37.3, 'E planejamos o futuro, com planejamento tributário e estratégia jurídica, dentro da lei.'),
  (37.4, 41.2, 'A reforma tributária muda as regras. Sua empresa precisa estar preparada.'),
  (41.3, 46.0, 'Tudo começa pelo diagnóstico.'),
  (46.1, 50.3, 'Nem sempre o problema está onde ele aparece.'),
  (50.5, 56.8, 'Mais de cento e trinta empresas em relacionamento, em dezenove estados.'),
  (57.0, 59.9, 'Ative. Antes de qualquer negócio, existe confiança.'),
 ]),
 '4_Quem_Somos': (os.path.join(V, 'quem-somos', 'ATIVE_Quem_Somos_60s_v1.mp4'), [
  (4.0, 8.9, 'Por trás de cada decisão, existe um time.'),
  (9.2, 13.9, 'Na Ative, contamos com profissionais experientes, que unem conhecimento técnico e vivência de campo.'),
  (14.2, 18.9, 'Somos especializados nas áreas comercial, financeira e tributária, e cada caso é analisado de perto.'),
  (19.2, 24.9, 'Na frente financeira, estruturamos capital: capital de giro, antecipação de recebíveis e crédito com as instituições certas.'),
  (25.2, 30.6, 'Na frente tributária, revisamos o que a empresa paga, com equipe jurídica parceira especializada.'),
  (31.0, 39.8, 'São mais de catorze anos de mercado e mais de cento e trinta empresas em relacionamento, em dezenove estados.'),
  (40.3, 45.7, 'Quem está à frente do seu caso acompanha cada etapa, do diagnóstico à solução.'),
  (46.2, 53.5, 'Daqui de Balneário Camboriú, levamos essa segurança a cada cliente.'),
  (56.9, 59.9, 'Antes de qualquer negócio, existe confiança.'),
 ]),
 # v2 (02/10/2026): textos novos gravados no ElevenLabs; o tempo aqui é o da cena na página v7/trib v2
 '1_Estruturacao_v2': (None, [
  (0.0, 2.9, 'O crédito da sua empresa vem com prazo curto, juros altos e limite baixo?'),
  (2.9, 4.3, 'Talvez o problema não seja a empresa.'),
  (4.3, 6.85, 'Pode ser a forma como ela está sendo apresentada.'),
  (6.85, 10.0, 'Prazer, somos a Ative!'),
  (10.0, 11.35, 'Sua empresa tem mais a oferecer do que os números mostram.'),
  (11.35, 12.75, 'Nós ajudamos as instituições financeiras a enxergar esse valor.'),
  (12.75, 15.7, 'Organizamos as informações, desenhamos a estratégia e preparamos sua empresa para acessar capital.'),
  (15.7, 18.2, 'Porque as possibilidades vão além do seu banco.'),
  (18.2, 23.15, 'Crédito bancário, mercado de capitais, fomento.'),
  (23.15, 26.05, 'O caminho começa pela sua empresa.'),
  (26.05, 30.47, 'Identificamos as oportunidades e conectamos a sua empresa com mais de trinta instituições.'),
  (30.47, 33.12, 'Do diagnóstico ao capital no caixa, seguimos do seu lado.'),
  (33.12, 37.45, 'Energia, indústria, mercado imobiliário.'),
  (37.45, 41.25, 'Mais de cento e dezoito milhões de reais, só em 2026.'),
  (50.35, 56.85, 'Mais de setenta empresas em relacionamento, em dezoito estados.'),
  (46.3, 50.35, 'Porque capital começa com preparo.'),
  (56.9, 58.6, 'E toda parceria começa com confiança.'),
  (58.6, 60.0, 'Ative.'),
 ]),
 '3_Tributario_v2': (None, [
  (0, 0, 'Sua empresa está pagando mais tributos do que deveria?'),
  (0, 0, 'E se parte do dinheiro que sua empresa paga nesses tributos pudesse voltar para o caixa da sua empresa?'),
  (0, 0, 'Uma auditoria tributária pode revelar valores pagos a mais e oportunidades de economia para o seu negócio.'),
  (0, 0, 'É aí que a Ative entra.'),
  (0, 0, 'Nossa equipe técnica e jurídica é especializada em auditoria tributária.'),
  (0, 0, 'Auditar, recuperar e planejar.'),
  (0, 0, 'Analisamos toda a estrutura tributária da sua empresa.'),
  (0, 0, 'Contribuições, enquadramentos, créditos e planejamento.'),
  (0, 0, 'Cada detalhe importa.'),
  (0, 0, 'Identificamos possíveis valores pagos a mais nos últimos cinco anos.'),
  (0, 0, 'Um enquadramento incorreto, estruturas diferentes tratadas como uma só ou cálculos com dados errados podem pesar no seu caixa.'),
  (0, 0, 'Do diagnóstico à economia no caixa, seguimos do seu lado.'),
  (0, 0, 'E olhamos para o futuro, com planejamento tributário e estratégia jurídica, dentro da lei.'),
  (0, 0, 'A reforma tributária muda as regras.'),
  (0, 0, 'Sua empresa precisa estar preparada.'),
  (0, 0, 'Tudo começa pelo diagnóstico.'),
  (0, 0, 'Porque nem sempre o problema está onde aparece.'),
  (0, 0, 'Mais de cento e trinta empresas em relacionamento, em dezenove estados.'),
  (0, 0, 'Ative.'),
 ]),
}
VIDEOS['1_Estruturacao_v4'] = (None, VIDEOS['1_Estruturacao_v2'][1])
VIDEOS['3_Tributario_v4'] = (None, VIDEOS['3_Tributario_v2'][1][:-1] + [(0, 0, 'Antes de qualquer negócio, existe confiança.'), (0, 0, 'Ative.')])
VIDEOS['3_Tributario_v5'] = VIDEOS['3_Tributario_v4']
# Apresentação v4 (voz da Aline, 02/10): página nova feita sobre o tempo real da voz
VIDEOS['2_Apresentacao_v4'] = (None, [(0, 0, f) for f in ['Esta é a Ative!', 'Existimos para dar mais vida à sua empresa.', 'Com soluções financeiras e tributárias para melhorar seus resultados e abrir caminhos para crescer.', 'Na área financeira, estruturamos operações de crédito de alto valor para grandes empresas.', 'Mercado de capitais, crédito bancário e linhas de fomento.', 'Conectamos sua empresa a mais de trinta instituições financeiras e identificamos os caminhos para acessar capital.', 'Sua empresa fatura alto, mas o caixa continua apertado?', 'Para empresas e indústrias que enfrentam esse desafio, oferecemos uma consultoria especializada em custos e resultados.', 'Investigamos a operação e cruzamos os números para descobrir onde sua empresa perde eficiência e o que está impedindo o resultado de chegar ao caixa.', 'Onde estão os gargalos?', 'O que pode ser mais eficiente?', 'Quais custos estão consumindo o resultado?', 'Interpretamos esses dados e entregamos um diagnóstico claro, com caminhos para você tomar decisões com segurança e melhorar os resultados da sua empresa.', 'Na área tributária, analisamos cada detalhe da estrutura do seu negócio.', 'Buscamos recuperar valores pagos a mais e reduzir tributos com planejamento tributário e estratégia jurídica.', 'Para a reforma tributária, contamos com uma equipe especializada e altamente qualificada.', 'Profissionais preparados para orientar sua empresa e treinar sua equipe para as novas regras.', 'Tudo começa pelo diagnóstico.', 'Porque uma oportunidade que hoje passa despercebida pode fazer a diferença no seu resultado.', 'Antes de qualquer negócio, existe confiança.', 'Ative. Mais vida para sua empresa!']])


def esc(p):  # caminho para dentro do filtro do ffmpeg
    return p.replace('\\', '/').replace(':', '\\:')


def guia(nome, src, falas, out_dir, tmp):
    font = esc(FONTE)
    f = []
    n = len(falas)
    for i, (a, b, txt) in enumerate(falas):
        t = os.path.join(tmp, f'{nome}_{i}.txt')
        open(t, 'w', encoding='utf-8', newline='\n').write('\n'.join(textwrap.wrap(txt, 32)))
        prev = falas[i - 1][1] if i else 0.0
        common = f"fontfile='{font}':textfile='{esc(t)}':x=(w-text_w)/2:y=(h-text_h)/2-10:line_spacing=10:box=1:boxborderw=22"
        if a - prev > 0.05:  # prévia em cinza enquanto a fala anterior termina
            f.append(f"drawtext={common}:fontsize=36:fontcolor=white@0.45:boxcolor=black@0.35:enable='between(t,{prev:.2f},{a:.2f})'")
            f.append(f"drawtext=fontfile='{font}':text='PRÓXIMA  {i+1}/{n}':fontsize=20:fontcolor=white@0.7:x=(w-text_w)/2:y=40:enable='between(t,{prev:.2f},{a:.2f})'")
        f.append(f"drawtext={common}:fontsize=40:fontcolor=white:boxcolor=black@0.7:enable='between(t,{a:.2f},{b:.2f})'")
        f.append(f"drawtext=fontfile='{font}':text='FALE AGORA  {i+1}/{n}':fontsize=22:fontcolor=0xFFD24A:x=(w-text_w)/2:y=40:enable='between(t,{a:.2f},{b:.2f})'")
    f.append(f"drawtext=fontfile='{font}':text='%{{pts\\:hms}}':fontsize=18:fontcolor=white@0.8:x=w-text_w-16:y=h-34")
    vf = 'scale=854:480,' + ','.join(f)
    out = os.path.join(out_dir, f'NARRACAO_{nome}.mp4')
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-movflags', '+faststart', out], check=True)
    print(out, round(os.path.getsize(out) / 1e6, 1), 'MB')


if __name__ == '__main__':
    out_dir = sys.argv[1]
    so = sys.argv[2:]
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for nome, (src, falas) in VIDEOS.items():
            if so and nome not in so:
                continue
            if src is None or not os.path.exists(src):
                print('FALTA', src); continue
            guia(nome, src, falas, out_dir, tmp)
VIDEOS['2_Apresentacao_v5'] = VIDEOS['2_Apresentacao_v4']
VIDEOS['1_Estruturacao_v5'] = VIDEOS['1_Estruturacao_v4']
