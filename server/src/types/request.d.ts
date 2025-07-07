import { AxiosResponse } from "axios";

export interface ApiResponse<T> extends Partial<AxiosResponse<T>> {
  success: boolean;
  message?: string;
}