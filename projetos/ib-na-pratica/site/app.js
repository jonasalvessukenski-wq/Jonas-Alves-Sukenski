/* IB na Prática — protótipo. Pequeno de propósito: um gesto, entradas únicas, checkout fictício,
   e as vistas da área do aluno. Nada é enviado a servidor algum. */
(function () {
  'use strict';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function guarda(chave, valor) { try { if (valor === undefined) return localStorage.getItem(chave); localStorage.setItem(chave, valor); } catch (e) { return null; } }
  function sessao(chave, valor) { try { if (valor === undefined) return sessionStorage.getItem(chave); sessionStorage.setItem(chave, valor); } catch (e) { return null; } }

  /* Gesto assinatura: o fio do hero se desenha uma vez por sessão e nunca reacende. */
  var hero = document.querySelector('.hero');
  if (hero && !reduz && !sessao('ibp-gesto')) {
    hero.classList.add('gesto');
    sessao('ibp-gesto', '1');
  }

  /* Entrada de bloco: 400ms, sobe 12px, uma vez. */
  var blocos = document.querySelectorAll('.revela');
  if (reduz || !('IntersectionObserver' in window)) {
    blocos.forEach(function (b) { b.classList.add('visto'); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocos.forEach(function (b) { io.observe(b); });
  }

  /* Checkout (protótipo) */
  var dialogo = document.getElementById('checkout');
  if (dialogo) {
    document.querySelectorAll('[data-abre-checkout]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (typeof dialogo.showModal === 'function') dialogo.showModal(); else dialogo.setAttribute('open', '');
      });
    });
    dialogo.querySelector('[data-fecha-checkout]').addEventListener('click', function () { dialogo.close(); });
    dialogo.addEventListener('click', function (e) { if (e.target === dialogo) dialogo.close(); });
    dialogo.querySelector('[data-checkout-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      dialogo.querySelector('[data-checkout-aviso]').textContent =
        'Protótipo: aqui o aluno seguiria para o pagamento (Pix ou cartão) no gateway escolhido. Nenhum dado foi enviado.';
    });
  }

  /* Área do aluno: duas vistas (início e aula), roteadas pelo endereço. */
  var vistas = document.querySelectorAll('[data-vista]');
  if (vistas.length) {
    var links = document.querySelectorAll('[data-nav]');
    var itensNav = ['inicio', 'trilha', 'aula', 'agenda', 'comunidade'];

    function mostra() {
      var alvo = (location.hash || '#inicio').slice(1);
      var vista = alvo === 'aula' ? 'aula' : 'inicio';
      vistas.forEach(function (v) { v.hidden = v.getAttribute('data-vista') !== vista; });
      links.forEach(function (l) {
        var n = l.getAttribute('data-nav');
        var ativo = n === alvo || (itensNav.indexOf(alvo) === -1 && n === 'inicio');
        if (ativo) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
      });
      if (vista === 'aula' || alvo === 'inicio') { window.scrollTo(0, 0); }
      else {
        var el = document.getElementById(alvo);
        if (el) el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
      }
    }
    window.addEventListener('hashchange', mostra);
    mostra();

    /* Anotações salvas só neste navegador. */
    var nota = document.getElementById('anotacoes');
    var estado = document.querySelector('[data-notas-estado]');
    if (nota) {
      var salvo = guarda('ibp-notas-aula');
      if (salvo) nota.value = salvo;
      var t;
      nota.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          guarda('ibp-notas-aula', nota.value);
          if (estado) estado.textContent = 'Salvo neste navegador.';
        }, 400);
      });
    }

    /* Marcar aula como concluída (só visual). */
    var concluir = document.querySelector('[data-concluir]');
    if (concluir) {
      concluir.addEventListener('click', function () {
        var feito = concluir.getAttribute('aria-pressed') === 'true';
        concluir.setAttribute('aria-pressed', feito ? 'false' : 'true');
        concluir.querySelector('span').textContent = feito ? 'Marcar como concluída' : 'Concluída';
      });
    }
  }
})();
