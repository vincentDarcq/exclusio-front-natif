import { debounce, loaderLeft, loaderRight, searchSerieInGlobal } from "../index.js";
import { Serie } from "./serie_type.js";

declare global {
  interface Window {
    switchSeriesTabFilters: (url: string) => Promise<void>;
    selectSerie(id: string): Promise<void>;
    navigate(direction: string, carousel: number, page: number): void;
    closePopupSerie: () => void;
    genreSelectedForSerie: (checkbox: HTMLInputElement) => void;
    actorSelectedForSerie: (actor: string) => void;
    directorSelectedForSerie: (director: string) => void;
    actorChange: () => void;
    directorChange: () => void;
    switchMode: () => void;
    moreActors: () => void;
    moreDirectors: () => void;
  }
}

export const API_URL = 'http://localhost:8080';
let allSeries: Array<Serie> = [];
let allActors: Array<string> = [];
let allDirectors: Array<string> = [];
let genresToFilter: Array<string> = [];
let actorsToFilter: Array<string> = [];
let directorsToFilter: Array<string> = [];
let filterMode = "exclusion";
let indexFilterActors = 0;
let indexFilterDirectors = 0;
let directorsElements = document.querySelector('.directors') as HTMLElement;
let actorsElements = document.querySelector('.actors') as HTMLElement;
const caroussels = document.querySelectorAll('.carousels');
const carouselSerie = caroussels![1] as HTMLElement;
const loader = document.createElement('i');
loader.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto');
const arrowDown = document.createElement('span');
arrowDown.classList.add('fa', 'fa-2x', 'fa-arrow-circle-down');
const arrowLeft = document.querySelector('.arrow-left-serie') as HTMLElement;
const arrowRight = document.querySelector('.arrow-right-serie') as HTMLElement;
  
switchSeriesTabFilters('genres');
// fetchActors();
// fetchDirectors();
fetchSeries(0);

export function switchMode(){
  filterMode = filterMode === "exclusion" ? "inclusion" : "exclusion";
  const button = document.querySelector('.filter-mode') as HTMLElement;
  button.innerHTML = `Passer en mode ${filterMode === "exclusion" ? "inclusion" : "exclusion"}`;
  const genresTab = document.querySelector('.tab-genres') as HTMLElement;
  const directorsTab = document.querySelector('.tab-directors') as HTMLElement;
  const actorsTab = document.querySelector('.tab-actors') as HTMLElement;
  const modeForTab = `${filterMode.charAt(0).toUpperCase()}${filterMode.substring(1)}`
  genresTab.innerHTML = `${modeForTab} des genres`;
  directorsTab.innerHTML = `${modeForTab} des réalisateurs`;
  actorsTab.innerHTML = `${modeForTab} des acteurs`;
}

export async function switchSeriesTabFilters(tab: string): Promise<void> {
  indexFilterActors = 0;
  indexFilterDirectors = 0;
  ['genres', 'directors', 'actors'].filter(t => t !== tab).forEach(
    tab => {
      const tabEl = document.querySelector(`.tab-${tab}`) as HTMLElement;
      tabEl.classList.remove('active');
      const exclusionEl = document.querySelector(`.${tab}`) as HTMLElement;
      exclusionEl.style.display = 'none';
    }
  )
  const exclusionsTab = document.querySelector(`.tab-${tab}`) as HTMLElement;
  exclusionsTab.classList.add('active');
  const exclusions = document.querySelector(`.${tab}`) as HTMLElement;
  exclusions.style.display = 'flex';
  if(tab !== 'genres')  await fillFilters(tab, document.querySelector(`.list-${tab}`) as HTMLElement);
}

