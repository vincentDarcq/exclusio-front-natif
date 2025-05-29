export const API_URL = 'http://localhost:8080';

const inputId = document.querySelector('input.id') as HTMLInputElement;
inputId.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      console.log('enter')
    connexion();
  }
});

const button = document.querySelector('button') as HTMLElement;
button.addEventListener('click', () => {
    connexion()
});

async function connexion() {
    fetch(`${API_URL}/connexion?id=${inputId.value}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include",
    }).then(reponse => {
        console.log(reponse)
        if (reponse.ok) window.location.href = "/";
    })
}