const func = () => {
    let isTrue = true;
    const body = document.body;
    body.style.transform = 'translateX(0)';
    const links = document.querySelectorAll('.fadeAnimate');
    
    links.forEach((link) => {
        link.addEventListener("click", (evt) => {
            if(isTrue){
                evt.preventDefault();
                isTrue = false;
            }
            body.style.transform = 'translateX(100em)';
            setTimeout(()=>{
                link.click();
                isTrue = true;
            },200)
        });
    });
}

window.addEventListener("load", func);