async function fillFilters(tab: string, element: HTMLElement, elementsSearched?: Array<string>) {
  let html;
  switch (tab) {
    case 'actors':
      actorsElements.replaceChild(loader, actorsElements.children[2]);
      const actorFiltered = await Promise.all(
        actorsToFilter.map(
          async actor => { return getPersonElement('actor', actor, true) }
        )
      )
      html = await Promise.all(
        elementsSearched ?
          elementsSearched.filter(a => !actorsToFilter.includes(a)).slice(0, 27).map(
            async actor => { return getPersonElement('actor', actor) }
          ) : allActors.filter(a => !actorsToFilter.includes(a)).slice(0, 27).map(
            async actor => { return getPersonElement('actor', actor) }
          )
      )
      element.innerHTML = `${actorFiltered.join('')}${html.join('')}`;
      arrowDown.onclick = moreActors;
      actorsElements.replaceChild(arrowDown, actorsElements.children[2]);
      break;
    case 'directors':
      directorsElements.replaceChild(loader, directorsElements.children[2]);
      const directorFiltered = await Promise.all(
        directorsToFilter.map(
          async director => { return getPersonElement('director', director, true) }
        )
      )
      html = await Promise.all(
        elementsSearched ?
          elementsSearched.filter(d => !directorsToFilter.includes(d)).slice(0, 27).map(
            async director => { return getPersonElement('director', director) }
          ) : allDirectors.filter(d => !directorsToFilter.includes(d)).slice(0, 27).map(
            async director => { return getPersonElement('director', director) }
          )
      )
      element.innerHTML = `${directorFiltered.join('')}${html.join('')}`;
      arrowDown.onclick = moreDirectors;
      directorsElements.replaceChild(arrowDown, directorsElements.children[2]);
  }  
}

async function getPersonElement(type: string, person: string, filter = false): Promise<string> {
  const selector = person.replace(/\s+/g, '');
  const i = type === 'actor' ? actorsToFilter.findIndex(a => a === person) : directorsToFilter.findIndex(a => a === person);;
  const picture = await fetchPersonPicture(person);
  return `
    <div class="element flex-column"
      ${type === 'actor' ? `onclick="actorSelectedForSerie('${selector}')"` : `onclick="directorSelectedForSerie('${selector}')"`}
    >
      ${picture ? `<img src="${picture}" alt="actor">` : ''}
      <span class="
          ${selector} 
          ${i !== -1 ? 'element-selected' : ''} 
          margin-auto fit-content
          ${filter ? `${filterMode === "exclusion" ? 'exclude' : 'include'}` : ''}"
      >
        ${person}
      </span>
    </div>
  `
}

async function moreActors() {
  indexFilterActors += 28;
  actorsElements.replaceChild(loader, actorsElements.children[2]);
  const actors = document.querySelector(`.list-actors`) as HTMLElement;
  const html = await Promise.all(
    allActors.slice(indexFilterActors, indexFilterActors+27).map(
      async actor => {
        const selector = actor.replace(/\s+/g, '');
        const i = actorsToFilter.findIndex(a => a === actor);
        const picture = await fetchPersonPicture(actor);
        return `
          <div class="element flex-column" id="${selector}" onclick="actorSelectedForSerie('${selector}')">
            ${picture ? `<img src="${picture}" alt="actor">` : ''}
            <span class="${selector} ${i !== -1 ? 'element-selected' : ''}">${actor}</span>
          </div>
        `
      }
    )
  )
  actors.innerHTML = `${actors.innerHTML}${html.join('')}`;
  actorsElements.replaceChild(arrowDown, actorsElements.children[2]);
}

async function moreDirectors() {
  indexFilterDirectors += 28;
  directorsElements.replaceChild(loader, directorsElements.children[2]);
  const actors = document.querySelector(`.list-directors`) as HTMLElement;
  const html = await Promise.all(
    allDirectors.slice(indexFilterDirectors, indexFilterDirectors+27).map(
      async director => {
        const selector = director.replace(/\s+/g, '');
        const i = directorsToFilter.findIndex(a => a === director);
        const picture = await fetchPersonPicture(director);
        return `
          <div class="element flex-column">
            ${picture ? `<img src= "${picture}" alt = "director" >` : ''}
            <span class="${selector} ${i !== -1 ? 'element-selected' : ''}">${director}</span>
          </div>
        `
      }
    )
  )
  actors.innerHTML = `${actors.innerHTML}${html.join('')}`;
  directorsElements.replaceChild(arrowDown, directorsElements.children[2]);
}

