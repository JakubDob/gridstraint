import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { concatMap, Observable, Subscriber } from 'rxjs';
import {
  SerializedSolverModel,
  SolvedProblem,
  SolverOutput,
} from 'src/app/interfaces/solver-model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SolverAPIService {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  private apiBase = `${environment.apiUrl}/api`;

  connect() {
    return this.http.get(`${this.apiBase}/session`).pipe(
      concatMap(() => {
        return new Observable<SolvedProblem>(
          (observer: Subscriber<SolvedProblem>) => {
            const source = new EventSource(`${this.apiBase}/connect`, {
              withCredentials: true,
            });
            source.onmessage = (event) => {
              this.ngZone.run(() => {
                const result = JSON.parse(event.data) as SolverOutput;
                const solvedProblem: SolvedProblem = {
                  id: result.problemId,
                  name: `${result.problemName} ${result.status} (${result.results?.length})`,
                  solutions: [],
                };
                result.results?.forEach((values) => {
                  solvedProblem.solutions.push({
                    name: 'Solution',
                    parent: solvedProblem,
                    values: values,
                  });
                });
                observer.next(solvedProblem);
              });
            };
            source.onerror = (error) => {
              this.ngZone.run(() => {
                source.close();
                observer.complete();
              });
            };
          }
        );
      })
    );
  }

  sendModel(model: SerializedSolverModel) {
    return this.http.post(`${this.apiBase}/model`, model, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
}
