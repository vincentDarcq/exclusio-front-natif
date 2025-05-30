var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { routes } from './routes.js';
const baseUrl = window.location.origin;
if (window.location.pathname !== '/') {
    handleRedirect(window.location.pathname.substring(1));
}
else {
    const route = routes.find(r => r.path === '');
    handleRedirect(route.class);
}
export let globalSearchList = [];
const searchElement = document.getElementById('global-search');
export const loaderRight = document.createElement('i');
loaderRight.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto', 'spinner-carrousel-right');
export const loaderLeft = document.createElement('i');
loaderLeft.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto', 'spinner-carrousel-left');
document.querySelector('.globalSearch').addEventListener('focus', () => {
    if (globalSearchList.length > 0)
        fillGlobalResults();
});
export function handleRedirect(url) {
    let routeFound = false;
    routes.forEach(route => {
        const page = document.querySelector(`.${route.class}`);
        if (route.class !== url) {
            page.style.display = "none";
            removeActiveClass(route.class);
        }
        else {
            routeFound = true;
            page.style.display = "block";
            addActiveClass(route.class);
            history.pushState({}, '', `${baseUrl}/${route.class}`);
        }
    });
    if (!routeFound) {
        const route = routes.find(r => r.path === '**');
        const page = document.querySelector(`.${route.class}`);
        page.style.display = "block";
        addActiveClass(route.class);
        history.pushState({}, '', baseUrl);
    }
}
function removeActiveClass(route) {
    const element = document.querySelector(`.${route}-header`);
    element.classList.remove('active-head');
}
function addActiveClass(route) {
    const element = document.querySelector(`.${route}-header`);
    element.classList.add('active-head');
}
function search() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = document.querySelector('input.globalSearch');
        if (input.value.toLowerCase().length >= 2) {
            const loader = document.createElement('i');
            loader.classList.add('fa', 'fa-spinner', 'spinner');
            searchElement.replaceChild(loader, searchElement.children[1]);
            const search = yield fetch(`movies/findSubTitle/${input.value.toLowerCase()}`);
            globalSearchList = yield search.json();
            if (globalSearchList.length > 0)
                fillGlobalResults();
            const magnifying = document.createElement('i');
            magnifying.classList.add('fa-solid', 'fa-magnifying-glass');
            searchElement.replaceChild(magnifying, searchElement.children[1]);
        }
        else {
            globalSearchList = [];
            removeGlobalResult();
        }
        ;
    });
}
function fillGlobalResults() {
    removeGlobalResult();
    const globalResultContent = globalSearchList.map(m => {
        return `
      <div class="flex result-line" onclick="selectMovie('${m.id}')">
        <img src="${m.covPortrait}" alt="${m.titre}" class="img-global-search">
        <h5>${m.titre}<span>(${m.year})</span></h5>
      </div>
    `;
    });
    const globalResult = document.createElement('div');
    globalResult.classList.add('global-result');
    globalResult.innerHTML = globalResultContent.join('');
    searchElement.appendChild(globalResult);
}
export const globalSearch = debounce(() => search());
document.addEventListener('click', function (event) {
    if (!searchElement.contains(event.target))
        removeGlobalResult();
});
export function removeGlobalResult() {
    var _a;
    (_a = document.querySelector('.global-result')) === null || _a === void 0 ? void 0 : _a.remove();
}
export function searchMovieInGlobal(id) {
    return globalSearchList.find(movie => movie.id === parseInt(id));
}
export function searchSerieInGlobal(id) {
    return globalSearchList.find(serie => serie.id === parseInt(id));
}
export function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`connexion/logout`, {
            method: "GET",
            credentials: "include",
        });
        window.location.href = "/";
    });
}
window.handleRedirect = handleRedirect;
window.globalSearch = globalSearch;
window.logout = logout;
export function debounce(func, timeout = 800) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, timeout);
    };
}
export const disableArrow = (arrow) => {
    arrow.onclick = null;
    arrow.classList.add('arrow-invisible');
};
export const enableArrow = (arrow, handler) => {
    arrow.onclick = handler;
    arrow.classList.remove('arrow-invisible');
};
