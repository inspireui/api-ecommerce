/**
 * Created by InspireUI on 4/07/2018.
 *  luyxtran264@gmail.com
 * @format
 */

import { Constants } from "@common";
import WooCommerceAPI from "./WooCommerceAPI";

export default class WooWorker {
  _api = null;

  static init = ({
    url,
    consumerKey,
    consumerSecret,
    wp_api = true,
    version = "wc/v2",
    queryStringAuth = true
  }) => {
    try {
      this._api = new WooCommerceAPI({
        url,
        consumerKey,
        consumerSecret,
        wp_api,
        version,
        queryStringAuth
      });
    } catch (error) {
      console.log(error);
    }
  };
  static getCategories = async () => {
    try {
      const response = await this._api.get("products/categories", {
        hide_empty: true,
        per_page: 100,
        order: "desc",
        orderby: "count"
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getCustomerByEmail = async email => {
    try {
      const response = await this._api.get("customers", { email });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getCustomerById = async id => {
    try {
      const response = await this._api.get(`customers/${id}`);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productsByCategoryId = async (category, per_page, page) => {
    try {
      const response = await this._api.get("products", {
        category,
        per_page,
        page,
        purchasable: true
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productsByCategoryTag = async (category, tag, per_page, page) => {
    try {
      // only show product published
      let params = { per_page, page, purchasable: true, status: "publish" };
      if (category != "") {
        params = { ...params, category };
      } else {
        params = { ...params, tag };
      }
      const response = await this._api.get("products", params);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static reviewsByProductId = async id => {
    try {
      const response = await this._api.get(`products/${id}/reviews`);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static createOrder = async data => {
    try {
      const response = await this._api.post("orders", data);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productsByTagId = async (tagId, per_page, page) => {
    try {
      const response = await this._api.get("products", {
        tag: tagId,
        per_page,
        page
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productsByName = async (name, per_page, page) => {
    try {
      const response = await this._api.get("products", {
        search: name,
        per_page,
        page
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productSticky = async (per_page, page) => {
    try {
      const response = await this._api.get("products", {
        tag: Constants.tagIdBanner,
        per_page,
        page
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getAllProducts = async (per_page, page) => {
    try {
      const data = {
        per_page,
        page,
        order: Constants.PostList.order,
        orderby: Constants.PostList.orderby
      };
      const response = await this._api.get("products", data);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static ordersByCustomerId = async (id, per_page, page) => {
    try {
      const data = {
        customer: id,
        per_page,
        page
      };
      const response = await this._api.get("orders", data);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  createNewOrder = (data, callback, failCallBack) => {
    this._api
      .post("orders", data)
      .then(response => response.json())
      .then(json => {
        if (json.code === undefined) callback(json);
        else {
          // console.log(JSON.stringify(json))
          toast(JSON.stringify(json.message));
          typeof failCallBack === "function" && failCallBack();
        }
      })
      .catch();
  };
  static getPayments = async () => {
    try {
      const response = await this._api.get("payment_gateways");
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  setOrderStatus = (orderId, status, callback) => {
    this._api
      .post(`orders/${orderId}`, { status })
      .then(json => {
        if (json.code === undefined) callback(json);
        else {
          alert(JSON.stringify(json.code));
          // console.log(JSON.stringify(json))
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  static productVariant = async (product, per_page, page) => {
    try {
      const data = {
        per_page,
        page
      };
      const response = await this._api.get(
        `products/${product.id}/variations`,
        data
      );
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getProductRelated = async product => {
    try {
      const data = {
        include: [product]
      };
      const response = await this._api.get("products", data);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getAllCouponCode = async () => {
    try {
      const response = await this._api.get("coupons");
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getShippingMethod = async () => {
    try {
      const response = await this._api.get("shipping/zones/1/methods");
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
}
