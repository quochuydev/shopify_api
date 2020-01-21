let express = require('express');
let path = require('path');
let request = require('request');
let app = express();
let querystring = require('querystring');
let ShopifyApi = require('./index');
config = {
  app_host: 'https://36e30315.ngrok.io',
  shopify: {
    shopify_host: 'https://quochuydev1.myshopify.com',
    client_id: "c925250ee1a5f062f01b3c88e508e209",
    client_secret: "1f44c251898c86a09618d5076b6b1b67",
    callback_path: '/shopify/auth/callback',
    address: 'https://36e30315.ngrok.io/shopify/webhook',
  }
}
// const config = require(path.resolve('./src/config/config'));
const { app_host, shopify } = config;
const { shopify_host, client_id, client_secret, callback_path, address } = shopify;

let SHOPIFY = {};
SHOPIFY.WEBHOOKS = {
  LIST: {
    method: 'get',
    url: 'webhooks.json',
    resPath: 'webhooks'
  },
  CREATE: {
    method: 'post',
    url: 'webhooks.json'
  },
  UPDATE: {
    method: 'put',
    url: 'webhooks/{id}.json'
  }
}

SHOPIFY.ORDERS = {
  LIST: {
    method: 'get',
    url: 'orders.json'
  }
}

let listWebhooks = [
  { topic: 'app/uninstalled', address },
  { topic: 'shop/update', address },

  { topic: 'products/create', address },
  { topic: 'products/delete', address },
  { topic: 'products/update', address },

  { topic: 'order_transactions/create', address },
  { topic: 'orders/cancelled', address },
  { topic: 'orders/create', address },
  { topic: 'orders/delete', address },
  { topic: 'orders/edited', address },
  { topic: 'orders/fulfilled', address },
  { topic: 'orders/paid', address },
  { topic: 'orders/partially_fulfilled', address },
  { topic: 'orders/updated', address },

  { topic: 'fulfillment_events/create', address },
  { topic: 'fulfillment_events/delete', address },
  { topic: 'fulfillments/create', address },
  { topic: 'fulfillments/update', address },
]

app.get('/shopify/auth/callback', async (req, res) => {
  let { code } = req.query;
  let data = { client_id, client_secret, code }
  let option = {
    method: 'post',
    url: `${shopify_host}/admin/oauth/access_token`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }
  request(option, async (err, response, body) => {
    let { access_token } = JSON.parse(body);
    let API = new ShopifyApi({ shopify_host });
    let webhooks = await API.call(SHOPIFY.WEBHOOKS.LIST, { access_token });
    for (let i = 0; i < listWebhooks.length; i++) {
      let webhook = listWebhooks[i];
      let found = webhooks.find(e => e.topic == webhook.topic);
      if (found) {
        await API.call(SHOPIFY.WEBHOOKS.UPDATE, { access_token, params: { id: found.id }, body: { webhook: { ...webhook } } });
      } else {
        await API.call(SHOPIFY.WEBHOOKS.CREATE, { access_token, body: { webhook: { ...webhook } } });
      }
    }
    let orders = await API.call(SHOPIFY.ORDERS.LIST, { access_token });
    console.log(orders)
  })
  res.json({ error: false });
});

app.listen(3000)

let test = async () => {
  let API = new ShopifyApi({ client_id, shopify_host });
  let url = API.buildLink({ app_host, callback_path });
  console.log(url)
  return url;
}
test();

// app/uninstalled, carts/create, carts/update, checkouts/create, checkouts/delete, checkouts/update, collection_listings/add, collection_listings/remove, collection_listings/update, collections/create, collections/delete, collections/update, customer_groups/create, customer_groups/delete, customer_groups/update, 
// customers/create, customers/delete, customers/disable, customers/enable, customers/update, 
// draft_orders/create, draft_orders/delete, draft_orders/update, 
// fulfillment_events/create, fulfillment_events/delete, fulfillments/create, fulfillments/update, 
// inventory_items/create, inventory_items/delete, inventory_items/update, inventory_levels/connect, inventory_levels/disconnect, inventory_levels/update, 
// locales/create, locales/update, locations/create, locations/delete, locations/update, 
// order_transactions/create, 
// orders/cancelled, orders/create, orders/delete, orders/edited, orders/fulfilled, orders/paid, orders/partially_fulfilled, orders/updated, 
// product_listings/add, product_listings/remove, product_listings/update, 
// products/create, products/delete, products/update, 
// refunds/create, shop/update, tender_transactions/create, themes/create, themes/delete, themes/publish, themes/update