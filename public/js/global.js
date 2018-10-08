function generateTOC() {
  var _toc = $('<ol class="top"></ol>');
  var show = false;
  var toc = _toc;
  var counter = 0;
  var tags = ['h2', 'h3', 'h4', 'h5', 'h6'];
  if ($('#content h1').length > 1) tags.unshift('h1');
  for (i in tags) { tags[i] = '#content ' + tags[i] }
  var lastTag = parseInt(tags[0][1]);
  $(tags.join(', ')).each(function() {
    if ($(this).hasClass('entry')) return;
    show = true;
    var thisTag = parseInt(this.tagName[1]);
    if (this.id.length == 0) {
      var proposedId = $(this).text().replace(/[^a-z]/ig, '_');
      if ($('#' + proposedId).length > 0) proposedId += counter++;
      this.id = proposedId;
    }
    if (thisTag > lastTag) { 
      for (var i = 0; i < thisTag - lastTag; i++) { 
        var tmp = $('<ol/>'); toc.append(tmp); toc = tmp; 
      } 
    }
    if (thisTag < lastTag) { 
      for (var i = 0; i < lastTag - thisTag; i++) toc = toc.parent(); 
    }
    toc.append('<li><a href="#' + this.id + '">' + $(this).text() + '</a></li>');
    lastTag = thisTag;
  });
  if (!show) return;
  html = '<div id="toc" class="nofloat"><p class="title"><a class="hide_toc" href="#"><strong>Table of Contents</strong></a> <small>(<a href="#" class="float_toc">float</a>)</small></p></div>';
  $('#content h1').after(html);
  $('#toc').append(_toc);
  $('#toc .hide_toc').toggle(function() { 
    $('#toc .top').slideUp('fast');
    $('#toc').toggleClass('hidden');
    $('#toc .title small').toggle();
  }, function() {
    $('#toc .top').slideDown('fast');
    $('#toc').toggleClass('hidden');
    $('#toc .title small').toggle();
  });
  $('#toc .float_toc').toggle(function() { 
    $(this).text('left');
    $('#toc').toggleClass('nofloat');
  }, function() {
    $(this).text('float')
    $('#toc').toggleClass('nofloat');
  });
}

// hero
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const showcase = document.getElementById('showcase');
  const blurbs = hero.querySelectorAll('.blurb');
  const selector = hero.querySelector('.selector');

  function advanceTile(n) {
    if (!n) n = 1;
    var next = parseInt(hero.dataset.selected) + n;
    if (next > blurbs.length) next = 1;
    if (next <= 0) next = blurbs.length;
    hero.dataset.selected = next.toString();
  }

  var advanceInterval = null;
  function setAdvanceInterval() {
    if (advanceInterval) clearInterval(advanceInterval);
    advanceInterval = setInterval(advanceTile, 8000);
  }

  blurbs.forEach((el, idx) => {
    const num = idx + 1;
    const hdr = document.createElement('h1');
    const div = document.createElement('div');
    hdr.innerText = el.querySelector('h2').innerText;
    div.classList.add(`tile${num}`);
    el.classList.add(`tile${num}`);
    div.style.backgroundImage = `url('${el.dataset.bg}')`;
    div.appendChild(hdr);
    showcase.appendChild(div);

    const sel = document.createElement('i');
    sel.className = 'fas fa-circle';
    sel.dataset.selection = num;
    selector.appendChild(sel);

    el.addEventListener('mouseover', () => {
      hero.dataset.selected = num.toString();
      clearInterval(advanceInterval);
      advanceInterval = null;
    });
    el.addEventListener('mouseout', () => {
      setAdvanceInterval();
    });
    el.addEventListener('click', () => {
      setAdvanceInterval();
    });

    sel.addEventListener('click', () => {
      hero.dataset.selected = num.toString();
      setAdvanceInterval();
    });
  });

  setAdvanceInterval();
  hero.querySelector('.fa-angle-left').addEventListener('click', () => {
    setAdvanceInterval();
    advanceTile(-1);
  });
  hero.querySelector('.fa-angle-right').addEventListener('click', () => {
    setAdvanceInterval();
    advanceTile();
  });
});
