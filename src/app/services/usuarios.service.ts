import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import {catchError, map, tap} from 'rxjs/operators';
import { Router } from '@angular/router';

import { RegisterForm } from '../interfaces/register-forms.interface';
import { LoginForm } from '../interfaces/login-forms.interface';
import { Observable, of } from 'rxjs';

const base_url = environment.base_url;

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  public auth2: any;

  constructor(private http: HttpClient,
              private router: Router,
              private ngZone: NgZone) {
    this.googleInit();
  }

  
  googleInit(){

    return new Promise<void>(resolve =>{
        gapi.load('auth2', ()=>{
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        this.auth2 = gapi.auth2.init({
          client_id: '301132831145-e26sjfmvo45ge5smk8emevit0tde8ckd.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
          // Request scopes in addition to 'profile' and 'email'
          //scope: 'additional_scope'
        });
        resolve();
      });
    })

  }

  logout(){
    localStorage.removeItem('token');
    
    this.auth2.signOut().then( ()=> {
      this.ngZone.run(()=>{
        this.router.navigateByUrl('/login');
      });
    });

  }


  validarToken(): Observable<boolean>{
    const token = localStorage.getItem('token') || '';
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }
    }).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token);
      }),
      map(resp => true),
      catchError(error => of(false))
    );
  }


  crearUsuario(formData: RegisterForm){
    return this.http.post(`${base_url}/usuarios`,formData)
            .pipe(
              tap((resp:any) =>{
                localStorage.setItem('token', resp.token)
              })
            )
  }
  
  login(formData: LoginForm){
    return this.http.post(`${base_url}/login`,formData)
            .pipe(
              tap((resp:any) =>{
                localStorage.setItem('token', resp.token)
              })
            )
  }
  
  loginGoogle(token:string){
    return this.http.post(`${base_url}/login/google`,{token})
            .pipe(
              tap((resp:any) =>{
                localStorage.setItem('token', resp.token)
              })
            )
  }

  

}
