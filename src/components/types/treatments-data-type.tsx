
export interface TreatmentCategory {
  _id: string;
  name: string;
  image: string;
}

export interface Treatment {
  _id: string;
  serviceName: string;
  description: string;
  image: string;
  cloudinaryId: string;
  category: TreatmentCategory;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTreatments: number;
  itemsPerPage: number;
}

export interface TreatmentsResponse {
  status: boolean;
  message: string;
  data: Treatment[];
  pagination: Pagination;
}
