const card = document.querySelector('.card-body')
const form = document.createElement('form');
form.setAttribute('action', '/u/register/verify');
form.setAttribute('method', 'POST');
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
form.appendChild(label);
form.appendChild(inp);
form.appendChild(btn);
card.appendChild(form);