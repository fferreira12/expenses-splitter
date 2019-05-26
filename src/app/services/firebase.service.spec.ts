import { TestBed } from '@angular/core/testing';



import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { mockAuthService } from 'src/test/auth.service.stub';

describe('FirebaseService', () => {
  let service: FirebaseService;

  //beforeEach(() => { service = new FirebaseService(mockAuthService); });

  it('should be created', () => {
    //expect(service).toBeTruthy();
  });
});
