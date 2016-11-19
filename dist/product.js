'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('./utils/request');
var memoize = require('./utils/memoize');
var cheerio = require('cheerio');
var R = require('ramda');
var htmlToText = require('html-to-text');


function getData(htmlString) {
  var data = htmlToText.fromString(htmlString, {
    wordwrap: 130
  });
  return data;
}

var Product = function () {
  function Product(html, url) {
    _classCallCheck(this, Product);

    this.html = html;
    this.url = url;
  }

  _createClass(Product, [{
    key: 'getResult',
    value: function getResult() {
      var _this = this;

      if (this.html) return this.parseFields(cheerio.load(this.html));

      var url = this.url;
      var p = new Promise(function (resolve, reject) {
        request(url).then(function (result) {
          return resolve(cheerio.load(result));
        }).catch(reject);
      });
      return p.then(function (result) {
        return _this.parseFields(result);
      });
    }
  }, {
    key: 'parseFields',
    value: function parseFields($) {
      var fields = {};
      this.display($);
      fields.priceStores = this.getPriceStores($, fields);
      this.getInfoRows($, fields);
      fields.documents = this.getDocuments($);
      fields.attributes = this.getAttrRows($, fields);
      return R.map(function (field) {
        return field === '' ? undefined : field;
      }, fields);
    }
  }, {
    key: 'getAmount',
    value: function getAmount($) {
      var that = this;
      var amount = getData($('.availability').html()).split(' ')[0];
      amount = parseInt(amount.replace(',', ''));
      return amount;
    }
  }, {
    key: 'display',
    value: function display($) {
      var that = this;
      $('[itemprop]').each(function (i, elem) {
        var name = $(elem).attr('itemprop');
        var value = getData($(elem).html());
        // console.log(`name:${name}, value:${value}`);
      });
    }
  }, {
    key: 'getCategory',
    value: function getCategory($) {
      var that = this;
      var categoryCnt = $('#breadcrumb li').length;
      var category = getData($($('#breadcrumb li')[categoryCnt - 1]).html());
      category = _lodash2.default.trim(category.split('[')[0]);
      return category;
    }
  }, {
    key: 'getDescription',
    value: function getDescription($) {
      var that = this;
      var descElement = $('#fnb_features li');
      if (descElement.length == 0) return '';
      var description = '';

      $(descElement).each(function (i, elem) {
        description = description + getData($(elem).html()) + ',';
      });
      return description;
    }
  }, {
    key: 'getInfoRows',
    value: function getInfoRows($, initFields) {
      var fields = initFields;
      var infoRows = [];

      try {
        var that = this;

        $('[itemprop]').each(function (i, elem) {
          var name = $(elem).attr('itemprop');
          var value = getData($(elem).html());
          if (name.indexOf('manufacturer') != -1) fields.mfs = value;
          if (name.indexOf('sku') != -1) fields.sku = value;
          if (name.indexOf('mpn') != -1) fields.pn = value;
        });
        var description = that.getDescription($);
        if (description) fields.description = description;
        fields.category = that.getCategory($);
        fields.amount = this.getAmount($);
      } catch (e) {
        console.error('e:', e.message);
      }
      return fields;
    }
  }, {
    key: 'getDocuments',
    value: function getDocuments($) {
      var that = this;
      var docRows = [];
      var docs = [];
      var docUrl = $('#technicalData a').attr('href');
      docs.push(docUrl);
      return docs;
    }

    // 規格

  }, {
    key: 'getAttrRows',
    value: function getAttrRows($, fields) {
      var that = this;
      var attrThRows = [];
      var attrTdRows = [];
      var attrs = [];

      $('.pdpProductContent .collapsable-content dt').each(function (i, elem) {
        var title = getData($(elem).html());
        var value = getData($(elem).next().html());
        if (value) {
          var obj = {};
          obj.key = title;
          obj.value = value;
          attrs.push(obj);
        }
      });
      return attrs;
    }
  }, {
    key: 'getCurrency',
    value: function getCurrency($) {
      var that = this;
      var currency = $('[itemprop=priceCurrency]').html();
      return currency;
    }
  }, {
    key: 'getPriceStoresAmount',
    value: function getPriceStoresAmount($, elem) {
      return parseInt(getData($(elem).html()).replace('+', ''));
    }
  }, {
    key: 'getPriceStoresPrice',
    value: function getPriceStoresPrice($, elem, currency) {
      var price = getData($(elem).next().html()).replace(currency, '');
      return price;
    }
  }, {
    key: 'getPriceStores',
    value: function getPriceStores($, fields) {
      var that = this;
      var currency = void 0;
      currency = that.getCurrency($);
      fields.currency = currency;
      var priceCollection = [];
      var firstObj = {};

      $('.tableProductDetailPrice .qty').each(function (i, elem) {
        var obj = {};
        obj.amount = that.getPriceStoresAmount($, elem);
        obj.unitPrice = that.getPriceStoresPrice($, elem, currency);
        priceCollection.push(obj);
      });
      return priceCollection;
    }
  }]);

  return Product;
}();

exports.default = Product;