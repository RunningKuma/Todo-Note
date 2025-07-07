import { AxiosResponse } from "axios";

export interface ApiResponse<T> extends Partial<AxiosResponse> {
  success: boolean;
  message?: string;
}