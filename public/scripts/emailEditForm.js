const oldForm = document.querySelector('form');
oldForm.remove();

const card = document.querySelector('.card');
const form = document.createElement('form');
form.setAttribute('method', 'POST');
form.setAttribute('action', '/u/settings/editEmail');
form.setAttribute('id', 'otpForm');

const label = document.createElement('label');
label.setAttribute('for','otp');
label.innerText = 'Enter the OTP sent to your Email:';
label.classList.add("form-label", "mt-3");

const inp = document.createElement('input');
inp.setAttribute('type', 'text');
inp.setAttribute('name', 'otp');
inp.setAttribute('id', 'otp');
inp.classList.add('form-control');

const btn = document.createElement('button');
btn.innerText = `Submit`;
btn.classList.add('btn', 'btn-success');
const div3 = document.createElement('div');
div3.classList.add('d-grid','mt-3');
div3.appendChild(btn);

const div = document.createElement('div');
div.appendChild(label);
div.appendChild(inp);
div.appendChild(div3);
form.appendChild(div);
card.appendChild(form);