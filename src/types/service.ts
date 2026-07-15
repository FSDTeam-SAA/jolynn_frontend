export type Service = {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  logo: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ServicesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Service[];
};
