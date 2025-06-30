const oldForm = document.querySelector('form');
oldForm.remove();


const card = document.querySelector('.card-body')
const form = document.createElement('form');
form.setAttribute('method', 'POST');
form.setAttribute('action', '/u/forgot/updatePwd');
form.setAttribute('id', 'otpForm');

const pwdLabel = document.createElement('label');
pwdLabel.setAttribute('for','pwd');
pwdLabel.innerText = 'Create a new Password:';
pwdLabel.classList.add("form-label", "mt-3");
const pwdInput = document.createElement('input');
pwdInput.setAttribute('type', 'password');
pwdInput.setAttribute('name', 'pwd');
pwdInput.setAttribute('id', 'pwd');
pwdInput.classList.add('form-control');
const div1 = document.createElement('div');
div1.appendChild(pwdLabel);
div1.appendChild(pwdInput);

const otpLabel = document.createElement('label');
otpLabel.setAttribute('for','otp');
otpLabel.innerText = 'Enter the OTP sent to your Email:';
otpLabel.classList.add("form-label", "mt-3");
const otpInput = document.createElement('input');
otpInput.setAttribute('type', 'text');
otpInput.setAttribute('name', 'otp');
otpInput.setAttribute('id', 'otp');
otpInput.classList.add('form-control');
const div2 = document.createElement('div');
div2.appendChild(otpLabel);
div2.appendChild(otpInput);


const btn = document.createElement('button');
btn.innerText = `Submit`;
btn.classList.add('btn', 'btn-success');
const div3 = document.createElement('div');
div3.classList.add('d-grid','mt-3');
div3.appendChild(btn);

const div = document.createElement('div');
div.appendChild(div1);
div.appendChild(div2);
div.appendChild(div3);

form.appendChild(div);
card.appendChild(form);


