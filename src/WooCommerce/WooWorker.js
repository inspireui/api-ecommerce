/**
 * Created by InspireUI on 4/07/2018.
 *  luyxtran264@gmail.com
 * @format
 */

import WooCommerceAPI from "./WooCommerceAPI";

export default class WooWorker {
  _api = null;

  static init = ({
    url,
    consumerKey,
    consumerSecret,
    wp_api = true,
    version = "wc/v2",
    queryStringAuth = true,
    language,
  }) => {
    try {
      this._api = new WooCommerceAPI({
        url,
        consumerKey,
        consumerSecret,
        wp_api,
        version,
        queryStringAuth,
        language,
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
        orderby: "count",
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getCustomerByEmail = async (email) => {
    try {
      const response = await this._api.get("customers", { email });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getCustomerById = async (id) => {
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
        purchasable: true,
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
  static reviewsByProductId = async (id) => {
    try {
      const response = await this._api.get(`products/${id}/reviews`);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static createOrder = async (data) => {
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
        page,
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productsByName = async (name, per_page, page, filter={}) => {
    try {
      const response = await this._api.get("products", {
        search: name,
        per_page,
        page,
        ...filter
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static productSticky = async (per_page, page, tagIdBanner = 273) => {
    try {
      const response = await this._api.get("products", {
        tag: tagIdBanner,
        per_page,
        page,
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getAllProducts = async (
    per_page,
    page,
    order = "desc",
    orderby = "date"
  ) => {
    try {
      const data = {
        per_page,
        page,
        order,
        orderby,
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
        page,
      };
      const response = await this._api.get("orders", data);
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static createNewOrder = async (data, callback, failCallBack) => {
    try {
      const response = await this._api.post("orders", data);
      const json = await response.json();

      if (json.code === undefined) {
        callback(json);
      } else {
        typeof failCallBack === "function" && failCallBack();
      }
    } catch (error) {
      console.log(error);
    }
  };
  static getPayments = async () => {
    try {
      const response = await this._api.get("payment_gateways");
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static setOrderStatus = async (orderId, status, callback) => {
    try {
      const response = await this._api.post(`orders/${orderId}`, { status });
      const json = await response.json();
      if (json.code === undefined) {
        callback(JSON.stringify(json.code));
      } else {
        console.log(json);
      }
    } catch (error) {
      console.log(error);
    }
  };
  static productVariant = async (product, per_page, page) => {
    try {
      const data = {
        per_page,
        page,
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
  static getProductRelated = async (product) => {
    try {
      const data = {
        include: [product],
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
  static getShippingMethod = async zoneId => {
    zoneId = zoneId || 1;
    try {
      const response = await this._api.get("shipping/zones/" + zoneId + "/methods");
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };
  static getProductId = async productId => {
    try {
      const response = await this._api.get('products/' + productId)
      return await response.json()
    } catch (err) {
      console.log(err)
    }
  };

  static setBookingID = (orderId, bookID, callback) => {
    try {
      this._api.post('orders/' + orderId, { 'Booking ID': bookID })
        .then(json => {
          if (json.code === undefined) callback(json)
          else {
            alert(JSON.stringify(json.code))
            // console.log(JSON.stringify(json))
          }
        })
        .catch(error => console.log(error))
    } catch (err) {
      console.log(err)
    }
  };

  static getTags = async () => {
    try {
      const response = await this._api.get("products/tags", {
        hide_empty: true,
        per_page: 100,
        order: "desc",
        orderby: "count",
      });
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };

}
