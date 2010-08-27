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

function initNavLinks() {
  $('#nav a').hover(function() { 
    $(this).css({'padding-top':'25px'}, 100); 
  }, function() { 
    $(this).css({'padding-top':'5px'}, 100); 
  });
}

$(initNavLinks);