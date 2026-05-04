export const LIST_PAGE_SIZE = 6;

export interface ListSummary {
  id: string;
  shareCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface PaginatedListPage<T extends ListSummary = ListSummary> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}