async function fetchPersonPicture(person: string) {
  const stringPerson = person.replace(' ', '%20');
  const searchPerson = await fetch(`${API_URL}/allo/${stringPerson}`);
  const resultPerson = await searchPerson.json();
  return resultPerson[0].data.thumbnail;
}

async function searchActor() {
  const input = document.querySelector('input.searchActor') as HTMLInputElement;
  const actors = allActors.filter(actor => actor.toLowerCase().includes(input.value.toLowerCase()));
  await fillFilters('actors', document.querySelector('.list-actors') as HTMLElement, actors)
}

async function searchDirector() {
  const input = document.querySelector('input.searchDirector') as HTMLInputElement;
  const directors = allDirectors.filter(director => director.toLowerCase().includes(input.value.toLowerCase()));
  await fillFilters('directors', document.querySelector('.list-directors') as HTMLElement, directors)
}

export const actorChange = debounce(() => searchActor());
export const directorChange = debounce(() => searchDirector());

export function genreSelected(checkbox: HTMLInputElement) {
  const element = document.querySelector(`.${checkbox.value}`) as HTMLInputElement;
  if (checkbox.checked) {
    element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
  } else {
    element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
  }
  if (checkbox.checked) {
    genresToFilter.push(checkbox.value);
  } else {
    genresToFilter.splice(genresToFilter.findIndex(g => g === checkbox.value), 1);
  }
  fetchSeries(0);
}

export function actorSelectedForSerie(actor: string) {
  const indexActor = allActors.map(a => a.replace(/\s+/g, '')).findIndex(a => a === actor);
  const element = document.querySelector(`.${actor}`) as HTMLInputElement;
  const actorChecked = actorsToFilter.map(a => a.replace(/\s+/g, '')).includes(actor);
  if (actorChecked) {
    element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
    actorsToFilter.splice(actorsToFilter.findIndex(a => a === allActors[indexActor]), 1);
  } else {
    element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
    actorsToFilter.push(allActors[indexActor]);
  }
  fetchSeries(0);
}

export function directorSelectedForSerie(director: string) {
  const indexDirector = allDirectors.map(d => d.replace(/\s+/g, '')).findIndex(d => d === director);
  const element = document.querySelector(`.${director}`) as HTMLInputElement;
  const actorChecked = directorsToFilter.map(a => a.replace(/\s+/g, '')).includes(director);
  if (actorChecked) {
    element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
    directorsToFilter.splice(directorsToFilter.findIndex(d => d === allDirectors[indexDirector]), 1);
  } else {
    element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`)
    directorsToFilter.push(allDirectors[indexDirector]);
  }
  fetchSeries(0);
}

export async function selectSerie(id: string): Promise<void> {
  let serie = allSeries.find(serie => serie.id === parseInt(id));
  if (!serie)  serie = searchSerieInGlobal(id);
  const popup = document.querySelector('.serie-popup') as HTMLElement;
  const emptyCov = serie?.covPortrait.indexOf('empty');
  popup!.innerHTML = `
    <div class="flex header">
      <h2 class="serie-title">${serie?.titre}</h2>
      <div class="cross" onClick="closePopupSerie()">X</div>
    </div>
    <div class="flex infos">
      <div class="flex-column">
        <h4>Genres : ${serie?.genre}</h4>
        <h4>Casting : ${serie?.casting}</h4>
        <h4>Réalisateur: ${serie?.realisateur}</h4>
        <h4>Episodes: ${serie?.episodes}</h4>
        <h4>Saisons: ${serie?.seasons}</h4>
        <h4>${serie?.year}</h4>
      </div>
      ${emptyCov === -1 ? `<img src="${serie?.covPortrait}" alt="cov" >` : ''}
    </div>
    ${serie?.synopsis ? `<p>${serie?.synopsis} </p>` : ''}
    <div class="flex notes">
      ${serie?.alloGrade ? `<span>Note allociné: ${ serie?.alloGrade }/5</span >` : ''}
    </div>
  `;
  popup.style.display = 'block';
}

export function closePopupSerie() {
  const popup = document.querySelector('.serie-popup') as HTMLElement;
  popup.style.display = 'none';
}

async function fetchActors() {
  const result = await fetch(`${API_URL}/series/acteurs`);
  const content = await result.json();
  allActors = content;
}

async function fetchDirectors() {
  const result = await fetch(`${API_URL}/series/realisateurs`);
  const content = await result.json();
  allDirectors = content;
}

export async function navigate(direction: string, page: number) {
  fetchSeries(page, direction);
}

async function fetchSeries(page: number, direction?: string): Promise<void> {
  if (direction) carouselSerie.replaceChild(direction === 'right' ? loaderRight : loaderLeft, carouselSerie.children[direction === 'right' ? 2 : 0]);
  const result = await fetch(`${API_URL}/series/${filterMode === "exclusion" ? 'exclusions' : 'inclusions'}/${page}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      genres: genresToFilter,
      casting: actorsToFilter,
      realisateurs: directorsToFilter
    })
  });
  const content = await result.json();
  const series: Array<Serie> = content.content;
  arrowRight.onclick = async () => {
    await navigate('right', page + 1);
  };
  if (page > 0) {
    arrowLeft.classList.remove('arrow-invisible');
    arrowLeft.onclick = async () => {
      await navigate('left', page - 1);
    };
  } else {
    arrowLeft.onclick = null;
    if(!arrowLeft.classList.contains('arrow-invisible')) arrowLeft?.classList.add('arrow-invisible')
  }
  fillLine(series.slice(0, 8), 1, direction)
  fillLine(series.slice(8, 16), 2, direction)
  fillLine(series.slice(16), 3, direction)
  if (direction) carouselSerie.replaceChild(direction === 'right' ? arrowRight : arrowLeft, carouselSerie.children[direction === 'right' ? 2 : 0]);
}


