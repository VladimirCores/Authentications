import './styles/form-style.css'

const domLinkCreateAccount =  document.getElementById('linkCreateAccount');
const domLinkLogin =  document.getElementById('linkLogin');
domLinkCreateAccount.addEventListener('click', (e) => {
  document.getElementById('formRegister').style.display = 'block';
  document.getElementById('formLogin').style.display = 'none';
});
domLinkLogin.addEventListener('click', (e) => {
  document.getElementById('formRegister').style.display = 'none';
  document.getElementById('formLogin').style.display = 'block';
});

