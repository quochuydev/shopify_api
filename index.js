const request = require('request');
const querystring = require('querystring');
const _ = require('lodash');
let config = {};

class ShopifyApi {
  constructor({ client_id, client_secret, shopify_host }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.shopify_host = shopify_host;
  }

  buildLink({ app_host, callback_path }) {
    let options = {}
    options.scopes = ['read_customers', 'write_customers', 'read_products', 'write_products', 'read_orders', 'write_orders'];
    const { scopes = [], accessMode } = options;

    const redirectParams = {
      state: 'nonce',
      scope: scopes.join(', '),
      client_id: this.client_id,
      redirect_uri: `${app_host}${callback_path}`,
    };
    if (accessMode === 'online') { redirectParams['grant_options[]'] = 'per-user'; }
    let query = querystring.stringify(redirectParams);
    let url = `${this.shopify_host}/admin/oauth/authorize?${query}`;
    return url;
  }

  getToken() {

  }

  call(f, p) {
    return new Promise((resolve, reject) => {
      try {
        let { method, url, resPath } = f;
        let { query, params, body, access_token } = p;
        url = `${this.shopify_host}/admin/${url}`;
        if (params) { url = compile(url, params) }

        let options = {
          method, url,
          headers: {
            'X-Shopify-Access-Token': access_token
          }
        }
        if (body) {

        }

        if (query) {

        }

        if (['post', 'put'].indexOf(method) != -1) {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(body);
        }

        request(options, (err, res, body) => {
          if (err) { return reject(err); }
          let data = JSON.parse(body);
          console.log(`[CALL] [${String(method).toUpperCase()}] ${url} - ${res.statusCode}`)
          if (resPath) { return resolve(_.get(data, resPath)) }
          resolve(data);
        });
      } catch (error) {
        console.log(error)
        reject(error);
      }
    })
  }
}

function compile(template, data) {
  let result = template.toString ? template.toString() : '';
  result = result.replace(/{.+?}/g, function (matcher) {
    var path = matcher.slice(1, -1).trim();
    return _.get(data, path, '');
  });
  return result;
}

module.exports = ShopifyApi;