function fillLine(series: Array<Serie>, line: number, direction?: string) {
  let html = '';
  series.forEach(
    serie => {
      if (allSeries.findIndex(m => m.id === serie.id) === -1) {
        allSeries.push(serie);
      }
      const emptyCov = serie.covPortrait.indexOf('empty');
      html += `
        ${emptyCov === -1 ? `<img class="img-serie" src="${serie.covPortrait}" alt="${serie.titre}" onclick="selectSerie(${serie.id})" >`
          : `<span class="titre-no-cov" onclick="selectSerie(${serie.id})">${serie.titre}</span>`}
      `;
    }
  );
  if (direction) {
    slide(direction, line, html);
  } else {
    const slide = document.querySelector(`.series_${line}`);
    slide!.innerHTML = html;
  }
}

function slide(direction: string, line: number, content: string) {
  const container = document.querySelector('.lines-series');
  const newSlide = document.createElement('div');
  newSlide.classList.add('flex', `series_${line}`, `enter-${direction}`);
  newSlide.innerHTML = content;
  const oldSlide = document!.querySelector(`.series_${line}`);
  oldSlide!.classList.add(`leave-${direction === 'right' ? 'left' : 'right'}`);

  oldSlide!.addEventListener('animationend', () => {
    oldSlide!.remove();
  }, { once: true });
  container!.insertBefore(newSlide, container!.children[line]);
  updateTopPositions();
}

window.closePopupSerie = closePopupSerie;
window.selectSerie = selectSerie;
window.switchSeriesTabFilters = switchSeriesTabFilters;
window.navigate = navigate;
window.genreSelected = genreSelected;
window.directorSelectedForSerie = directorSelectedForSerie;
window.actorSelectedForSerie = actorSelectedForSerie;
window.actorChange = actorChange;
window.directorChange = directorChange;
window.switchMode = switchMode;
window.moreActors = moreActors;
window.moreDirectors = moreDirectors;

function updateTopPositions() {
  const viewportWidth = window.innerWidth;

  const series2 = document.querySelector('.series_2') as HTMLElement;
  const series3 = document.querySelector('.series_3') as HTMLElement;

  if (series2 && series3) {
      series2.style.top = `${viewportWidth * 0.12}px`;
      series3.style.top = `${viewportWidth * 0.25}px`;
  }
}

// Appelle la fonction au chargement et au redimensionnement
window.addEventListener('load', updateTopPositions);
window.addEventListener('resize', updateTopPositions);
