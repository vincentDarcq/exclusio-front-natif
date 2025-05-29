var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { debounce, disableArrow, enableArrow, loaderLeft, loaderRight, searchSerieInGlobal } from "../index.js";
import { API_URL } from "../index.js";
let allSeries = [];
let allActors = [];
let allDirectors = [];
let genresToFilter = [];
let actorsToFilter = [];
let directorsToFilter = [];
let filterMode = "exclusion";
let indexFilterActors = 0;
let indexFilterDirectors = 0;
let directorsElements = document.querySelector('.directors-series');
let actorsElements = document.querySelector('.actors-series');
const caroussels = document.querySelectorAll('.carousels');
const carouselSerie = caroussels[1];
const loader = document.createElement('i');
loader.classList.add('fa', 'fa-2x', 'fa-spinner', 'spinner', 'margin-auto');
const arrowDownActor = document.createElement('span');
arrowDownActor.classList.add('fa', 'fa-2x', 'fa-arrow-circle-down');
const arrowDownReal = document.createElement('span');
arrowDownReal.classList.add('fa', 'fa-2x', 'fa-arrow-circle-down');
const arrowLeft = document.querySelector('.arrow-left-serie');
const arrowRight = document.querySelector('.arrow-right-serie');
switchSeriesTabFilters('genres');
fetchActorsSerie();
fetchDirectorsSerie();
fetchSeries(0);
export function switchModeSerie() {
    filterMode = filterMode === "exclusion" ? "inclusion" : "exclusion";
    const button = document.querySelector('.filter-mode-serie');
    button.innerHTML = `Passer en mode ${filterMode === "exclusion" ? "inclusion" : "exclusion"}`;
    const genresTab = document.querySelector('.tab-genres-series');
    const directorsTab = document.querySelector('.tab-directors-series');
    const actorsTab = document.querySelector('.tab-actors-series');
    const modeForTab = `${filterMode.charAt(0).toUpperCase()}${filterMode.substring(1)}`;
    genresTab.innerHTML = `${modeForTab} des genres`;
    directorsTab.innerHTML = `${modeForTab} des réalisateurs`;
    actorsTab.innerHTML = `${modeForTab} des acteurs`;
}
export function switchSeriesTabFilters(tab) {
    return __awaiter(this, void 0, void 0, function* () {
        indexFilterActors = 0;
        indexFilterDirectors = 0;
        ['genres', 'directors', 'actors'].filter(t => t !== tab).forEach(tab => {
            const tabEl = document.querySelector(`.tab-${tab}-series`);
            tabEl.classList.remove('active');
            const exclusionEl = document.querySelector(`.${tab}-series`);
            exclusionEl.style.display = 'none';
        });
        const exclusionsTab = document.querySelector(`.tab-${tab}-series`);
        exclusionsTab.classList.add('active');
        const exclusions = document.querySelector(`.${tab}-series`);
        exclusions.style.display = 'flex';
        if (tab !== 'genres')
            yield fillFiltersSeries(tab, document.querySelector(`.list-${tab}-series`));
    });
}
function fillFiltersSeries(tab, element, elementsSearched) {
    return __awaiter(this, void 0, void 0, function* () {
        let html;
        switch (tab) {
            case 'actors':
                actorsElements.replaceChild(loader, actorsElements.children[2]);
                const actorFiltered = yield Promise.all(actorsToFilter.map((actor) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('actor', actor, true); })));
                html = yield Promise.all(elementsSearched ?
                    elementsSearched.filter(a => !actorsToFilter.includes(a)).slice(0, 27).map((actor) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('actor', actor); })) : allActors.filter(a => !actorsToFilter.includes(a)).slice(0, 27).map((actor) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('actor', actor); })));
                element.innerHTML = `${actorFiltered.join('')}${html.join('')}`;
                arrowDownActor.onclick = moreActors;
                actorsElements.replaceChild(arrowDownActor, actorsElements.children[2]);
                break;
            case 'directors':
                directorsElements.replaceChild(loader, directorsElements.children[2]);
                const directorFiltered = yield Promise.all(directorsToFilter.map((director) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('director', director, true); })));
                html = yield Promise.all(elementsSearched ?
                    elementsSearched.filter(d => !directorsToFilter.includes(d)).slice(0, 27).map((director) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('director', director); })) : allDirectors.filter(d => !directorsToFilter.includes(d)).slice(0, 27).map((director) => __awaiter(this, void 0, void 0, function* () { return getPersonElement('director', director); })));
                element.innerHTML = `${directorFiltered.join('')}${html.join('')}`;
                arrowDownReal.onclick = moreDirectors;
                directorsElements.replaceChild(arrowDownReal, directorsElements.children[2]);
        }
    });
}
function getPersonElement(type_1, person_1) {
    return __awaiter(this, arguments, void 0, function* (type, person, filter = false) {
        const selector = person.replace(/\s+/g, '');
        const i = type === 'actor' ? actorsToFilter.findIndex(a => a === person) : directorsToFilter.findIndex(a => a === person);
        ;
        const picture = yield fetchPersonPicture(person);
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
  `;
    });
}
function moreActors() {
    return __awaiter(this, void 0, void 0, function* () {
        indexFilterActors += 28;
        actorsElements.replaceChild(loader, actorsElements.children[2]);
        const actors = document.querySelector(`.list-actors`);
        const html = yield Promise.all(allActors.slice(indexFilterActors, indexFilterActors + 27).map((actor) => __awaiter(this, void 0, void 0, function* () {
            const selector = actor.replace(/\s+/g, '');
            const i = actorsToFilter.findIndex(a => a === actor);
            const picture = yield fetchPersonPicture(actor);
            return `
          <div class="element flex-column" id="${selector}" onclick="actorSelectedForSerie('${selector}')">
            ${picture ? `<img src="${picture}" alt="actor">` : ''}
            <span class="${selector} ${i !== -1 ? 'element-selected' : ''}">${actor}</span>
          </div>
        `;
        })));
        actors.innerHTML = `${actors.innerHTML}${html.join('')}`;
        actorsElements.replaceChild(arrowDownActor, actorsElements.children[2]);
    });
}
function moreDirectors() {
    return __awaiter(this, void 0, void 0, function* () {
        indexFilterDirectors += 28;
        directorsElements.replaceChild(loader, directorsElements.children[2]);
        const actors = document.querySelector(`.list-directors`);
        const html = yield Promise.all(allDirectors.slice(indexFilterDirectors, indexFilterDirectors + 27).map((director) => __awaiter(this, void 0, void 0, function* () {
            const selector = director.replace(/\s+/g, '');
            const i = directorsToFilter.findIndex(a => a === director);
            const picture = yield fetchPersonPicture(director);
            return `
          <div class="element flex-column">
            ${picture ? `<img src= "${picture}" alt = "director" >` : ''}
            <span class="${selector} ${i !== -1 ? 'element-selected' : ''}">${director}</span>
          </div>
        `;
        })));
        actors.innerHTML = `${actors.innerHTML}${html.join('')}`;
        directorsElements.replaceChild(arrowDownReal, directorsElements.children[2]);
    });
}
function fetchPersonPicture(person) {
    return __awaiter(this, void 0, void 0, function* () {
        const stringPerson = person.replace(' ', '%20');
        const searchPerson = yield fetch(`${API_URL}/allo/${stringPerson}`);
        const resultPerson = yield searchPerson.json();
        return resultPerson[0].data.thumbnail;
    });
}
function searchActor() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = document.querySelector('input.searchActor');
        const actors = allActors.filter(actor => actor.toLowerCase().includes(input.value.toLowerCase()));
        yield fillFiltersSeries('actors', document.querySelector('.list-actors'), actors);
    });
}
function searchDirector() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = document.querySelector('input.searchDirector');
        const directors = allDirectors.filter(director => director.toLowerCase().includes(input.value.toLowerCase()));
        yield fillFiltersSeries('directors', document.querySelector('.list-directors'), directors);
    });
}
export const actorSerieChange = debounce(() => searchActor());
export const directorSerieChange = debounce(() => searchDirector());
export function genreSelectedForSerie(checkbox) {
    const element = document.querySelector(`.serie-${checkbox.value}`);
    if (checkbox.checked) {
        element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
    }
    else {
        element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
    }
    if (checkbox.checked) {
        genresToFilter.push(checkbox.value);
    }
    else {
        genresToFilter.splice(genresToFilter.findIndex(g => g === checkbox.value), 1);
    }
    fetchSeries(0);
}
export function actorSelectedForSerie(actor) {
    const indexActor = allActors.map(a => a.replace(/\s+/g, '')).findIndex(a => a === actor);
    const element = document.querySelector(`.${actor}`);
    const actorChecked = actorsToFilter.map(a => a.replace(/\s+/g, '')).includes(actor);
    if (actorChecked) {
        element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
        actorsToFilter.splice(actorsToFilter.findIndex(a => a === allActors[indexActor]), 1);
    }
    else {
        element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
        actorsToFilter.push(allActors[indexActor]);
    }
    fetchSeries(0);
}
export function directorSelectedForSerie(director) {
    const indexDirector = allDirectors.map(d => d.replace(/\s+/g, '')).findIndex(d => d === director);
    const element = document.querySelector(`.${director}`);
    const actorChecked = directorsToFilter.map(a => a.replace(/\s+/g, '')).includes(director);
    if (actorChecked) {
        element.classList.remove(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
        directorsToFilter.splice(directorsToFilter.findIndex(d => d === allDirectors[indexDirector]), 1);
    }
    else {
        element.classList.add(`${filterMode === "exclusion" ? 'exclude' : 'include'}`);
        directorsToFilter.push(allDirectors[indexDirector]);
    }
    fetchSeries(0);
}
export function selectSerie(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let serie = allSeries.find(serie => serie.id === parseInt(id));
        if (!serie)
            serie = searchSerieInGlobal(id);
        const popup = document.querySelector('.serie-popup');
        const emptyCov = serie === null || serie === void 0 ? void 0 : serie.covPortrait.indexOf('empty');
        popup.innerHTML = `
    <div class="flex header">
      <h2 class="serie-title">${serie === null || serie === void 0 ? void 0 : serie.titre}</h2>
      <div class="cross" onClick="closePopupSerie()">X</div>
    </div>
    <div class="flex infos">
      <div class="flex-column">
        <h4>Genres : ${serie === null || serie === void 0 ? void 0 : serie.genre}</h4>
        <h4>Casting : ${serie === null || serie === void 0 ? void 0 : serie.casting}</h4>
        <h4>Réalisateur: ${serie === null || serie === void 0 ? void 0 : serie.realisateur}</h4>
        <h4>Episodes: ${serie === null || serie === void 0 ? void 0 : serie.episodes}</h4>
        <h4>Saisons: ${serie === null || serie === void 0 ? void 0 : serie.seasons}</h4>
        <h4>${serie === null || serie === void 0 ? void 0 : serie.year}</h4>
      </div>
      ${emptyCov === -1 ? `<img src="${serie === null || serie === void 0 ? void 0 : serie.covPortrait}" alt="cov" >` : ''}
    </div>
    ${(serie === null || serie === void 0 ? void 0 : serie.synopsis) ? `<p>${serie === null || serie === void 0 ? void 0 : serie.synopsis} </p>` : ''}
    <div class="flex notes">
      ${(serie === null || serie === void 0 ? void 0 : serie.alloGrade) ? `<span>Note allociné: ${serie === null || serie === void 0 ? void 0 : serie.alloGrade}/5</span >` : ''}
    </div>
  `;
        popup.style.display = 'block';
    });
}
export function closePopupSerie() {
    const popup = document.querySelector('.serie-popup');
    popup.style.display = 'none';
}
function fetchActorsSerie() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield fetch(`${API_URL}/series/acteurs`);
        const content = yield result.json();
        allActors = content;
    });
}
function fetchDirectorsSerie() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield fetch(`${API_URL}/series/realisateurs`);
        const content = yield result.json();
        allDirectors = content;
    });
}
export function navigate(direction, page) {
    return __awaiter(this, void 0, void 0, function* () {
        fetchSeries(page, direction);
    });
}
function fetchSeries(page, direction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (direction)
            carouselSerie.replaceChild(direction === 'right' ? loaderRight : loaderLeft, carouselSerie.children[direction === 'right' ? 2 : 0]);
        const result = yield fetch(`${API_URL}/series/${filterMode === "exclusion" ? 'exclusions' : 'inclusions'}/${page}`, {
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
        const content = yield result.json();
        const series = content.content;
        if (content.last) {
            disableArrow(arrowRight);
        }
        else {
            enableArrow(arrowRight, () => __awaiter(this, void 0, void 0, function* () {
                yield navigate('right', page + 1);
            }));
        }
        if (page > 0) {
            enableArrow(arrowLeft, () => __awaiter(this, void 0, void 0, function* () {
                yield navigate('left', page - 1);
            }));
        }
        else {
            disableArrow(arrowLeft);
        }
        fillLine(series.slice(0, 8), 1, direction);
        fillLine(series.slice(8, 16), 2, direction);
        fillLine(series.slice(16), 3, direction);
        if (direction)
            carouselSerie.replaceChild(direction === 'right' ? arrowRight : arrowLeft, carouselSerie.children[direction === 'right' ? 2 : 0]);
    });
}
function fillLine(series, line, direction) {
    let html = '';
    series.forEach(serie => {
        if (allSeries.findIndex(m => m.id === serie.id) === -1) {
            allSeries.push(serie);
        }
        const emptyCov = serie.covPortrait.indexOf('empty');
        html += `
        ${emptyCov === -1 ? `<img class="img-serie" src="${serie.covPortrait}" alt="${serie.titre}" onclick="selectSerie(${serie.id})" >`
            : `<span class="titre-no-cov" onclick="selectSerie(${serie.id})">${serie.titre}</span>`}
      `;
    });
    if (direction) {
        slide(direction, line, html);
    }
    else {
        const slide = document.querySelector(`.series_${line}`);
        slide.innerHTML = html;
    }
}
function slide(direction, line, content) {
    const container = document.querySelector('.lines-series');
    const newSlide = document.createElement('div');
    newSlide.classList.add('flex', `series_${line}`, `enter-${direction}`);
    newSlide.innerHTML = content;
    const oldSlide = document.querySelector(`.series_${line}`);
    oldSlide.classList.add(`leave-${direction === 'right' ? 'left' : 'right'}`);
    oldSlide.addEventListener('animationend', () => {
        oldSlide.remove();
    }, { once: true });
    container.insertBefore(newSlide, container.children[line]);
    updateTopPositions();
}
window.closePopupSerie = closePopupSerie;
window.selectSerie = selectSerie;
window.switchSeriesTabFilters = switchSeriesTabFilters;
window.navigate = navigate;
window.genreSelectedForSerie = genreSelectedForSerie;
window.directorSelectedForSerie = directorSelectedForSerie;
window.actorSelectedForSerie = actorSelectedForSerie;
window.actorSerieChange = actorSerieChange;
window.directorSerieChange = directorSerieChange;
window.switchModeSerie = switchModeSerie;
window.moreActors = moreActors;
window.moreDirectors = moreDirectors;
function updateTopPositions() {
    const viewportWidth = window.innerWidth;
    const series2 = document.querySelector('.series_2');
    const series3 = document.querySelector('.series_3');
    if (series2 && series3) {
        series2.style.top = `${viewportWidth * 0.12}px`;
        series3.style.top = `${viewportWidth * 0.25}px`;
    }
}
// Appelle la fonction au chargement et au redimensionnement
window.addEventListener('load', updateTopPositions);
window.addEventListener('resize', updateTopPositions);
