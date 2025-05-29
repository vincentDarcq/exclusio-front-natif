export type PageResult = {
    content: Array<any>;
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: { sort: number, offset: number, pageNumber: number, pageSize: number, paged: boolean, unpaged: boolean };
    size: number;
    sort: { empty: boolean, unsorted: boolean, sorted: boolean };
    totalElements: number;
    totalPages: number;
}