import { API_URL } from './films/films.js';
import { Movie } from './films/movie_type.js';
import { routes } from './routes.js';
import { Serie } from './series/serie_type.js';
const baseUrl = window.location.origin;
if (window.location.pathname !== '/') {
  handleRedirect(window.location.pathname.substring(1))
} else {
  const route = routes.find(r => r.path === '');
  handleRedirect(route!.class);
}
export let globalSearchList: Array<Movie | Serie> = [];
const searchElement = document.getElementById('global-search') as HTMLElement;
export const loaderRight = document.createElement('i');
loaderRight.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto', 'spinner-carrousel-right');
export const loaderLeft = document.createElement('i');
loaderLeft.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto', 'spinner-carrousel-left');

declare global {
  interface Window {
    handleRedirect: (url: string) => void;
    globalSearch: () => void;
  }
}

document.querySelector('.globalSearch')!.addEventListener('focus', () => {
  if(globalSearchList.length > 0) fillGlobalResults();
});

export function handleRedirect(url: string): void {
  let routeFound = false;
  routes.forEach(route => {
    const page = document.querySelector(`.${route.class}`) as HTMLElement;
    if (route.class !== url) {
      page.style.display = "none";
      removeActiveClass(route.class);
    } else {
      routeFound = true;
      page.style.display = "block";
      addActiveClass(route.class);
      history.pushState({}, '', `${baseUrl}/${route.class}`);
    }
  });

  if (!routeFound) {
    const route = routes.find(r => r.path === '**');
    const page = document.querySelector(`.${route!.class}`) as HTMLElement;
    page.style.display = "block";
    addActiveClass(route!.class);
    history.pushState({}, '', baseUrl);
  }
}

function removeActiveClass(route: string) {
  const element = document.querySelector(`.${route}-header`) as HTMLElement;
  element.classList.remove('active-head');
}

function addActiveClass(route: string) {
  const element = document.querySelector(`.${route}-header`) as HTMLElement;
  element.classList.add('active-head');
}

async function search(){
  const input = document.querySelector('input.globalSearch') as HTMLInputElement;
  if (input.value.toLowerCase().length >= 2) {
    const loader = document.createElement('i');
    loader.classList.add('fa', 'fa-spinner', 'spinner');
    searchElement.replaceChild(loader, searchElement.children[1])
    const search = await fetch(`${API_URL}/movies/findSubTitle/${input.value.toLowerCase()}`);
    globalSearchList = await search.json();
    if(globalSearchList.length > 0) fillGlobalResults();
    const magnifying = document.createElement('i');
    magnifying.classList.add('fa-solid', 'fa-magnifying-glass');
    searchElement.replaceChild(magnifying, searchElement.children[1]);
  } else {
    globalSearchList = [];
    removeGlobalResult();
  };
}

function fillGlobalResults() {
  removeGlobalResult()
  const globalResultContent = globalSearchList.map(m => {
    return `
      <div class="flex result-line" onclick="selectMovie('${m.id}')">
        <img src="${m.covPortrait}" alt="${m.titre}" class="img-global-search">
        <h5>${m.titre}<span>(${m.year})</span></h5>
      </div>
    `
  });
  const globalResult = document.createElement('div');
  globalResult.classList.add('global-result');
  globalResult.innerHTML = globalResultContent.join('');
  searchElement.appendChild(globalResult);
}

export const globalSearch = debounce(() => search());

document.addEventListener('click', function(event) {
  if (!searchElement!.contains(event.target as Node)) removeGlobalResult()
});

export function removeGlobalResult() {
  document.querySelector('.global-result')?.remove();
}

export function searchMovieInGlobal(id: string): Movie | undefined{
  return globalSearchList.find(movie => movie.id === parseInt(id)) as Movie
}

export function searchSerieInGlobal(id: string): Serie | undefined{
  return globalSearchList.find(serie => serie.id === parseInt(id)) as Serie
}

window.handleRedirect = handleRedirect;
window.globalSearch = globalSearch;

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  timeout: number = 800
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}