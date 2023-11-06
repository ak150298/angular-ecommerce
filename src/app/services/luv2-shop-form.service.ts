import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { map } from 'rxjs/operators';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesurl = 'http://localhost:7070/api/countries';
  private statesUrl = 'http://localhost:7070/api/states';


  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{
    
    return this.httpClient.get<GetResponseCountries>(this.countriesurl).pipe(
       map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: String): Observable<State[]>{
    // search url
    const searchUrl =`${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchUrl).pipe(
      map(response => response._embedded.states)
   );

  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    // build an array for month drop down list
    // start at current month and loop until
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    // build an array for year drop down list
    //start at current year and loop for next 10 years
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}  

  interface GetResponseStates {
    _embedded: {
      states: State[];
    }
}
