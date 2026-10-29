(function () {
  'use strict';
  var TO = 'Tzeheri26@gmail.com';
  var form = document.getElementById('contact-form');
  var errBox = document.getElementById('c-errors');
  var done = document.getElementById('c-done');

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    done.hidden = true;
    var name = document.getElementById('c-name').value.trim();
    var email = document.getElementById('c-email').value.trim();
    var message = document.getElementById('c-message').value.trim();
    var errors = [];

    if (name.length < 2 || name.length > 80) errors.push('Enter your name (2 to 80 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.push('Enter a valid email address.');
    if (message.length < 10 || message.length > 1000) errors.push('Your message must be 10 to 1000 characters.');

    errBox.textContent = '';
    if (errors.length) {
      errors.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; errBox.appendChild(li); });
      errBox.hidden = false;
      return;
    }
    errBox.hidden = true;

    var subject = 'Message from ' + name + ' (via your website)';
    var body = message + '\n\nReply to: ' + email;
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    done.hidden = false;
    form.reset();
  });
})();
