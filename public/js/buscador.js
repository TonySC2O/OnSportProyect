function buscarPolideportivo() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const fichas = document.querySelectorAll(".layout_main");

    fichas.forEach(ficha => {
        const tarjeta = ficha.closest(".layout");
        const contenido = ficha.innerText.toLowerCase();

        if (texto === "" || contenido.includes(texto)) {
            tarjeta.classList.remove("oculto");
            marcarTexto(ficha, texto);
        } else {
            tarjeta.classList.add("oculto");
        }
    });
}

function marcarTexto(elemento, texto) {
    guardarTextoOriginal(elemento);

    if (texto === "") {
        restaurarTexto(elemento);
        return;
    }

    const nodos = elemento.querySelectorAll("h2, p");

    nodos.forEach(nodo => {
        const regex = new RegExp(`(${texto})`, "gi");
        nodo.innerHTML = nodo.dataset.original.replace(
            regex,
            '<span class="resaltado">$1</span>'
        );
    });
}

function guardarTextoOriginal(elemento) {
    const nodos = elemento.querySelectorAll("h2, p");

    nodos.forEach(nodo => {
        if (!nodo.dataset.original) {
            nodo.dataset.original = nodo.textContent;
        }
    });
}

function restaurarTexto(elemento) {
    const nodos = elemento.querySelectorAll("h2, p");

    nodos.forEach(nodo => {
        if (nodo.dataset.original) {
            nodo.textContent = nodo.dataset.original;
        }
    });
}
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}