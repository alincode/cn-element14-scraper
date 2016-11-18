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
      fields.priceStores = this.getPriceStores($, fields);
      this.getInfoRows($, fields);
      fields.documents = this.getDocuments($);
      fields.attributes = this.getAttrRows($, fields);
      return R.map(function (field) {
        return field === '' ? undefined : field;
      }, fields);
    }
  }, {
    key: 'getLead',
    value: function getLead(val) {
      return;
    }
  }, {
    key: 'getRohs',
    value: function getRohs(val) {
      return;
    }
  }, {
    key: 'getAmount',
    value: function getAmount($) {
      var that = this;
      return;
    }
  }, {
    key: 'getCategory',
    value: function getCategory($) {
      var that = this;
      var categoryCnt = $('#breadcrumb li').length;
      var category = that.getData($($('#breadcrumb li')[categoryCnt - 1]).html());
      category = _lodash2.default.trim(category.split('[')[0]);
      return category;
    }
  }, {
    key: 'getDescription',
    value: function getDescription($) {
      var that = this;
      var description = '';
      $('.rangeOverview').each(function (i, elem) {
        description += that.getData($(elem).html());
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
        fields.sku = that.getData($('[itemprop=sku]').html());
        fields.pn = that.getData($('[itemprop=mpn]').html());
        fields.mfs = that.getData($('[itemprop=brand]').html());
        fields.description = that.getDescription($);

        fields.category = that.getCategory($);
      } catch (e) {
        console.error('e:', e.message);
      }
      return fields;
    }
  }, {
    key: 'getData',
    value: function getData(htmlString) {
      var data = htmlToText.fromString(htmlString, {
        wordwrap: 130
      });
      return data;
    }
  }, {
    key: 'getDocuments',
    value: function getDocuments($) {
      var that = this;
      var docRows = [];
      var docs = [];
      var docUrl = $('.techRefLink a').attr('onclick').split('\'')[1];
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

      $('.specTableContainer .column2').each(function (i, elem) {
        var title = that.getData($(elem).html());
        var value = that.getData($(elem).next().html());
        if (value) {
          var obj = {};
          obj.key = title;
          obj.value = value;
          attrs.push(obj);

          if (title == '商品信息') fields.description = value;
        }
      });
      return attrs;
    }
  }, {
    key: 'getCurrency',
    value: function getCurrency($) {
      var that = this;
      var currency = $('[itemprop=priceCurrency]').attr('content');
      return currency;
    }
  }, {
    key: 'getPriceStoresPrice',
    value: function getPriceStoresPrice($, elem) {
      return parseInt($(elem).find('span').html());
    }
  }, {
    key: 'getPriceStores',
    value: function getPriceStores($, fields) {
      var that = this;
      fields.currency = that.getCurrency($);
      var priceCollection = [];
      var firstObj = {};
      firstObj.amount = 1;
      firstObj.unitPrice = $('[itemprop=price]').html();
      priceCollection.push(firstObj);

      $('.value-row .breakRangeWithoutUnit').each(function (i, elem) {
        var obj = {};
        obj.amount = that.getPriceStoresPrice($, elem);
        obj.unitPrice = $(elem).next().find('[itemprop=price]').html();
        priceCollection.push(obj);
      });
      return priceCollection;
    }
  }]);

  return Product;
}();

exports.default = Product;