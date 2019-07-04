api-ecommerce for react native

We used in react native app
[climate-url]: http://mstore.io/

## Install

```
yarn add api-ecommerce
```

## Quick Start

```js
import { WooWorker } from "api-ecommerce"

componentDidMount() {
    WooWorker.init({
        url: "http://mstore.io",
        consumerKey: "ck_b7594bc4391db4b56c635fe6da1072a53ca4xxxx",
        consumerSecret: "cs_980b9edb120e15bd2a8b668cacc734f7ecaxxxx",
        wpAPI: true,
        version: "wc/v2",
        queryStringAuth: true,
    });
}

handleWooWorker = async () => {
    json = await WooWorker.getPayments();

    if (json === undefined) {
        console.log("fail");
    } else if (json.code) {
        console.log("fail");
    } else {
        console.log("success", json)
    }
}
```
