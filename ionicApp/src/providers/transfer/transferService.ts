import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { Api } from '../api/api';

import {Transaction} from "../../app/interfaces/iTransaction";

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class TransferService {
  _transaction: Transaction;

  constructor(public api: Api) {
  }

  /**
   * Send a POST request to our  endpoint with the data
   * the user entered on the form.
   */
  transfer(transferInfo: any) {
    let seq = this.api.post('transaction', transferInfo).share();
    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status === "success") {

      } else {
      }
    }, err => {
      console.error('ERROR in transaction', err);
    });

    return seq;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */


}
