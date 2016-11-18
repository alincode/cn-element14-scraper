'use strict';

/* global require */

var Developer = require('./dist/product.js').default;

var developer = new Developer('http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259');

developer.getResult().then(result => console.log(result))
