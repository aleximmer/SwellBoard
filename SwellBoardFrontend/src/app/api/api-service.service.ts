import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  api_url = "https://localhost:5001"

  constructor(private httpClient: HttpClient) {
  }

  dummyGet() {
    return this.httpClient.get('https://jsonplaceholder.typicode.com/todos/1');
  }

  getModels() {
    return this.httpClient.get("${this.api_url}/models")
  }

  getRuns(model_name) {
    return this.httpClient.get("${this.api_url}/runs?model_name=${model_name}")
  }

  getMetricNames(run_id) {
    return this.httpClient.get("${this.api_url}/metrics/names?run_id=${run_id}")
  }

  getMetricScalars(run_id, metric_name) {
    return this.httpClient.get("${this.api_url}/metrics/scalars?run_id=${run_id}&metric_name=${metric_name}")
  }

  getResultNames(run_id) {
    return this.httpClient.get("${this.api_url}/results/names?run_id=${run_id}")
  }

  getResultScalars(run_id, result_name) {
    return this.httpClient.get("${this.api_url}/results/scalars?run_id=${run_id}&result_name=${result_name}")
  }

  getParameterNames(run_id) {
    return this.httpClient.get("${this.api_url}/params/names?run_id=${run_id}")
  }

  getParameterScalars(run_id, param_name) {
    return this.httpClient.get("${this.api_url}/params/scalars?run_id=${run_id}&param_name=${param_name}")
  }
}
