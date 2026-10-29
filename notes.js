(function () {
  'use strict';

  var KEY = 'tz_notes_v1';
  var form = document.getElementById('note-form');
  var titleEl = document.getElementById('note-title');
  var topicEl = document.getElementById('note-topic');
  var textEl = document.getElementById('note-text');
  var msgEl = document.getElementById('form-msg');
  var submitBtn = document.getElementById('note-submit');
  var cancelBtn = document.getElementById('note-cancel');
  var formTitle = document.getElementById('form-title');
  var searchEl = document.getElementById('note-search');
  var filterEl = document.getElementById('note-filter');
  var listEl = document.getElementById('note-list');
  var emptyEl = document.getElementById('note-empty');
  var countEl = document.getElementById('note-count');
  var downloadBtn = document.getElementById('note-download');
  var editingId = null;

  /* ---- storage (wrapped in try/catch: browsers can block it) ---- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); return true; }
    catch (e) { showMsg('Your browser blocked saving. Check that storage is allowed for this site.', 'error'); return false; }
  }

  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className = 'flash ' + type;
    msgEl.hidden = false;
  }
  function clearMsg() { msgEl.hidden = true; msgEl.textContent = ''; }

  /* ---- Create / Update ---- */
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearMsg();
    var title = titleEl.value.trim();
    var text = textEl.value.trim();
    if (title.length < 2 || title.length > 80) { showMsg('Enter a title between 2 and 80 characters.', 'error'); titleEl.focus(); return; }
    if (text.length < 5 || text.length > 1000) { showMsg('The note must be between 5 and 1000 characters.', 'error'); textEl.focus(); return; }

    var notes = load();
    if (editingId) {
      notes = notes.map(function (n) {
        return n.id === editingId ? Object.assign({}, n, { title: title, topic: topicEl.value, text: text, updated: Date.now() }) : n;
      });
      if (save(notes)) showMsg('Changes saved.', 'success');
    } else {
      notes.push({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: title, topic: topicEl.value, text: text, created: Date.now(), updated: Date.now() });
      if (save(notes)) showMsg('Note added.', 'success');
    }
    resetForm(true);
    render();
  });

  function resetForm(keepMsg) {
    editingId = null;
    form.reset();
    submitBtn.textContent = 'Add note';
    formTitle.textContent = 'Add a note';
    cancelBtn.hidden = true;
    if (!keepMsg) clearMsg();
  }
  cancelBtn.addEventListener('click', function () { resetForm(false); });

  function startEdit(n) {
    editingId = n.id;
    titleEl.value = n.title; topicEl.value = n.topic; textEl.value = n.text;
    submitBtn.textContent = 'Save changes';
    formTitle.textContent = 'Edit note';
    cancelBtn.hidden = false;
    clearMsg();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleEl.focus();
  }

  /* ---- Delete ---- */
  function remove(n) {
    if (!window.confirm('Delete "' + n.title + '"? This cannot be undone.')) return;
    if (save(load().filter(function (x) { return x.id !== n.id; }))) {
      if (editingId === n.id) resetForm(false);
      render();
    }
  }

  /* ---- Read + Search + Filter ---- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;     // textContent = no XSS
    return e;
  }

  function render() {
    var all = load().sort(function (a, b) { return b.created - a.created; });
    var q = searchEl.value.trim().toLowerCase();
    var topic = filterEl.value;
    var shown = all.filter(function (n) {
      var hit = !q || n.title.toLowerCase().indexOf(q) !== -1 || n.text.toLowerCase().indexOf(q) !== -1;
      return hit && (!topic || n.topic === topic);
    });

    countEl.textContent = all.length ? '(' + shown.length + ' of ' + all.length + ')' : '';
    listEl.textContent = '';
    shown.forEach(function (n) {
      var card = el('article', 'card');
      card.appendChild(el('h3', '', n.title));
      var meta = el('p', 'muted');
      meta.appendChild(el('span', 'tag', n.topic));
      meta.appendChild(document.createTextNode(' ' + new Date(n.created).toISOString().slice(0, 10)));
      card.appendChild(meta);
      card.appendChild(el('p', 'note-body', n.text));
      var actions = el('div', 'note-actions');
      var edit = el('button', 'link', 'Edit'); edit.type = 'button';
      edit.addEventListener('click', function () { startEdit(n); });
      var del = el('button', 'link danger', 'Delete'); del.type = 'button';
      del.addEventListener('click', function () { remove(n); });
      actions.appendChild(edit); actions.appendChild(del);
      card.appendChild(actions);
      listEl.appendChild(card);
    });

    if (!shown.length) {
      emptyEl.hidden = false;
      emptyEl.textContent = all.length ? 'No note matches your search.' : 'No notes yet. Add your first note above.';
    } else {
      emptyEl.hidden = true;
    }
  }

  searchEl.addEventListener('input', render);
  filterEl.addEventListener('change', render);

  /* ---- Download all notes as a file ---- */
  downloadBtn.addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'my-notes.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  render();
})();
