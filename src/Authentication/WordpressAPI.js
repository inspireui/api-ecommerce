const data = await this.getNonce();
if (typeof data.status != "undefined" && data.status == "ok") {
  const nonce = data.nonce;
  const requestUrl =
    this.url +
    "/api/user/generate_auth_cookie/?insecure=cool&nonce=" +
    nonce +
    "&username=" +
    $email +
    "&password=" +
    $password;

  // console.log('user login', requestUrl);

  return this._request(requestUrl);
}
};

WordpressAPI.prototype.register = async function($email, $password, $name) {
const data = await this.getNonceRegister();

if (typeof data.status != "undefined" && data.status == "ok") {
  const nonce = data.nonce;

  const requestUrl =
    this.url +
    "/api/user/register/?insecure=cool&nonce=" +
    nonce +
    "&email=" +
    $email +
    "&username=" +
    $email +
    "&display_name=" +
    $name +
    "&password=" +
    $password;

  // console.log('user register', requestUrl);

  return this._request(requestUrl);
}
};

export default WordpressAPI;