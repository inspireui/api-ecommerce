/**
 * Created by InspireUI on 4/07/2018.
 *  luyxtran264@gmail.com
 * @format
 */

import OAuth from "oauth-1.0a";
import CryptoJS from 'crypto-js';

function WooCommerceAPI(opt) {
  if (!(this instanceof WooCommerceAPI)) {
    return new WooCommerceAPI(opt);
  }

  let newOpt = opt || {};

  if (!newOpt.url) {
    throw new Error("url is required");
  }
  if (!newOpt.consumerKey) {
    throw new Error("consumerKey is required");
  }
  if (!newOpt.consumerSecret) {
    throw new Error("consumerSecret is required");
  }

  this._setDefaultsOptions(newOpt);
}

WooCommerceAPI.prototype._setDefaultsOptions = function(opt) {
  this.url = opt.url;
  this.wpAPI = opt.wpAPI || false;
  this.wpAPIPrefix = opt.wpAPIPrefix || "wp-json";
  this.version = opt.version || "v3";
  this.isSsl = /^https/i.test(this.url);
  this.consumerKey = opt.consumerKey;
  this.consumerSecret = opt.consumerSecret;
  this.verifySsl = opt.verifySsl;
  this.encoding = opt.encoding || "utf8";
  this.queryStringAuth = opt.queryStringAuth || true;
  this.port = opt.port || "";
  this.timeout = opt.timeout || 10;
  this.language = opt.language || "en";
};

WooCommerceAPI.prototype._normalizeQueryString = function(url) {
  // Exit if don't find query string
  if (url.indexOf("?") === -1) return url;

  // let query       = _url.parse(url, true).query;
  const query = url;
  const params = [];
  let queryString = "";

  for (const p in query) params.push(p);
  params.sort();

  for (const i in params) {
    if (queryString.length) queryString += "&";

    queryString += encodeURIComponent(params[i])
      .replace("%5B", "[")
      .replace("%5D", "]");
    queryString += "=";
    queryString += encodeURIComponent(query[params[i]]);
  }

  return `${url.split("?")[0]}?${queryString}`;
};

WooCommerceAPI.prototype._getUrl = function(endpoint, version) {
  let url = this.url.slice(-1) === "/" ? this.url : `${this.url}/`;
  const api = this.wpAPI ? `${this.wpAPIPrefix}/` : "wp-json/";
  this.version = version ? version : "wc/v3";

  url = `${url + api + this.version}/${endpoint}/`;

  // Include port.
  if (this.port !== "") {
    const hostname = url; // _url.parse(url, true).hostname;
    url = url.replace(hostname, `${hostname}:${this.port}`);
  }

  if (!this.isSsl) return this._normalizeQueryString(url);

  return url;
};

WooCommerceAPI.prototype._getOAuth = function() {
  const data = {
    consumer: {
      key: this.consumerKey,
      secret: this.consumerSecret
    },
    signature_method: 'HMAC-SHA256',
    hash_function: function(base_string, key) {
      return CryptoJS.HmacSHA256(base_string, key).toString(CryptoJS.enc.Base64);
    }
  };

  if (["v1", "v2"].indexOf(this.version) > -1) data.last_ampersand = false;

  return new OAuth(data);
};

WooCommerceAPI.prototype.join = function(obj, separator) {
  const arr = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(`${key}=${obj[key]}`);
    }
  }
  return arr.join(separator);
};

WooCommerceAPI.prototype._request = async function(method, endpoint, newData, version=null) {
  const url = this._getUrl(endpoint, version);
  let data = {
    ...newData,
    lang: this.language,
  };
  const params = {
    url,
    method,
    encoding: this.encoding,
    timeout: this.timeout,
  };

  if (this.isSsl) {
    if (this.queryStringAuth) {
      params.qs = {
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        ...data,
      };
    } else {
      params.auth = {
        user: this.consumerKey,
        pass: this.consumerSecret,
      };
    }

    if (this.verifySsl) {
      params.strictSSL = this.verifySsl;
    }
  } else if (method == "GET" || method == 'DELETE') {
    params.qs = this._getOAuth().authorize({
      url,
      method,
      data,
    });
  } else if (method == "POST") {
    params.qs = this._getOAuth().authorize({
      url,
      method,
    });
  }

  // encode the oauth_signature to make sure it not remove + charactor
  params.qs.oauth_signature = encodeURIComponent(params.qs.oauth_signature);
  params.url = `${params.url}?${this.join(params.qs, "&")}`;

  if (method == "GET") {
    params.headers = { "Cache-Control": "no-cache" };
  } else if (method == "POST") {
    params.headers = {
      Accept: "application/json",
      'Cache-Control': 'no-cache',
      "Content-Type": "application/json",
    };
    params.body = JSON.stringify(data);
  }

  console.log(params.url);

  return await fetch(params.url, params)
        .catch((error, data) => {
            console.log('error network -', error, data);
        }
      );
};

WooCommerceAPI.prototype.get = async function(endpoint, data, version) {
  return await this._request("GET", endpoint, data, version);
};

WooCommerceAPI.prototype.post = async function(endpoint, data, callback) {
  return await this._request("POST", endpoint, data, callback);
};

WooCommerceAPI.prototype.put = async function(endpoint, data, callback) {
  return await this._request("PUT", endpoint, data, callback);
};

WooCommerceAPI.prototype.delete = async function(endpoint, callback) {
  return await this._request("DELETE", endpoint, null, callback);
};

WooCommerceAPI.prototype.options = async function(endpoint, callback) {
  return await this._request("OPTIONS", endpoint, null, callback);
};

export default WooCommerceAPI;
